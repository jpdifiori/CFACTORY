'use server'

import { createClient } from '@/utils/supabase/server'

import { SafeSelectBuilder, SafeUpdateBuilder } from '@/utils/supabaseSafe'

interface GeminiOutput {
    headline?: string
    body_copy?: string
    cta?: string
    hashtags?: string[]
}

export async function publishContentAction(itemId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Auth required" }

    try {
        // 1. Fetch item with campaign details
        const { data: item, error: fetchError } = await (supabase
            .from('content_queue') as unknown as SafeSelectBuilder<'content_queue'>)
            .select('*, campaigns(*)')
            .eq('id', itemId)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !item) throw new Error("Item not found")

        // Define type matching the query result
        type ContentItemWithCampaign = typeof item & {
            campaigns: {
                name: string
                strategic_objective?: string
                objective?: string
            } | null
        }

        const itemWithCampaign = item as unknown as ContentItemWithCampaign
        const geminiOutput = itemWithCampaign.gemini_output as unknown as GeminiOutput | null

        // 2. Prepare Webhook Payload
        const payload = {
            id: itemWithCampaign.id,
            content_type: itemWithCampaign.content_type,
            title: geminiOutput?.headline,
            body: geminiOutput?.body_copy,
            cta: geminiOutput?.cta,
            hashtags: geminiOutput?.hashtags,
            image_url: itemWithCampaign.image_final_url,
            scheduled_at: itemWithCampaign.scheduled_at, // CRITICAL: For n8n/Make to know when to post
            campaign_name: itemWithCampaign.campaigns?.name,
            objective: itemWithCampaign.campaigns?.strategic_objective || itemWithCampaign.campaigns?.objective
        }

        console.log("Publishing to Webhook:", process.env.NEXT_PUBLIC_WEBHOOK_URL || 'NONE')

        // 3. Trigger Webhook (n8n/Make)
        // Note: You should set WEBHOOK_URL in your .env
        const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL
        if (webhookUrl) {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (!response.ok) throw new Error(`Webhook failed: ${response.statusText}`)
        }

        // 4. Update Status to Published
        const { error: updateError } = await (supabase.from('content_queue') as unknown as SafeUpdateBuilder<'content_queue'>)
            .update({ status: 'Published' })
            .eq('id', itemId)

        if (updateError) throw updateError

        return { success: true }
    } catch (error: unknown) {
        console.error("Publish Error:", error)
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
}
