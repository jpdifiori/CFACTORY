'use server'

import { generateSearchJSON } from '@/lib/ai/gemini'
import { recordAIUsageAction } from './usageActions'

export interface StrategyCard {
    title: string;
    description: string;
    keywords: string[];
    patterns?: string[];
    hooks?: string[];
    niche_gap?: string;
}

export interface StrategyResponse {
    success: boolean;
    seo_card: StrategyCard;
    viral_card: StrategyCard;
    authority_card: StrategyCard;
    scorecard: {
        viral_potential: number; // 1-100
        projected_reach: string;
        reasoning: string;
    };
    error?: string;
}

export async function calculateStrategyAction(
    topic: string,
    orientation: string = 'General Audience',
    problem: string = 'General Context',
    language: string = 'en'
): Promise<StrategyResponse> {
    try {
        const langPrompt = language === 'es' ? 'RESPONSE MUST BE IN SPANISH.' : 'RESPONSE MUST BE IN ENGLISH.';
        const prompt = `
            ACT AS A SENIOR CONTENT STRATEGIST & TREND ANALYST.
            ${langPrompt}
            
            INPUT CONTEXT:
            - CAMPAIGN TOPIC: "${topic}"
            - TARGET ORIENTATION: "${orientation}"
            - PROBLEM SOLVED: "${problem}"
            
            USE YOUR GOOGLE SEARCH CAPABILITY TO FIND:
            1. RELEVANT SEARCH VOLUME AND SEO TRENDS.
            2. VIRAL PATTERNS ON TIKTOK/INSTAGRAM FOR THIS SPECIFIC NICHE.
            3. CONTENT GAPS WHERE COMPETITORS ARE FAILING (NICHE AUTHORITY).

            
            OUTPUT A JSON STRUCTURE TO DRIVE A CONTENT CREATION STRATEGY.
            
            JSON FORMAT:
            {
                "seo_card": {
                    "title": "SEO & Search Volume",
                    "description": "Analysis of search intent and volume.",
                    "keywords": ["kw1", "kw2", "kw3"]
                },
                "viral_card": {
                    "title": "Viral Hooks & Patterns",
                    "description": "What's working on short-form social media.",
                    "patterns": ["pattern1", "pattern2"],
                    "hooks": ["hook1", "hook2"]
                },
                "authority_card": {
                    "title": "Niche Authority & Depth",
                    "description": "Deep-dive analysis of missing value.",
                    "keywords": ["advanced_term1"],
                    "niche_gap": "Description of the gap in current market content."
                },
                "scorecard": {
                    "viral_potential": 85,
                    "projected_reach": "50k - 200k estimated impressions",
                    "reasoning": "Brief explanation of why this score was given based on current trends."
                }
            }
            
            STRICT RULES:
            - PROVIDE REAL DATA DERIVED FROM SEARCH.
            - DO NOT USE PLACEHOLDERS.
            - ENSURE THE JSON IS VALID.
            - START YOUR RESPONSE WITH '{' AND END WITH '}'.
        `;

        const response = await generateSearchJSON<any>(prompt);
        const result = response.data;
        const usage = response.usage;

        console.log("Strategy AI Result:", JSON.stringify(result, null, 2));

        // Record Usage
        await recordAIUsageAction(
            usage.total_tokens,
            'gemini-2.0-flash',
            'Market Intelligence Strategy',
            usage.prompt_tokens,
            usage.candidates_tokens
        );

        if (!result || !result.scorecard) {
            throw new Error("AI returned an incomplete strategy structure.");
        }

        return {
            success: true,
            seo_card: result.seo_card || { title: 'SEO', description: 'No data', keywords: [] },
            viral_card: result.viral_card || { title: 'Viral', description: 'No data', keywords: [] },
            authority_card: result.authority_card || { title: 'Authority', description: 'No data', keywords: [] },
            scorecard: result.scorecard
        };
    } catch (error: any) {
        console.error("Strategy Action Error:", error);
        return {
            success: false,
            seo_card: { title: 'Error', description: 'Failed to generate strategy', keywords: [] } as any,
            viral_card: { title: 'Error', description: error.message, keywords: [] } as any,
            authority_card: { title: 'Error', description: 'Please try again', keywords: [] } as any,
            scorecard: { viral_potential: 0, projected_reach: '0', reasoning: error.message } as any,
            error: error.message
        };
    }
}

export async function generateInstructionsAction(
    type: 'copy' | 'visual',
    context: { topic: string; orientation: string; problem: string; objective: string },
    language: string = 'en'
): Promise<{ success: boolean; content: string; error?: string }> {
    try {
        const langPrompt = language === 'es' ? 'RESPONSE MUST BE IN SPANISH.' : 'RESPONSE MUST BE IN ENGLISH.';
        const prompt = `
            ACT AS A MASTER ${type === 'copy' ? 'COPYWRITER' : 'VISUAL ART DIRECTOR'}.
            ${langPrompt}

            CONTEXT:
            - Topic: ${context.topic}
            - Audience: ${context.orientation}
            - Problem: ${context.problem}
            - Objective: ${context.objective}

            TASK:
            Generate a detailed "Master Prompt" or instruction block for an AI ${type === 'copy' ? 'Writer' : 'Image Generator'}.
            This block will be used to guide the creation of all campaign content.
            
            ${type === 'copy' ? `
            Focus on: Tone of voice, psychological triggers, length, formatting, and specific "no-go" words.
            ` : `
            Focus on: Lighting, composition, color theory, texture, camera angles, and style (minimalist, cinematic, etc).
            `}

            RETURN ONLY THE TEXT FOR THE INSTRUCTIONS. NO INTRO OR OUTRO.
        `;

        const response = await generateSearchJSON<{ instructions: string }>(`
            ${prompt}
            RETURN JSON: { "instructions": "the text here" }
        `);

        const result = response.data;
        const usage = response.usage;

        // Record Usage
        await recordAIUsageAction(
            usage.total_tokens,
            'gemini-2.0-flash',
            `Master ${type} Instructions`,
            usage.prompt_tokens,
            usage.candidates_tokens
        );

        return {
            success: true,
            content: result.instructions
        };
    } catch (error: any) {
        console.error("Generate Instructions Error:", error);
        return {
            success: false,
            content: '',
            error: error.message
        };
    }
}
