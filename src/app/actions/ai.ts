'use server'

import { generateDetailedFlow, runIdeaGeneratorFlow } from '@/lib/ai/flows'
import { createClient } from '@/utils/supabase/server'
import { recordAIUsageAction } from './usageActions'

export async function generateContentAction(input: {
    context: any
    campaign: any
    config: {
        count: number
        contentType: string
        language: 'Ingles' | 'Español'
    }
}) {
    // 1. Session check to prevent unauthorized AI usage
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: "Authentication required" }
    }

    // 2. SECURITY CHECK: Ensure API Key is present on server
    if (!process.env.GOOGLE_API_KEY && !process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
        return { success: false, error: "Critical Error: GOOGLE_API_KEY is not defined in the server environment" }
    }

    try {
        console.log(`Server Action: User ${user.id} starting content generation for campaign ${input.campaign.id}...`)

        // 3. FETCH HISTORY: Get last 10 headlines to avoid repetition
        const { data: recentContent } = await (supabase
            .from('content_queue') as any)
            .select('gemini_output')
            .eq('campaign_id', input.campaign.id)
            .not('gemini_output', 'is', null)
            .order('created_at', { ascending: false })
            .limit(10)

        const lastHeadlines = recentContent
            ?.map((item: any) => (item.gemini_output as any)?.headline)
            .filter(Boolean) || []

        const { results, usage } = await generateDetailedFlow({
            ...input,
            lastHeadlines
        })

        // Record AI Usage
        await recordAIUsageAction(
            usage.total_tokens,
            'gemini-2.0-flash',
            `Campaign Multiplier (${input.config.count} items)`,
            usage.prompt_tokens,
            usage.candidates_tokens
        )

        return { success: true, data: results }
    } catch (error: any) {
        console.error("Server Action Error:", error)
        return { success: false, error: error.message || "Failed to generate content on server" }
    }
}

export async function generateCampaignIdeasAction(input: {
    context: any
    campaignId: string
    objective: string
    language: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Authentication required" }

    try {
        // Fetch last 5 posts for context
        const { data: recentContent } = await (supabase
            .from('content_queue') as any)
            .select('gemini_output')
            .eq('campaign_id', input.campaignId)
            .not('gemini_output', 'is', null)
            .order('created_at', { ascending: false })
            .limit(5)

        const recentSummaries = recentContent
            ?.map((item: any) => {
                const out = item.gemini_output as any
                return `${out.headline}: ${out.body_copy?.substring(0, 100)}...`
            })
            .filter(Boolean) || []

        const response = await runIdeaGeneratorFlow({
            context: input.context,
            lastPosts: recentSummaries,
            objective: input.objective,
            language: input.language
        })

        const result = response.data
        const usage = response.usage

        // Record AI Usage
        await recordAIUsageAction(
            usage.total_tokens,
            'gemini-2.0-flash',
            'Idea Generator',
            usage.prompt_tokens,
            usage.candidates_tokens
        )

        return { success: true, ideas: result.ideas }
    } catch (error: any) {
        console.error("Ideas Generation Error:", error)
        return { success: false, error: error.message || "Failed to generate ideas" }
    }
}
