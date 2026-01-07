'use server';

import { generateJSON } from '@/lib/ai/gemini';

export async function generateDesignOverridesAction(mood: string) {
    try {
        const prompt = `
            You are an elite Brand & Editorial Designer. 
            Translate the following "Design Mood" description into a precise technical theme configuration.
            
            MOOD: "${mood}"
            
            Return ONLY a valid JSON object with these fields:
            {
                "backgroundColor": "Hex code for page background",
                "textColor": "Hex code for main text",
                "accentColor": "Hex code for accents/primary elements",
                "fontFamily": "Inter, sans-serif | Roboto, sans-serif | Georgia, serif | Open Sans, sans-serif | JetBrains Mono, monospace",
                "headingFontFamily": "Inter, sans-serif | Playfair Display, serif | Montserrat, sans-serif | Oswald, sans-serif | Lora, serif",
                "borderRadius": number (0-60),
                "borderWidth": number (0-10),
                "shadowDepth": "none" | "soft" | "medium" | "hard" | "inner",
                "fontSize": number (14-24),
                "lineHeight": number (1.2-2.0),
                "letterSpacing": number (-2 to 5),
                "paragraphSpacing": number (1.0-2.5)
            }
            
            Think about color theory, legibility, and modern UI trends. If the mood is "Dark Luxury", use deep blacks, gold accents, and elegant serifs. If it's "Tech Minimalist", use clean sans-serifs, high contrast, and subtle shadows.
        `;

        const result = await generateJSON(prompt);
        return { success: true, overrides: result };
    } catch (error: any) {
        console.error('Error generating design overrides:', error);
        return { success: false, error: error.message };
    }
}
