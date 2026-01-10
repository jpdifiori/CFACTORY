'use server'

import { generateImageFal } from '@/lib/ai/fal'
import { generateImageGemini } from '@/lib/ai/gemini'
import { createClient } from '@/utils/supabase/server'
import { recordAIUsageAction } from './usageActions'
import { Database } from '@/types/database.types'
import { EditorStyle } from '@/components/content/SmartTextEditor';
import { SupabaseClient } from '@supabase/supabase-js';
import { SafeSelectBuilder, SafeUpdateBuilder } from '@/utils/supabaseSafe'

type ContentItem = Database['public']['Tables']['content_queue']['Row']
type ContentUpdate = Database['public']['Tables']['content_queue']['Update']
type Json = Database['public']['Tables']['content_queue']['Row']['gemini_output'] // safe way to get Json type

export interface ImageGenerationParams {
    engine?: 'fal' | 'gemini'
    customText?: string
    imageText?: string
    customStyle?: EditorStyle
    skipText?: boolean
    [key: string]: unknown
}

/**
 * Triggers image generation for a content item and updates the database
 */
export async function triggerImageGenerationAction(itemId: string, prompt: string, params?: ImageGenerationParams) {
    const supabase = (await createClient()) as SupabaseClient<Database>;

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
                // Using standard client is fine here as it infers correctly usually,
                // but we can use SafeSelectBuilder if strictness fails.
                const { data: rawItemData } = await (supabase
                    .from('content_queue') as unknown as SafeSelectBuilder<'content_queue'>)
                    .select('project_id')
                    .eq('id', itemId)
                    .single()
                const itemData = rawItemData as ContentItem | null

                const targetFolder = itemData?.project_id || user.id;

                // Upload base64 to Supabase Storage
                const fileName = `${targetFolder}/${itemId}-${Date.now()}.png`;
                const { error: uploadError } = await supabase.storage
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

        // Record AI Usage IMMEDIATELY after generation
        await recordAIUsageAction(
            5000,
            engine === 'gemini' ? 'imagen-4' : 'flux-pro',
            'Image Generation',
            0,
            0
        );

        // 4. PRESERVE RAW AS BACKGROUND (Crucial for later edits)
        // We do this first to ensure we have a fallback, but we'll update everything else at the end
        const updateData: ContentUpdate = { image_url: imageUrl };
        await (supabase.from('content_queue') as unknown as SafeUpdateBuilder<'content_queue'>)
            .update(updateData)
            .eq('id', itemId);

        // 5. Automatic Smart Placement or Custom Text Baking
        let finalDisplayUrl = imageUrl;
        const overlayText = params?.customText || params?.imageText;
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
                    style: overlayStyle // typed via ImageGenerationParams
                });
                if (bakeRes.success && bakeRes.url) {
                    finalDisplayUrl = bakeRes.url;
                }
            }
        }

        // 6. FINAL SINGLE DB UPDATE (Status, Text, Style, URLs)
        const finalUpdate: ContentUpdate = {
            overlay_text_content: overlayText,
            overlay_style_json: overlayStyle as unknown as Json,
            image_final_url: finalDisplayUrl,
            status: 'Approved'
        };
        const { error: finalError } = await (supabase.from('content_queue') as unknown as SafeUpdateBuilder<'content_queue'>)
            .update(finalUpdate)
            .eq('id', itemId);

        if (finalError) throw finalError;

        // 7. RECORD VISION USAGE if analysis was performed
        if (overlayStyle && !params?.customStyle) {
            await recordAIUsageAction(
                1500,
                'gemini-1.5-flash-vision',
                'Smart Placement analysis',
                0,
                0
            );
        }

        return { success: true, url: finalDisplayUrl };
    } catch (error: unknown) {
        console.error("Image Action Error:", error);

        // Update database with failure status
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                const errorUpdate: ContentUpdate = {
                    status: 'Review_Required',
                    gemini_output: {
                        error: `Image Gen Failed: ${message}`
                    }
                };
                await (supabase.from('content_queue') as unknown as SafeUpdateBuilder<'content_queue'>)
                    .update(errorUpdate)
                    .eq('id', itemId)
                    .eq('user_id', currentUser.id);
            }
        } catch (dbError) {
            console.error("Failed to update error status in DB:", dbError);
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
    }
}

/**
 * Analyzes an image using Gemini Vision to find the best place for text overlay
 */
export async function analyzeImageForPlacementAction(imageUrl: string) {
    try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey || '');
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
    } catch (error: unknown) {
        console.error("Image Analysis Error:", error);
        const message = error instanceof Error ? error.message : "Analysis failed";
        return { success: false, error: message };
    }
}

/**
 * Persists the text overlay onto the physical image using Sharp
 */
export async function bakeImageWithTextAction(itemId: string, config: {
    text: string,
    style: EditorStyle
}) {
    const supabase = (await createClient()) as SupabaseClient<Database>;
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // 1. Fetch current item info
        const { data: itemData } = await (supabase.from('content_queue') as unknown as SafeSelectBuilder<'content_queue'>)
            .select('image_url, image_final_url, project_id')
            .eq('id', itemId)
            .single();
        const item = itemData as ContentItem | null;

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
        const safeX = config.style.x ?? 50;
        const safeY = config.style.y ?? 50;

        const posX = (safeX / 100) * width;
        const posY = (safeY / 100) * height;

        const lines = (config.text || '').split('\n');

        // FONT SCALING FIX
        let fontSize = config.style.fontSize || 54;
        // Check if style has containerWidth (EditorStyle doesn't have it explicitly, so check as any or optional)
        const styleWithContainer = config.style as EditorStyle & { containerWidth?: number };
        if (styleWithContainer.containerWidth) {
            const scaleFactor = width / styleWithContainer.containerWidth;
            fontSize = Math.round(fontSize * scaleFactor);
        }

        const shadowIntensity = (config.style as EditorStyle).shadowIntensity ?? 0.8;
        const opacity = (config.style as EditorStyle).opacity ?? 1;

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

        const lineHeight = fontSize * 1.1; // Match editor's estimated line-height
        const totalHeight = lines.length * lineHeight;

        // CENTER ANCHOR LOGIC
        // posY is the center. To make it the center, we start half the total height above posY.
        // We add an adjustment for the first line's baseline (roughly 0.8 * fontSize)
        const startY = posY - (totalHeight / 2) + (fontSize * 0.8);

        const svgContent = lines.map((line, i) => {
            const currentY = startY + (i * lineHeight);
            // Handle empty lines by using a non-breaking space or just the coordinate
            const content = line.trim().length === 0 ? '&#160;' : escapeXml(line);
            return `<tspan x="${posX}" y="${currentY}">${content}</tspan>`;
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

        const { error: uploadError } = await supabase.storage
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
        const bakedUpdate: ContentUpdate = {
            image_final_url: publicUrl,
            overlay_text_content: config.text,
            overlay_style_json: config.style as unknown as Json
        };
        const { error: dbError } = await (supabase.from('content_queue') as unknown as SafeUpdateBuilder<'content_queue'>)
            .update(bakedUpdate)
            .eq('id', itemId);

        if (dbError) throw dbError;

        return { success: true, url: publicUrl };
    } catch (error: unknown) {
        console.error("Bake Image Error:", error);
        const message = error instanceof Error ? error.message : "Baking failed";
        return { success: false, error: message };
    }
}
