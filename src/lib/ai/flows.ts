import { generateJSON, generateText, AIResponse, AIUsage } from './gemini'
import { BlockBlueprint, BlockContent, BlockType } from './block-schemas'
import { Database } from '@/types/database.types'

// --- Types & Constants ---

type Campaign = Database['public']['Tables']['campaigns']['Row']

export interface FlowContext {
    companyName: string
    niche: string
    targetAudience: string
    problemSolved: string
    offering: string
    differential: string
    brandVoice?: string
    topic?: string
    strategicObjective?: string
    target_url?: string | null
    strategyContext?: {
        topic: string
        orientation: string
        problem: string
        differential?: string
        insights?: string
    }
}

export type ContentAngle = 'Educativo' | 'Entretenimiento' | 'Venta Directa' | 'Mito/Verdad' | 'Storytelling'

const CONTENT_ANGLES: ContentAngle[] = ['Educativo', 'Entretenimiento', 'Venta Directa', 'Mito/Verdad', 'Storytelling']

// --- Flow: Idea Generator ---

export interface CampaignIdea {
    title: string
    description: string
    angle: ContentAngle
    visual_prompt: string
    headline_examples: string[]
    image_text_examples: string[]
}

export interface IdeasOutput {
    ideas: CampaignIdea[]
}

export async function runIdeaGeneratorFlow(input: {
    context: FlowContext
    lastPosts: string[]
    objective: string
    language: string
}): Promise<AIResponse<IdeasOutput>> {
    const prompt = `
    Role: Senior Content Strategist.
    Task: Generate 10 unique, high-engagement post ideas for a social media campaign.
    
    Company Context:
    - Name: ${input.context.companyName}
    - Niche: ${input.context.niche}
    - Audience: ${input.context.targetAudience}
    - Problem Solved: ${input.context.problemSolved}
    - Offering: ${input.context.offering}
    - USP/Differential: ${input.context.differential}
    
    CAMPAIGN SPECIFICS (PRIORITIZE THESE):
    - CAMPAIGN TOPIC: ${input.context.topic}
    - STRATEGIC OBJECTIVE: ${input.context.strategicObjective || input.objective}
    - SPECIFIC AUDIENCE FOCUS: ${input.context.targetAudience}
    - CORE PROBLEM: ${input.context.problemSolved}
    - CAMPAIGN USP: ${input.context.differential}
    ${input.context.target_url ? `- TARGET CONVERSION URL: ${input.context.target_url} (The ideas should prioritize driving traffic to this link)` : ''}
    
    RECENTLY GENERATED CONTENT (Avoid repetition!):
    ${input.lastPosts.length > 0 ? input.lastPosts.map(p => `- ${p}`).join('\n') : 'No recent posts.'}
    
    Requirements:
    1. Generate exactly 10 ideas that are TIGHTLY ALIGNED with the CAMPAIGN TOPIC and STRATEGIC OBJECTIVE above. Do not default to general industry ideas.
    2. Each idea must have a catchy title, a brief description of the content, a recommended strategic angle.
    3. For each idea, provide a 'visual_prompt' string optimized for FAL.ai (Flux):
       - It MUST describe a high-quality, cinematic scene.
       - DO NOT include any text, letters, or typography in the prompt.
       - The image must be purely visual.
    4. Angles allowed: ${CONTENT_ANGLES.join(', ')}.
    5. Ensure variety: Mix educational pieces with storytelling and direct conversion.
    6. IMPORTANT: Every single field including 'visual_prompt' MUST be written in **${input.language}**.
    
    Format: JSON object with key "ideas" containing an array of objects with keys: "title", "description", "angle", "visual_prompt" (MUST BE A STRING), "headline_examples" (2-3 post hooks), and "image_text_examples" (2-3 ultra-short powerful texts for the image overlay).
    `
    return generateJSON<IdeasOutput>(prompt)
}

// --- Flow A: The Strategist ---

interface StrategyInput {
    niche: string
    targetAudience: string
    painPoints: string
}

interface StrategyOutput {
    strategies: {
        pillar_topic: string
        pain_point: string
        buying_stage: 'Awareness' | 'Consideration' | 'Decision'
        rationale: string
    }[]
}

export async function runStrategistFlow(input: StrategyInput): Promise<AIResponse<StrategyOutput>> {
    const prompt = `
    Role: Marketing Strategist Expert.
    Task: Create a content strategy for a niche app.
    
    Context:
    - Niche: ${input.niche}
    - Audience: ${input.targetAudience}
    - Key Pain Points: ${input.painPoints}
    
    Output:
    Generate 5 distinct content strategy ideas. 
    Mix buying stages (Awareness, Consideration, Decision).
    
    Format: JSON Array of objects with keys: "pillar_topic", "pain_point", "buying_stage", "rationale".
  `
    return generateJSON<StrategyOutput>(prompt)
}

// --- Flow B: The Copywriter ---

interface CopywriterInput {
    strategy: {
        pillar_topic: string
        pain_point: string
        buying_stage: string
    }
    context: {
        niche: string
        brandVoice: string
        objective: string // Strategic Objective from campaign
        angle: ContentAngle
        hashtags: {
            generic: string[]
            niche: string[]
            brand: string[]
        }
        language: 'Ingles' | 'Español'
        companyName: string
        offering: string
        differential: string
        problemSolved: string
        customInstructions: string | null
        target_url?: string | null
        lastHeadlines?: string[]
        // Strategy Context Injection
        strategyContext?: {
            topic: string
            orientation: string
            problem: string
            differential?: string
            insights?: string
        }
    }
}

interface CopywriterOutput {
    headline: string
    body_copy: string
    cta: string
    hashtags: string[]
    framework_used: string
    image_title: string
    angle_assigned: string
}

export async function runCopywriterFlow(input: CopywriterInput): Promise<AIResponse<CopywriterOutput>> {
    const { angle, objective, strategyContext } = input.context

    // Select Strategy Instruction based on Angle
    let angleInstruction = ''
    switch (angle) {
        case 'Educativo':
            angleInstruction = "Focus on teaching a specific concept or solving a micro-problem. Use 'How-to' or 'Tips' structures."
            break
        case 'Entretenimiento':
            angleInstruction = "Use humor, relatability, or a 'Pov' (Point of View) style. Focus on the emotional connection to the industry."
            break
        case 'Venta Directa':
            angleInstruction = "Be bold. Focus on the transformation. Highlight the 'Offering' and 'Differential' with urgency."
            break
        case 'Mito/Verdad':
            angleInstruction = "Debunk a popular belief in the niche. Contrast 'What they tell you' vs 'The Reality'."
            break
        case 'Storytelling':
            angleInstruction = "Start with a personal or client transformation narrative. Focus on the journey from problem to solution."
            break
    }

    const prompt = `
    Role: Elite Direct Response Copywriter.
    Task: Write a high-converting social media post with a CATEGORICAL ANGLE.
    
    Context:
    - Company: ${input.context.companyName}
    - Strategic Objective: ${objective}
    - CURRENT ANGLE (MANDATORY): ${angle}
    - Post Topic: ${input.strategy.pillar_topic}
    - Industry: ${input.context.niche}
    - Brand Voice: ${input.context.brandVoice}

    STRATEGY INTELLIGENCE (USE THIS TO GENERATE BEST-IN-CLASS CONTENT):
    - Campaign Topic: ${strategyContext?.topic || 'N/A'}
    - Target Orientation: ${strategyContext?.orientation || 'N/A'}
    - Core Problem Solved: ${strategyContext?.problem || 'N/A'}
    - Campaign USP: ${strategyContext?.differential || 'N/A'}
    ${input.context.target_url ? `- TARGET CONVERSION URL: ${input.context.target_url}` : ''}
    
    PREVIOUSLY USED HEADLINES (AVOID DUPLICATING OR SIMILAR VIBE):
    ${input.context.lastHeadlines && input.context.lastHeadlines.length > 0
            ? input.context.lastHeadlines.map(h => `- ${h}`).join('\n')
            : 'None yet. Be fresh!'}

    INSTRUCTIONS PER ANGLE:
    ${angleInstruction}
    
    HEADLINE VARIETY (CRITICAL):
    - TITLES ALLWAYS MUST BE CHALLENGING, CONTROVERSIAL, OR HIGH-CURIOSITY TO STOP THE SCROLL.
    - You MUST use one of these 3 structures for the headline:
        1. LISTICLE (e.g., 3 Ways to..., 5 Secrets of...)
        2. PROVOCATIVE QUESTION (e.g., Why are you still...?, Does your [X] suck?)
        3. BOLD DECLARATION (e.g., [X] is dead., This is the only way to [Y].)
    - DO NOT start with "Descubre..." or "Atención...".
    - DO NOT use any of the topics or hooks already present in THE PREVIOUSLY USED HEADLINES list above.
    
    Body Copy Requirements:
    - Weave the Competitive Differential: "${strategyContext?.differential || input.context.differential}" into the text.
    - Mention the core offering: "${input.context.offering}".
    ${input.context.target_url ? `- MANDATORY RULE: You must include the link "${input.context.target_url}" in the body text with a clear and compelling call-to-action (CTA) for the user to visit the site.` : ''}
    - STRICT Language adherence: EVERY field (headline, body, cta, image_title) MUST be written in ${input.context.language}.
    
    VISUAL STRUCTURE & FORMATTING (MANDATORY):
    - Use double NEWLINE CHARACTERS (\n\n) between paragraphs for readability.
    - Use BOLD TITLES for different sections if the post is long (e.g. Beneficios, Como funciona).
    - Ensure the text looks organized and easy to scan, not like a wall of text.
    - Hashtags MUST be placed at the VERY END of the body copy. 
    - Do NOT include hashtags inline within the text.
    
    IMAGE OVERLAY TEXT RULES:
    1. The field "image_title" is the TEXT TO BE BAKED ONTO THE IMAGE.
    2. It MUST BE PUNCHY, CATCHY, AND ULTRA-SHORT (1-5 words).
    3. IT MUST BE WRITTEN IN ${input.context.language}.
    4. IT WILL BE USED VERBATIM. NEVER MODIFY, PARAPHRASE, OR TRANSLATE IT AFTER GENERATION.
    
    Output Format: JSON object with keys: "headline", "body_copy", "cta", "hashtags" (array), "framework_used", "image_title" (The verbatim text for image overlay), "angle_assigned".
  `
    return generateJSON<CopywriterOutput>(prompt)
}

// --- Flow C: The Visual Artist ---

interface VisualArtistInput {
    postContent: CopywriterOutput
    niche: string
    visual_style: string
    color_palette?: string
    mood?: string
    imageText?: string
    customInstructions?: string | null
}

export async function runVisualArtistFlow(input: VisualArtistInput): Promise<AIResponse<string>> {
    const prompt = `
      Role: Professional Creative Director.
      Task: Design a high-end visual composition for: "${input.postContent.headline}".
      
      STRICT VISUAL STRATEGY (MANDATORY):
      - Style: ${input.visual_style}
      - Mood: ${input.mood || 'Professional and clean'}
      - Color Palette: ${input.color_palette || 'Harmonious'}
      
      INSTRUCTION: You MUST incorporate the Style, Mood, and Color Palette described above into your visual design. These are non-negotiable.
      
      Visual Composition & Typography:
      - You MAY include text, words, or letters if they enhance the composition (e.g., signage, logos, or integrated titles).
      - Ensure high-end aesthetics and professional lighting.
      
      ${input.customInstructions ? `- MASTER CREATIVE DIRECTIVE: ${input.customInstructions}` : ''}
      
      Output: JUST THE FINAL AUGMENTED PROMPT string for Flux.ai / Imagen 4.
    `
    return generateText(prompt)
}


// --- Orchestration Helper for Modal ---

export async function generateDetailedFlow(input: {
    context: FlowContext
    campaign: Campaign
    config: {
        count: number
        contentType: string
        language: 'Ingles' | 'Español'
    }
    lastHeadlines?: string[]
}) {
    const results = []
    const totalUsage: AIUsage = { prompt_tokens: 0, candidates_tokens: 0, total_tokens: 0 }

    console.log("Starting Multiplier Flow with objective:", input.campaign.objective)

    for (let i = 0; i < input.config.count; i++) {
        try {
            // THE ANGLE MULTIPLIER: Rotate through angles based on index
            const angle = CONTENT_ANGLES[i % CONTENT_ANGLES.length]

            console.log(`Generating piece ${i + 1} with Angle: ${angle}...`)

            const selectedPillar = input.campaign.pillars && input.campaign.pillars.length > 0
                ? input.campaign.pillars[i % input.campaign.pillars.length] // Also rotate pillars
                : "General Industry Topic"

            const strategyItem = {
                pillar_topic: selectedPillar,
                pain_point: "Need for better results in " + selectedPillar,
                buying_stage: "Consideration"
            }

            // 1. Run Copywriter
            const copyInput: CopywriterInput = {
                strategy: strategyItem,
                context: {
                    niche: input.context.niche,
                    brandVoice: input.campaign.brand_voice || input.context.brandVoice || "Professional",
                    objective: input.campaign.strategic_objective || input.campaign.objective,
                    angle: angle,
                    hashtags: {
                        generic: ["#fyp", "#viral"],
                        niche: ["#" + input.context.niche.replace(/\s/g, '')],
                        brand: ["#" + input.context.companyName.replace(/\s/g, '')]
                    },
                    language: input.config.language,
                    companyName: input.context.companyName,
                    offering: input.context.offering,
                    differential: input.context.differential,
                    problemSolved: input.context.problemSolved,
                    customInstructions: input.campaign.custom_copy_instructions,
                    target_url: input.campaign.target_url,
                    lastHeadlines: input.lastHeadlines,
                    strategyContext: input.context.strategyContext
                }
            }

            const copyResponse = await runCopywriterFlow(copyInput)
            const copyOutput = copyResponse.data

            // Accumulate usage
            totalUsage.prompt_tokens += copyResponse.usage.prompt_tokens
            totalUsage.candidates_tokens += copyResponse.usage.candidates_tokens
            totalUsage.total_tokens += copyResponse.usage.total_tokens

            // 2. Run Visual Artist
            const visualResponse = await runVisualArtistFlow({
                postContent: copyOutput,
                niche: input.context.niche,
                visual_style: input.campaign.visual_style,
                color_palette: input.campaign.color_palette || undefined,
                mood: input.campaign.mood || undefined,
                imageText: copyOutput.image_title,
                customInstructions: input.campaign.custom_visual_instructions
            })

            const visualOutput = visualResponse.data
            totalUsage.prompt_tokens += visualResponse.usage.prompt_tokens
            totalUsage.candidates_tokens += visualResponse.usage.candidates_tokens
            totalUsage.total_tokens += visualResponse.usage.total_tokens

            results.push({
                headline: copyOutput.headline,
                body_copy: copyOutput.body_copy,
                hashtags: copyOutput.hashtags,
                cta: copyOutput.cta,
                framework_used: copyOutput.framework_used,
                image_title: copyOutput.image_title,
                image_prompt: visualOutput,
                angle_assigned: angle // Track for DB
            })

        } catch (itemError: unknown) {
            console.error(`Error generating item ${i + 1}:`, itemError)
            const errorMessage = itemError instanceof Error ? itemError.message : String(itemError)
            throw new Error(`Multiplier Flow Failed at item ${i + 1}: ${errorMessage}`)
        }
    }

    return { results, usage: totalUsage }
}

// --- Flow: eBook Outline Generator ---

export interface EbookOutlineOutput {
    title: string
    chapters: {
        index: number
        title: string
        description: string
    }[]
}

export async function runEbookOutlineFlow(input: {
    topic: string
    context: FlowContext
    language: string
}): Promise<AIResponse<EbookOutlineOutput>> {
    const prompt = `
    Role: Professional Author & Content Strategist.
    Task: Create a detailed Table of Contents (TOC) for a high-value eBook.
    
    Topic: ${input.topic}
    
    Company Context:
    - Name: ${input.context.companyName}
    - Niche: ${input.context.niche}
    - Audience: ${input.context.targetAudience}
    
    Requirements:
    1. The eBook should have between 5 to 10 chapters.
    2. Each chapter must have a clear, engaging title and a brief description of what it covers.
    3. Ensure a logical progression (Introduction, Problem, Solution, Implementation, Conclusion).
    4. Language: **${input.language}**.
    
    Format: JSON object with keys: "title" (the eBook title), and "chapters" (array of objects with "index", "title", "description").
    `
    return generateJSON<EbookOutlineOutput>(prompt)
}

// --- Flow: Chapter Generator ---

export interface ChapterGenerationOutput {
    content_markdown: string
    summary: string
}

export async function runChapterGenerationFlow(input: {
    projectTitle: string
    chapterTitle: string
    chapterIndex: number
    totalChapters: number
    previousSummaries: string
    context: FlowContext
    language: string
}): Promise<AIResponse<ChapterGenerationOutput>> {
    const prompt = `
    Role: Professional Technical Author & Master Typesetter.
    Task: Write Chapter ${input.chapterIndex} of the eBook titled "${input.projectTitle}".
    
    Chapter Title: ${input.chapterTitle}
     Progress: ${input.chapterIndex} of ${input.totalChapters}
    
    CONTEXT FROM PREVIOUS CHAPTERS:
    ${input.previousSummaries || "This is the first chapter."}
    
    STRICT FORMATTING POLICY (READ CAREFULLY):
    1. **NO MARKDOWN**: Never use #, ##, **, __, or any other markdown symbols.
    2. **PURE SEMANTIC HTML**: Deliver content wrapped in <h1>, <h2>, <h3>, <p>, <strong>, <ul>, <li>, and <blockquote>.
    3. **HIGH-END EDITORIAL**: Write in a sophisticated, authoritative tone (800-1200 words).
    4. **STYLE HOOKS**: Use <strong> for strategic emphasis of key terms.
    5. **NO META-TALK**: Do not include "Here is the content" or explanations.
    6. **CUSTOM BLOCKS**: Use [IMAGE_PROMPT: ...] for visual breaks.
    
    Language: **${input.language}**.
    
    Format: JSON object:
    {
      "content_markdown": "THE FULL HTML CONTENT STRING (NO MARKDOWN)",
      "summary": "2-3 sentence summary for continuity"
    }
    `
    return generateJSON<ChapterGenerationOutput>(prompt)
}

// --- Flow: Chapter Blueprint (MassGenix Evolution) ---

export interface ChapterBlueprintOutput {
    blocks: BlockBlueprint[]
}

export async function runChapterBlueprintFlow(input: {
    chapterTitle: string
    chapterDescription: string
    ebookTopic: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: any
    language: string
}): Promise<AIResponse<ChapterBlueprintOutput>> {
    const prompt = `
    Role: Senior Information Architect & Visual Storyteller.
    Task: Design the "Visual Anatomy" of a chapter for a premium eBook.
    
    Chapter Title: ${input.chapterTitle}
    Chapter Summary: ${input.chapterDescription}
    eBook Topic: ${input.ebookTopic}
    
    Company Context:
    - Name: ${input.context.companyName}
    - Niche: ${input.context.niche}
    
    Instruction:
    Break this chapter down into a sequence of "Visual Blocks" that would make it look like a high-end landing page or a premium magazine spread.
    
    Available Blocks:
    - Hero: For powerful intros with a large image.
    - FeatureSplit: For text/image balance.
    - MultiColumn: For bullet points, tips, or steps.
    - Quote: For punchy insights or client/authority quotes.
    - DeepText: For detailed editorial content.
    - CTA: For transitioning to the next chapter or a sales hook.
    - Gallery: For visual collections.
    
    Requirements:
    1. A chapter should usually consist of 4-7 blocks.
    2. Start with a Hero or high-impact intro.
    3. Ensure variety. Don't repeat the same block type consecutively unless for intentional rhythm.
    4. Language: **${input.language}**.
    
    Format: JSON object with "blocks" array. Each block has "type" (BlockType) and "reasoning" (Short explanation).
    `
    return generateJSON<ChapterBlueprintOutput>(prompt)
}

// --- Flow: Atomic Block Generator (MassGenix Evolution) ---

export interface BlockGenerationOutput {
    content: BlockContent
    image_prompt?: string
}

export async function runBlockGenerationFlow(input: {
    blockType: BlockType
    chapterTitle: string
    ebookTopic: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: any
    language: string
    previousBlocksContext?: string
}): Promise<AIResponse<BlockGenerationOutput>> {
    const schemas: Record<BlockType, string> = {
        Hero: '{ "mainTitle": "string", "description": "string", "ctaText": "string", "imagePrompt": "string" }',
        FeatureSplit: '{ "title": "string", "text": "string", "featureLabel": "string", "theme": "image-left" | "image-right", "imagePrompt": "string" }',
        MultiColumn: '{ "columns": [{ "title": "string", "text": "string", "icon": "string" }] }',
        Quote: '{ "quote": "string", "author": "string", "authorTitle": "string", "authorImage": "string" }',
        DeepText: '{ "contentHtml": "string (semantic HTML)" }',
        CTA: '{ "title": "string", "description": "string", "buttonText": "string", "buttonLink": "string" }',
        Gallery: '{ "images": [{ "caption": "string", "prompt": "string" }] }'
    };

    const targetSchema = schemas[input.blockType] || '{}';

    const prompt = `
    Role: Senior UI/UX Designer & Conversion Copywriter.
    Task: Generate content for an atomic block of type **${input.blockType}**.
    
    Context:
    Chapter: ${input.chapterTitle} | eBook: ${input.ebookTopic}
    
    STRICT WRITING RULES:
    1. **ABSORLUTE NO MARKDOWN**: Do not use any markdown symbols (#, *, _, etc).
    2. **SEMANTIC HTML**: If the field is "html" or "text", use tags like <p>, <strong>, <ul>, <li>.
    3. **EDITORIAL EXCELLENCE**: Write for a premium publication.
    4. **BLOCK SPECIFICS**:
       - Hero: Main title must be punchy. Image prompt must be cinematic.
       - DeepText: Use <h2> for subheaders and <p> for body.
       - Quote: Must be insightful and professional.
    
    5. **ART DIRECTION**: 
       - Generate "image_prompt" optimized for Flux (FAL.ai). 
       - MUST NOT include any text, letters, or characters. The image must be purely visual.
    
    6. **STYLE DEFAULTS**: Suggest subtle style overrides if it enhances the block (e.g. slight background tint).
    
    Language: **${input.language}**.
    
    Format: JSON object:
    {
      "content": ${targetSchema},
      "style_overrides": { "backgroundColor": "hex", "padding": "string", "fontSize": "string" },
      "image_prompt": "string"
    }
    `
    return generateJSON<BlockGenerationOutput>(prompt)
}

// --- Flow: Forge Wizard (Titles & Focus) ---

export interface ForgeWizardOutput {
    titles: {
        title: string
        hook: string
        reasoning: string
    }[]
    focus_angles: {
        id: string
        label: string
        description: string
    }[]
}

export async function runForgeWizardFlow(input: {
    topic: string
    context: FlowContext
    language: string
}): Promise<AIResponse<ForgeWizardOutput>> {
    const prompt = `
    Role: Senior Marketing Strategist & Bestselling Author.
    Task: Help a user refine their idea for a Premium Forge (eBook, Blog, or Whitepaper).
    
    Topic: ${input.topic}
    Context:
    - Company: ${input.context.companyName}
    - Niche: ${input.context.niche}
    
    Requirements:
    1. Generate 5 high-impact, marketing-optimized titles. Each title must have a "hook" (the emotional or logical draw) and a "reasoning" (why this title works for conversion).
    2. Provide 3 distinct "focus_angles" (ways to approach the topic). Examples: "Educational Deep-Dive", "Viral Controversial", "Direct Sales Transformer", "Case Study Driven".
    3. Use the best practices for title design (Numbers, Curiosity Gap, Specificity, Authority).
    4. Language: **${input.language}**.
    
    Format: JSON object with:
    - "titles": Array of { "title", "hook", "reasoning" }
    - "focus_angles": Array of { "id", "label", "description" }
    `
    return generateJSON<ForgeWizardOutput>(prompt)
}
