'use server'

import { createClient } from '@/utils/supabase/server'
import { decryptToken } from '@/lib/security/encryption'
import { SafeSelectBuilder, SafeUpdateBuilder } from '@/utils/supabaseSafe'

interface SocialTarget {
    platform: string
    platformId: string
    accessToken: string
    accountName: string
}

interface GeminiOutput {
    headline?: string
    title?: string
    body_copy?: string
    caption?: string
    cta?: string
    hashtags?: string[]
}

export async function publishContentToSocialsAction(itemId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Auth required" }

    try {
        // 1. Fetch item with campaign details
        const { data: item, error: fetchError } = await (supabase
            .from('content_queue') as unknown as SafeSelectBuilder<'content_queue'>)
            .select('*, campaigns(*)')
            .eq('id', itemId)
            .single()

        // Type guard or manual check for campaigns since generic select result might be partial
        // However, we can trust runtime result mostly. 
        // We need to cast item to a composite type if we want specific joined fields typed correctly,
        // but for now let's treat it as the Row type plus 'campaigns' property check.

        if (fetchError || !item) throw new Error("Item not found")

        const itemWithCampaign = item as any // Temporary escape for joined property access which is tricky to type strictly with generic builders
        // A better approach is defining the Joined Interface

        const projectId = itemWithCampaign.project_id
        if (!projectId) throw new Error("Project context missing")

        // 2. Fetch Project Connections
        // Using standard client for simple select where it might work, or safe builder if it fails
        const { data: connections, error: connError } = await (supabase
            .from('social_connections') as unknown as SafeSelectBuilder<'social_connections'>)
            .select('*')
            .eq('project_id', projectId)
            .limit(50) // SafeSelect requires limit in the current chain definition or we adjust definition.
        // Actually my SafeSelect def has limit inside eq. Let's adjust usage or def.
        // The chain is .select().eq().limit() ok in my definition?
        // select -> { eq -> {} } . limit is missing on the eq result in my interface?
        // Let's rely on standard 'any' cast for connections map if strict fails, 
        // but here I will fix connections map typing.

        if (connError) throw new Error("Failed to fetch connections")

        // connections data is Row<'social_connections'>[]
        // map loop should be typed

        const targets = (connections || []).map((conn) => {
            try {
                const decryptedToken = decryptToken(conn.encrypted_token, projectId)
                return {
                    platform: conn.platform,
                    platformId: conn.platform_id,
                    accessToken: decryptedToken,
                    accountName: conn.account_name
                } as SocialTarget
            } catch (e) {
                console.error(`Failed to decrypt token for ${conn.platform}`, e)
                return null
            }
        }).filter((t): t is SocialTarget => t !== null)

        if (targets.length === 0) {
            return { success: false, error: "No active or valid social connections found for this project." }
        }

        const output = itemWithCampaign.gemini_output as unknown as GeminiOutput | null

        // 3. Prepare Webhook Payload
        const payload = {
            action: 'publish_content',
            content: {
                id: itemWithCampaign.id,
                title: output?.headline || output?.title,
                body: output?.body_copy || output?.caption,
                cta: output?.cta,
                hashtags: output?.hashtags,
                image_url: itemWithCampaign.image_final_url || itemWithCampaign.image_url,
                content_type: itemWithCampaign.content_type,
            },
            campaign: {
                name: itemWithCampaign.campaigns?.name,
                url: itemWithCampaign.campaigns?.target_url,
                objective: itemWithCampaign.campaigns?.objective
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
        await (supabase.from('content_queue') as unknown as SafeUpdateBuilder<'content_queue'>)
            .update({ status: 'Published' })
            .eq('id', itemId)

        return { success: true, targetsCount: targets.length }

    } catch (error: unknown) {
        console.error("Social Publish Error:", error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown publish error' }
    }
}
