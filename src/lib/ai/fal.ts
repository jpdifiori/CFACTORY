import * as fal from "@fal-ai/serverless-client";

/**
 * Generates an image using fal.ai (Flux)
 * @param prompt The prompt for the image
 * @param params Optional overrides (size, steps, etc)
 * @returns The final image URL
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateImageFal(prompt: string, params: Record<string, any> = {}): Promise<string> {
    const falKey = process.env.FAL_KEY || process.env.NEXT_PUBLIC_FAL_KEY;

    if (!falKey) {
        console.error("FAL_KEY is missing in the environment variables.");
        throw new Error("FAL_KEY is missing in the environment variables.");
    }

    // Explicitly set the key for the client
    fal.config({ credentials: falKey });

    try {
        console.log("Fal.ai: Requesting image generation...");

        let enhancedPrompt = prompt;
        // Inject Visual DNA with extreme priority
        const dnaNodes = [];
        if (params.style) dnaNodes.push(`STYLE: ${params.style}`);
        if (params.mood) dnaNodes.push(`MOOD: ${params.mood}`);
        if (params.color_palette) dnaNodes.push(`COLOR PALETTE: ${params.color_palette}`);

        if (dnaNodes.length > 0) {
            enhancedPrompt = `[[VISUAL DNA: ${dnaNodes.join(' | ')}]]\n${enhancedPrompt}`;
        }

        if (params.masterInstructions) enhancedPrompt = `[GLOBAL MASTER RULES: ${params.masterInstructions}] ${enhancedPrompt}`;
        if (params.imageText && !params.skipText) {
            const cleanText = params.imageText.toUpperCase().replace(/"/g, '').replace(/\*/g, '');
            const langNote = params.language ? `(LANGUAGE: ${params.language.toUpperCase()}). ` : '';

            // First directive: Double quotes + strict "no modification" instructions
            enhancedPrompt += `\n\n[MANDATORY RULE: The image MUST feature the EXACT text "${cleanText}". YOU CANNOT MODIFY THIS TEXT. YOU MUST COPY AND PASTE IT EXACTLY AS IT IS. ${langNote}YOU MUST RENDER "${cleanText}" WITHOUT ALTERATION. DO NOT TRANSLATE. DO NOT ALTER CHARACTERS.]`;

            // Final directive repetition: Asterisks + repetition of strict rules
            enhancedPrompt += `\n\n[FINAL REPETITION: THE TEXT MUST BE EXACTLY *${cleanText}*. YOU CANNOT MODIFY THIS TEXT. YOU MUST COPY AND PASTE IT EXACTLY AS IT IS. RENDER *${cleanText}* WITHOUT ANY CHANGES.]`;
        } else if (params.skipText) {
            enhancedPrompt += `\n\n[CRITICAL RULE: DO NOT RENDER ANY TEXT, LETTERS, TYPOGRAPHY, OR CHARACTERS ON THIS IMAGE. THE IMAGE MUST BE COMPLETELY CLEAN OF ANY WRITTEN WORDS. DO NOT INCLUDE SIGNS, LOGOS OR WATERMARKS WITH TEXT.]`;
        }

        console.log("Fal.ai: Final Augmented Prompt:", enhancedPrompt);

        interface FalResult {
            images?: { url: string }[];
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await fal.subscribe("fal-ai/flux/dev", {
            input: {
                prompt: enhancedPrompt,
                image_size: params.image_size || "square_hd",
                num_inference_steps: params.num_inference_steps || 28,
                guidance_scale: params.guidance_scale || 3.5,
                enable_prompt_expansion: false,
                num_images: 1,
                enable_safety_checker: true,
            },
            pollInterval: 2000,
        }) as unknown as FalResult;

        if (result.images && result.images.length > 0) {
            console.log("Fal.ai: Image generated successfully!");
            return result.images[0].url;
        }

        throw new Error("Fal.ai: No image returned from API");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        console.error("Fal.ai Error:", error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Fal.ai Image Error: ${message}`);
    }
}
