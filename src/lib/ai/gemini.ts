import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY!
const genAI = new GoogleGenerativeAI(apiKey)

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
    } catch (error: any) {
        console.error('Gemini API Error (Text):', error)
        console.error('Prompt content:', prompt.slice(0, 500))
        throw new Error(`Gemini Text Error: ${error.message || 'Unknown'}`)
    }
}

/**
 * Generic function to generate JSON from Gemini
 * Uses Native JSON Mode and a Surgical Sanitization Layer with recursive healing.
 */
export async function generateJSON<T>(prompt: string): Promise<AIResponse<T>> {
    try {
        console.log("Gemini API Request (JSON Mode)...")
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        const usage = response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 }

        console.log("Gemini API Response (JSON Mode) Received. Length:", text.length, "Attempting heal & parse...")

        // 1. Surgical Sanitization of the raw text first to fix control characters inside potential strings
        let sanitizedText = sanitizeJSONString(text);

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
            } catch (e) {
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
    } catch (error: any) {
        console.error('Gemini API Error (JSON Mode):', error)
        throw new Error(`Gemini JSON Error: ${error.message || 'Unknown'}`)
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
        let sanitizedText = sanitizeJSONString(text);
        const startIndex = sanitizedText.indexOf('{');
        if (startIndex === -1) throw new Error("No JSON found");

        let lastEndIndex = sanitizedText.lastIndexOf('}');
        let parsedData: T | null = null;

        while (lastEndIndex > startIndex) {
            const potentialJson = sanitizedText.substring(startIndex, lastEndIndex + 1);
            try {
                parsedData = JSON.parse(potentialJson) as T;
                break;
            } catch (e) {
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
    } catch (error: any) {
        console.error('Gemini Search Error:', error)
        throw new Error(`Gemini Search Error: ${error.message || 'Unknown'}`)
    }
}

/**
 * Sanitizes a string from AI to be valid JSON.
 * Specifically escapes illegal control characters like literal newlines or tabs
 * ONLY when they appear inside a string value.
 * Preserves valid JSON whitespace (newlines/tabs between properties).
 */
function sanitizeJSONString(str: string): string {
    // 1. Identify all string literals in the potential JSON
    return str.replace(/"((?:[^"\\]|\\.)*)"/g, (match, content) => {
        // 2. Within the captured content, fix two main issues:
        // a) Escape literal control chars (newlines, etc)
        // b) Fix invalid escape sequences (lone backslashes)

        let sanitized = content
            // Fix literal control characters
            .replace(/[\u0000-\u001F]+/g, (ctrlMatch: string) => {
                if (ctrlMatch === "\n") return "\\n";
                if (ctrlMatch === "\r") return "\\r";
                if (ctrlMatch === "\t") return "\\t";
                return "";
            })
            // Fix invalid escape sequences: a backslash NOT followed by " \ / b f n r t u
            // Note: we use a negative lookahead to identify backslashes that are lone or followed by invalid chars
            .replace(/\\(?!(["\\\/bfnrt]|u[0-9a-fA-F]{4}))/g, "\\\\");

        return `"${sanitized}"`;
    }).trim();
}
/**
 * Generates an image using Gemini (Imagen 4 Fast)
 * @param prompt The prompt for the image
 * @param params Optional parameters (skipText, style, etc)
 * @returns Base64 image data or null
 */
export async function generateImageGemini(prompt: string, params: any = {}): Promise<string | null> {
    try {
        if (!apiKey) {
            throw new Error("GOOGLE_API_KEY is missing. Please set it in environment variables.");
        }

        console.log("Gemini API Request (Image Generation) - REST Predict endpoint...")

        let enhancedPrompt = prompt;
        if (params.style) enhancedPrompt = `[Style: ${params.style}] ${enhancedPrompt}`;
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
    } catch (error: any) {
        console.error('Gemini Image Error Detailed:', error);
        throw new Error(`Gemini Image Error: ${error.message || 'Unknown'}`);
    }
}
