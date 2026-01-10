import { generateImageFal } from './fal';
import { createClient } from '@/utils/supabase/server';
import { marked } from 'marked';

/**
 * Robust Markdown/HTML to HTML converter using the 'marked' library.
 * Optimized for vertical flow and high-end editorial formatting.
 */
function mdToHtml(md: string): string {
    if (!md) return '';

    // 1. Initial normalization
    const text = md.trim()
        .replace(/\r\n/g, '\n');

    // 2. Parse using marked
    // We configure marked to be as resilient as possible
    const html = marked.parse(text, {
        breaks: true, // Follow Instruction 1: ensure line breaks are respected
        gfm: true
    }) as string;

    // 3. Final cleanup (ensure semantic wraps if needed, though marked usually handles this)
    return html;
}

/**
 * Stitching Service
 * Finds [IMAGE_PROMPT: ...] placeholders in markdown,
 * generates images via FAL.ai, uploads them to Supabase Storage,
 * and replaces placeholders with <img> tags.
 */
export async function stitchImages(
    content: string,
    projectId: string,
    userId: string
): Promise<string> {
    const supabase = await createClient();

    // 1. Convert Markdown to HTML early
    const htmlContent = mdToHtml(content);

    // 2. Find all image prompts using Regex (now in HTML context)
    const imagePromptRegex = /\[IMAGE_PROMPT:\s*([^\]]+)\]/g;
    const matches = Array.from(htmlContent.matchAll(imagePromptRegex));

    if (matches.length === 0) return htmlContent;

    console.log(`Stitching Service: Found ${matches.length} image prompts.`);

    // 3. Prepare parallel generation tasks
    const generationTasks = matches.map(async (match, index) => {
        const fullMatch = match[0];
        const promptText = match[1].trim();

        try {
            // Generate via FAL.ai (Flux)
            const falUrl = await generateImageFal(promptText, {
                image_size: 'landscape_4_3', // Professional default for ebooks/blogs
                enable_prompt_expansion: false
            });

            // Download image to buffer
            const response = await fetch(falUrl);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Upload to Supabase Storage
            const fileName = `premium-forge/${projectId}/${userId}-${Date.now()}-${index}.png`;
            const { error: uploadError } = await supabase.storage
                .from('project-images')
                .upload(fileName, buffer, {
                    contentType: 'image/png',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('project-images')
                .getPublicUrl(fileName);

            return {
                placeholder: fullMatch,
                replacement: `<div class="content-image-wrapper my-20 py-8 flex flex-col items-center">
                    <img src="${publicUrl}" alt="${promptText.slice(0, 50)}..." class="rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/5 max-w-[90%] md:max-w-[800px] h-auto transition-transform hover:scale-[1.02] duration-500" />
                </div>`
            };
        } catch (error) {
            console.error(`Stitching Error for prompt "${promptText}":`, error);

            // Stylish Fallback: Using Unsplash Source or a Dynamic Gradient
            const fallbackUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop`; // Minimalist abstract

            return {
                placeholder: fullMatch,
                replacement: `<div class="content-image-wrapper my-20 py-8 flex flex-col items-center opacity-80 backdrop-blur-sm">
                    <div class="relative group">
                        <img src="${fallbackUrl}" alt="Placeholder" class="rounded-[2.5rem] grayscale sepia-[.2] contrast-[1.1] max-w-[90%] md:max-w-[800px] h-auto border border-white/5 shadow-2xl" />
                        <div class="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[2.5rem]">
                            <p class="text-[10px] font-black text-white uppercase tracking-[0.5em] text-center px-10">Image pending production: ${promptText.slice(0, 30)}...</p>
                        </div>
                    </div>
                </div>`
            };
        }
    });

    // 4. Execute concurrently
    const results = await Promise.all(generationTasks);

    // 5. Perform replacements
    let finalContent = htmlContent;
    results.forEach(res => {
        finalContent = finalContent.replace(res.placeholder, res.replacement);
    });

    return finalContent;
}
