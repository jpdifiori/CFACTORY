'use server'

import { createClient } from '@/utils/supabase/server'
import { encryptToken } from '@/lib/security/encryption'
import { Database } from '@/types/database.types'

type SocialPlatform = Database['public']['Tables']['social_connections']['Row']['platform']

export async function saveSocialConnectionAction(formData: {
    projectId: string;
    platform: SocialPlatform;
    accountName: string;
    platformId: string;
    accessToken: string;
}) {
    const supabase = (await createClient()) as any

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Encrypt the token using the projectId as salt
    const encryptedToken = encryptToken(formData.accessToken, formData.projectId)

    const { data, error } = await (supabase
        .from('social_connections') as any)
        .insert({
            project_id: formData.projectId,
            user_id: user.id,
            platform: formData.platform,
            account_name: formData.accountName,
            platform_id: formData.platformId,
            encrypted_token: encryptedToken,
            status: 'active'
        })
        .select()
        .single()

    if (error) {
        console.error('Error saving social connection:', error)
        return { success: false, error: error.message }
    }

    return { success: true, data }
}

export async function testSocialConnectionAction(connectionId: string) {
    const supabase = (await createClient()) as any

    const { data: connection, error: fetchError } = await supabase
        .from('social_connections')
        .select('*')
        .eq('id', connectionId)
        .single()

    if (fetchError || !connection) {
        return { success: false, error: 'Connection not found' }
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (!webhookUrl) {
        console.warn('N8N_WEBHOOK_URL not configured')
        return { success: false, error: 'Integration bridge not configured' }
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'test_connection',
                connectionId: connection.id,
                platform: connection.platform,
                platformId: connection.platform_id
                // We don't send the token here, n8n will fetch it via API or we can send it encrypted if needed
                // But normally we'd decrypt it here or n8n would have the key.
            })
        })

        if (response.ok) {
            await supabase
                .from('social_connections')
                .update({ status: 'active' })
                .eq('id', connectionId)

            return { success: true }
        } else {
            await supabase
                .from('social_connections')
                .update({ status: 'error' })
                .eq('id', connectionId)

            return { success: false, error: 'n8n validation failed' }
        }
    } catch (error) {
        console.error('Error testing connection with n8n:', error)
        return { success: false, error: 'Webhook communication error' }
    }
}

export async function updateSafetyZonesAction(projectId: string, safetyZones: any) {
    const supabase = (await createClient()) as any

    const { error } = await supabase
        .from('project_master')
        .update({ safety_zones: safetyZones })
        .eq('id', projectId)

    if (error) {
        console.error('Error updating safety zones:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}
