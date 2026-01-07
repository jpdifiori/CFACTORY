'use server'

import { createClient } from '@/utils/supabase/server'

export async function publishContentAction(itemId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Auth required" }

    try {
        // 1. Fetch item with campaign details
        const { data: item, error: fetchError } = await supabase
            .from('content_queue')
            .select('*, campaigns(*)')
            .eq('id', itemId)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !item) throw new Error("Item not found")

        // 2. Prepare Webhook Payload
        const payload = {
            id: (item as any).id,
            content_type: (item as any).content_type,
            title: ((item as any).gemini_output as any)?.headline,
            body: ((item as any).gemini_output as any)?.body_copy,
            cta: ((item as any).gemini_output as any)?.cta,
            hashtags: ((item as any).gemini_output as any)?.hashtags,
            image_url: (item as any).image_final_url,
            scheduled_at: (item as any).scheduled_at, // CRITICAL: For n8n/Make to know when to post
            campaign_name: (item as any).campaigns?.name,
            objective: (item as any).campaigns?.strategic_objective || (item as any).campaigns?.objective
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
        const { error: updateError } = await (supabase.from('content_queue') as any)
            .update({ status: 'Published' })
            .eq('id', itemId)

        if (updateError) throw updateError

        return { success: true }
    } catch (error: any) {
        console.error("Publish Error:", error)
        return { success: false, error: error.message }
    }
}
