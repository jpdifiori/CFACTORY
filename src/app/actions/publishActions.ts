'use server'

import { createClient } from '@/utils/supabase/server'
import { decryptToken } from '@/lib/security/encryption'

export async function publishContentToSocialsAction(itemId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Auth required" }

    try {
        // 1. Fetch item with campaign details
        const { data: item, error: fetchError } = await (supabase
            .from('content_queue')
            .select('*, campaigns(*)')
            .eq('id', itemId)
            .eq('user_id', user.id)
            .single() as any)

        if (fetchError || !item) throw new Error("Item not found")

        const projectId = item.project_id
        if (!projectId) throw new Error("Project context missing")

        // 2. Fetch Project Connections
        const { data: connections, error: connError } = await supabase
            .from('social_connections')
            .select('*')
            .eq('project_id', projectId)
            .eq('status', 'active')

        if (connError) throw new Error("Failed to fetch connections")

        // Filter connections if needed? For now we send to all active or maybe we should select.
        // The user implementation plan implied simplified publishing, but ideally we select platforms.
        // For MVP/Hub flow, we'll send to all verified active connections or filter by content type if relevant.
        // Or we can send everything to n8n and let n8n decide based on payload.
        // Let's send a list of targets.

        const targets = connections.map((conn: any) => {
            try {
                const decryptedToken = decryptToken(conn.encrypted_token, projectId)
                return {
                    platform: conn.platform,
                    platformId: conn.platform_id,
                    accessToken: decryptedToken,
                    accountName: conn.account_name
                }
            } catch (e) {
                console.error(`Failed to decrypt token for ${conn.platform}`, e)
                return null
            }
        }).filter(Boolean)

        if (targets.length === 0) {
            return { success: false, error: "No active or valid social connections found for this project." }
        }

        // 3. Prepare Webhook Payload
        const payload = {
            action: 'publish_content',
            content: {
                id: item.id,
                title: (item.gemini_output as any)?.headline || (item.gemini_output as any)?.title,
                body: (item.gemini_output as any)?.body_copy || (item.gemini_output as any)?.caption,
                cta: (item.gemini_output as any)?.cta,
                hashtags: (item.gemini_output as any)?.hashtags,
                image_url: item.image_final_url || item.image_url,
                content_type: item.content_type,
            },
            campaign: {
                name: item.campaigns?.name,
                url: item.campaigns?.target_url,
                objective: item.campaigns?.objective
            },
            targets: targets // Array of platforms with decrypted tokens
        }

        // 4. Trigger Webhook (n8n)
        const webhookUrl = process.env.N8N_PUBLISH_WEBHOOK_URL || process.env.NEXT_PUBLIC_WEBHOOK_URL

        if (!webhookUrl) {
            throw new Error("Publishing Webhook URL not configured")
        }

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Webhook failed: ${response.status} ${errorText}`)
        }

        // 5. Update Status to Published
        await (supabase.from('content_queue') as any)
            .update({ status: 'Published' })
            .eq('id', itemId)

        return { success: true, targetsCount: targets.length }

    } catch (error: any) {
        console.error("Social Publish Error:", error)
        return { success: false, error: error.message }
    }
}
