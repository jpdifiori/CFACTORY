'use server'

import { generateImageFal } from '@/lib/ai/fal'
import { generateImageGemini } from '@/lib/ai/gemini'
import { createClient } from '@/utils/supabase/server'
import { recordAIUsageAction } from './usageActions'

/**
 * Triggers image generation for a content item and updates the database
 */
export async function triggerImageGenerationAction(itemId: string, prompt: string, params?: any) {
    const supabase = await createClient();

    try {
        // 1. Authenticate user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        console.log(`Image Action: User ${user.id} starting generation for item ${itemId}...`);

        // 2. Verify ownership indirectly via RLS or by checking the item
        // Even without explicit check here, the subsequent update will fail if RLS is on 
        // and the user doesn't own the row.

        // 3. Generate image based on selected engine
        let imageUrl: string | null = null;
        const engine = params?.engine || 'fal';

        if (engine === 'gemini') {
            const base64Data = await generateImageGemini(prompt, params);
            if (base64Data) {
                // Fetch project_id for this item to match RLS policies
                const { data: itemData } = await (supabase.from('content_queue')
                    .select('project_id')
                    .eq('id', itemId)
                    .single() as any);

                const targetFolder = itemData?.project_id || user.id;

                // Upload base64 to Supabase Storage
                const fileName = `${targetFolder}/${itemId}-${Date.now()}.png`;
                const { data, error: uploadError } = await supabase.storage
                    .from('project-images')
                    .upload(fileName, Buffer.from(base64Data, 'base64'), {
                        contentType: 'image/png',
                        upsert: false // Use false to avoid potential UPDATE policy requirements
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('project-images')
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            }
        } else {
            imageUrl = await generateImageFal(prompt, params);
        }

        if (!imageUrl) throw new Error("Failed to generate image URL");

        // 4. PRESERVE RAW AS BACKGROUND (Crucial for later edits)
        // We do this first to ensure we have a fallback, but we'll update everything else at the end
        await (supabase.from('content_queue') as any)
            .update({ image_url: imageUrl })
            .eq('id', itemId);

        // 5. Automatic Smart Placement or Custom Text Baking
        let finalDisplayUrl = imageUrl;
        let overlayText = params?.customText || params?.imageText;
        let overlayStyle = params?.customStyle || null;

        if (imageUrl && overlayText) {
            // Only perform AI placement if the user hasn't provided their own style
            if (!overlayStyle) {
                console.log(`Image Action: Auto-analyzing placement for ${itemId}...`);
                const analysisResult = await analyzeImageForPlacementAction(imageUrl);

                if (analysisResult.success && analysisResult.analysis) {
                    const { x, y, suggestedColor } = analysisResult.analysis;
                    overlayStyle = {
                        x,
                        y,
                        fontSize: 54,
                        fontFamily: 'Bebas Neue',
                        color: suggestedColor === 'white' ? '#ffffff' : '#111111',
                        shadowIntensity: 0.8,
                        opacity: 1
                    };
                }
            }

            // BAKE IMMEDIATELY! 
            if (!params?.skipText && overlayText && overlayStyle) {
                console.log(`Image Action: Baking text for ${itemId}...`);
                const bakeRes = await bakeImageWithTextAction(itemId, {
                    text: overlayText,
                    style: overlayStyle as any
                });
                if (bakeRes.success && bakeRes.url) {
                    finalDisplayUrl = bakeRes.url;
                }
            }
        }

        // 6. FINAL SINGLE DB UPDATE (Status, Text, Style, URLs)
        const { error: finalError } = await (supabase.from('content_queue') as any)
            .update({
                overlay_text_content: overlayText,
                overlay_style_json: overlayStyle,
                image_final_url: finalDisplayUrl,
                status: 'Approved'
            })
            .eq('id', itemId);

        if (finalError) throw finalError;

        // Record AI Usage (Fixed cost for images)
        await recordAIUsageAction(
            5000,
            engine === 'gemini' ? 'imagen-4' : 'flux-pro',
            'Image Generation',
            0,
            0
        );

        return { success: true, url: finalDisplayUrl };
    } catch (error: any) {
        console.error("Image Action Error:", error);

        // Update database with failure status
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
                await (supabase.from('content_queue') as any)
                    .update({
                        status: 'Review_Required',
                        gemini_output: {
                            error: `Image Gen Failed: ${error.message || 'Unknown'}`
                        }
                    })
                    .eq('id', itemId)
                    .eq('user_id', currentUser.id);
            }
        } catch (dbError) {
            console.error("Failed to update error status in DB:", dbError);
        }

        return { success: false, error: error.message };
    }
}

/**
 * Analyzes an image using Gemini Vision to find the best place for text overlay
 */
export async function analyzeImageForPlacementAction(imageUrl: string) {
    try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Fetch image and convert to base64
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');

        const prompt = `Analyze this image and return a JSON object with:
        1. "x": Float (0-100) - best horizontal position for a text overlay to be in negative/empty space.
        2. "y": Float (0-100) - best vertical position for a text overlay. PREFER THE UPPER THIRD OF THE IMAGE (y between 10 and 35) if there is clear space.
        3. "luminosity": Integer (0-100) - average brightness of that specific area.
        4. "suggestedColor": "white" or "black" based on high contrast vs area luminosity.
        
        Focus on finding areas that are blurred, empty skies, or solid backgrounds where text is most legible without obscuring the main subjects.
        Return ONLY the JSON.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg"
                }
            }
        ]);

        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Failed to parse analysis result");

        const analysis = JSON.parse(jsonMatch[0]);
        return { success: true, analysis };
    } catch (error: any) {
        console.error("Image Analysis Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Persists the text overlay onto the physical image using Sharp
 */
export async function bakeImageWithTextAction(itemId: string, config: {
    text: string,
    style: {
        x: number,
        y: number,
        fontSize: number,
        fontFamily: string,
        color: string,
        text?: string
    }
}) {
    const supabase = await createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // 1. Fetch current item info
        const { data: item } = await (supabase.from('content_queue')
            .select('image_url, image_final_url, project_id')
            .eq('id', itemId)
            .single() as any);

        // Use image_url (the raw background) if available. 
        // This is crucial to avoid baking text on top of already baked text.
        const sourceUrl = item?.image_url || item?.image_final_url;
        if (!sourceUrl) throw new Error("No image found to bake");

        // 2. Fetch image buffer
        const response = await fetch(sourceUrl);
        const imageBuffer = Buffer.from(await response.arrayBuffer());

        // 3. Import sharp
        const sharp = (await import('sharp')).default;
        const metadata = await sharp(imageBuffer).metadata();
        const width = metadata.width || 1024;
        const height = metadata.height || 1024;

        // 4. Create SVG Overlay
        const posX = (config.style.x / 100) * width;
        const posY = (config.style.y / 100) * height;

        const lines = (config.text || '').split('\n').filter(l => l.trim().length > 0);

        // FONT SCALING FIX
        // If the frontend provided the editor's width, use it to calculate the scale factor.
        // Otherwise, fall back to the raw fontSize (which caused the mismatch).
        let fontSize = config.style.fontSize || 54;
        if ((config.style as any).containerWidth) {
            const scaleFactor = width / (config.style as any).containerWidth;
            console.log(`[BAKER] Scaling font by ${scaleFactor.toFixed(2)} (Img: ${width} / Editor: ${(config.style as any).containerWidth})`);
            fontSize = Math.round(fontSize * scaleFactor);
        }

        const shadowIntensity = (config.style as any).shadowIntensity ?? 0.8;
        const opacity = (config.style as any).opacity ?? 1;

        // Escape XML sensitive characters
        const escapeXml = (unsafe: string) => unsafe.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
        });

        const lineHeight = fontSize * 1.2;
        const totalHeight = lines.length * lineHeight;

        // Match CSS "top" behavior:
        // posY is the top of the first line's bounding box.
        // SVG <tspan> y is the baseline. We add approx 0.85 of fontSize to hit the first baseline.
        const startY = posY + (fontSize * 0.85);

        const svgContent = lines.map((line, i) => {
            const currentY = startY + (i * lineHeight);
            return `<tspan x="${posX}" y="${currentY}">${escapeXml(line.toUpperCase())}</tspan>`;
        }).join('');

        const shadowColor = `rgba(0,0,0,${Math.min(0.9, shadowIntensity)})`;
        const shadowBlur = (8 * shadowIntensity).toFixed(1);
        const shadowOffset = (4 * shadowIntensity).toFixed(1);

        const svgOverlay = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <style>
                    .text { 
                        fill: ${config.style.color || '#ffffff'}; 
                        font-size: ${fontSize}px; 
                        font-family: "${config.style.fontFamily || 'Bebas Neue'}", "Impact", "Arial Black", "Arial", sans-serif; 
                        font-weight: 900;
                        text-anchor: middle;
                        opacity: ${opacity};
                        filter: drop-shadow(0px ${shadowOffset}px ${shadowBlur}px ${shadowColor});
                    }
                </style>
                <text class="text">${svgContent}</text>
            </svg>
        `;

        console.log(`[BAKER] Final Render for ID=${itemId}. Lines=${lines.length}, Pos=(${posX.toFixed(0)},${posY.toFixed(0)})`);

        // 5. Composite
        const bakedBuffer = await sharp(imageBuffer)
            .composite([{
                input: Buffer.from(svgOverlay),
                top: 0,
                left: 0
            }])
            .jpeg({ quality: 90 })
            .toBuffer();

        // 6. Upload new version to Supabase
        const targetFolder = item.project_id || user.id;
        const fileName = `${targetFolder}/${itemId}-baked-${Date.now()}.jpg`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('project-images')
            .upload(fileName, bakedBuffer, {
                contentType: 'image/jpeg',
                upsert: false
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('project-images')
            .getPublicUrl(fileName);

        // 7. Update DB
        const { error: dbError } = await (supabase.from('content_queue') as any)
            .update({
                image_final_url: publicUrl,
                overlay_text_content: config.text,
                overlay_style_json: config.style
            })
            .eq('id', itemId);

        if (dbError) throw dbError;

        return { success: true, url: publicUrl };
    } catch (error: any) {
        console.error("Bake Image Error:", error);
        return { success: false, error: error.message };
    }
}
