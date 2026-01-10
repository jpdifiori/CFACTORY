import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
if (!apiKey) {
    console.warn("WARNING: No Gemini/Google API Key found in environment variables.")
}
const genAI = new GoogleGenerativeAI(apiKey || '')

const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 4096,
        temperature: 0.7,
    }
}, { apiVersion: 'v1beta' })

const searchModel = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    tools: [
        {
            google_search: {},
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
    ],
    generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
    }
}, { apiVersion: 'v1beta' })

export interface AIUsage {
    prompt_tokens: number;
    candidates_tokens: number;
    total_tokens: number;
}

export interface AIResponse<T> {
    data: T;
    usage: AIUsage;
}

export async function generateText(prompt: string): Promise<AIResponse<string>> {
    try {
        console.log("Gemini API Request (Text)...")
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        const usage = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 }

        console.log("Gemini API Response (Text) Success.")
        return {
            data: text,
            usage: {
                prompt_tokens: usage.promptTokenCount,
                candidates_tokens: usage.candidatesTokenCount,
                total_tokens: usage.totalTokenCount
            }
        }
    } catch (error: unknown) {
        console.error('Gemini API Error (Text):', error)
        console.error('Prompt content:', prompt.slice(0, 500))
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Gemini Text Error: ${errorMessage}`)
    }
}

/**
 * Generic function to generate JSON from Gemini
 * Uses Native JSON Mode and a Surgical Sanitization Layer with recursive healing.
 */
export async function generateJSON<T>(prompt: string): Promise<AIResponse<T>> {
    let rawText = "";
    let sanitizedText = "";
    try {
        console.log("Gemini API Request (JSON Mode)...")
        const result = await model.generateContent(prompt)
        const response = await result.response
        rawText = response.text()
        const usage = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 }

        console.log("Gemini API Response (JSON Mode) Received. Length:", rawText.length, "Attempting heal & parse...")

        // 1. Surgical Sanitization of the raw text first to fix control characters inside potential strings
        sanitizedText = sanitizeJSONString(rawText);

        // 2. Comprehensive Extraction Strategy
        const startIndex = sanitizedText.indexOf('{');
        if (startIndex === -1) {
            throw new Error("No JSON structure found in AI response.");
        }

        let lastEndIndex = sanitizedText.lastIndexOf('}');
        let parsedData: T | null = null;

        while (lastEndIndex > startIndex) {
            const potentialJson = sanitizedText.substring(startIndex, lastEndIndex + 1);
            try {
                parsedData = JSON.parse(potentialJson) as T;
                break;
            } catch {
                lastEndIndex = sanitizedText.lastIndexOf('}', lastEndIndex - 1);
            }
        }

        if (!parsedData) {
            const jsonMatch = sanitizedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedData = JSON.parse(jsonMatch[0]) as T;
            }
        }

        if (!parsedData) throw new Error("Could not extract any valid JSON structure from response.");

        return {
            data: parsedData,
            usage: {
                prompt_tokens: usage.promptTokenCount,
                candidates_tokens: usage.candidatesTokenCount,
                total_tokens: usage.totalTokenCount
            }
        }
    } catch (error: unknown) {
        console.error('Gemini API Error (JSON Mode):', error)
        console.error('RAW TEXT FROM AI:', rawText)
        console.error('SANITIZED TEXT:', sanitizedText)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Gemini JSON Error: ${errorMessage}`)
    }
}

/**
 * Specialized JSON generation with Google Search grounding.
 */
export async function generateSearchJSON<T>(prompt: string): Promise<AIResponse<T>> {
    try {
        console.log("Gemini API Request (Search + JSON Mode)...")
        const result = await searchModel.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        const usage = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 }

        console.log("Gemini Search Raw Text:", text.slice(0, 1000));
        console.log("Gemini API Response (Search) Received. Parsing JSON...")

        // Use the same healing logic
        const sanitizedText = sanitizeJSONString(text);
        const startIndex = sanitizedText.indexOf('{');
        if (startIndex === -1) throw new Error("No JSON found");

        let lastEndIndex = sanitizedText.lastIndexOf('}');
        let parsedData: T | null = null;

        while (lastEndIndex > startIndex) {
            const potentialJson = sanitizedText.substring(startIndex, lastEndIndex + 1);
            try {
                parsedData = JSON.parse(potentialJson) as T;
                break;
            } catch {
                lastEndIndex = sanitizedText.lastIndexOf('}', lastEndIndex - 1);
            }
        }

        if (!parsedData) throw new Error("Could not extract valid JSON from search response.");

        return {
            data: parsedData,
            usage: {
                prompt_tokens: usage.promptTokenCount,
                candidates_tokens: usage.candidatesTokenCount,
                total_tokens: usage.totalTokenCount
            }
        }
    } catch (error: unknown) {
        console.error('Gemini Search Error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Gemini Search Error: ${errorMessage}`)
    }
}

/**
 * Sanitizes a string from AI to be valid JSON.
 * Specifically escapes illegal control characters like literal newlines or tabs
 * ONLY when they appear inside a string value.
 * Preserves valid JSON whitespace (newlines/tabs between properties).
 */
function sanitizeJSONString(str: string): string {
    // 0. Preliminary cleanup: remove markdown and normalize line endings
    let cleaned = str.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();

    // 1. Defensively escape literal control characters inside what look like string values
    // This regex matches potential string literals, including those broken by newlines
    // We use [\s\S] instead of the 's' flag for better compatibility
    const brokenStringRegex = /"(?:[^"\\]|\\.)*?"/g;

    cleaned = cleaned.replace(brokenStringRegex, (match) => {
        // Fix control characters (0-31) inside the matched string
        return match.replace(/[\x00-\x1F]/g, (char) => {
            if (char === '\n') return '\\n';
            if (char === '\r') return '\\r';
            if (char === '\t') return '\\t';
            const hex = char.charCodeAt(0).toString(16).padStart(4, '0');
            return '\\u' + hex;
        });
    });

    // 2. Final pass for any stray control characters outside strings (except valid whitespaces)
    let final = "";
    for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned[i];
        const code = char.charCodeAt(0);
        if (code < 32 && code !== 10 && code !== 13 && code !== 9) {
            continue; // Drop illegal control characters
        }
        final += char;
    }

    return final;
}

/**
 * Generates an image using Gemini (Imagen 4 Fast)
 * @param prompt The prompt for the image
 * @param params Optional parameters (skipText, style, etc)
 * @returns Base64 image data or null
 */
export async function generateImageGemini(prompt: string, params: Record<string, any> = {}): Promise<string | null> {
    try {
        if (!apiKey) {
            throw new Error("GOOGLE_API_KEY is missing. Please set it in environment variables.");
        }

        console.log("Gemini API Request (Image Generation) - REST Predict endpoint...")

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
            enhancedPrompt += `\n\n[MANDATORY RULE: The image MUST feature the EXACT text "${cleanText}". DO NOT MODIFY THIS TEXT. DO NOT TRANSLATE.]`;
        } else if (params.skipText) {
            enhancedPrompt += `\n\n[CRITICAL RULE: DO NOT RENDER ANY TEXT OR TYPOGRAPHY ON THIS IMAGE. THE IMAGE MUST BE COMPLETELY CLEAN OF ANY WRITTEN WORDS.]`;
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${apiKey}`;

        const body = {
            instances: [
                { prompt: enhancedPrompt }
            ],
            parameters: {
                sampleCount: 1,
                enable_prompt_expansion: false,
                guidance_scale: 3.5,
                num_inference_steps: 28
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini REST API Error:", errorData);
            throw new Error(`Gemini Image Error (${response.status}): ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();

        if (data.predictions && data.predictions.length > 0) {
            const prediction = data.predictions[0];
            return prediction.bytesBase64Encoded;
        }

        console.warn("Gemini: No predictions found in response.", JSON.stringify(data, null, 2));
        return null
    } catch (error: unknown) {
        console.error('Gemini Image Error Detailed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Gemini Image Error: ${errorMessage}`);
    }
}
