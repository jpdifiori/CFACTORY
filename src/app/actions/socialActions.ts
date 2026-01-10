'use server'

import { createClient } from '@/utils/supabase/server'
import { encryptToken } from '@/lib/security/encryption'
import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

type SocialPlatform = Database['public']['Tables']['social_connections']['Row']['platform']
type Json = Database['public']['Tables']['project_master']['Row']['safety_zones']
import { SafeInsertBuilder, SafeSelectBuilder, SafeUpdateBuilder, SafeDeleteBuilder } from '@/utils/supabaseSafe'

// Safe interfaces were removed in favor of SupabaseClient<Database> strong typing

export async function saveSocialConnectionAction(formData: {
    projectId: string;
    platform: SocialPlatform;
    accountName: string;
    platformId: string;
    accessToken: string;
}) {
    const supabase = (await createClient()) as SupabaseClient<Database>

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Encrypt the token using the projectId as salt
    const encryptedToken = encryptToken(formData.accessToken, formData.projectId)

    const { data, error } = await (supabase
        .from('social_connections') as unknown as SafeInsertBuilder<'social_connections'>)
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
        return { success: false, error: 'Failed to save connection' } // Simplify error to avoid unknown type issues with .message
    }

    return { success: true, data }
}

export async function testSocialConnectionAction(connectionId: string) {
    const supabase = (await createClient()) as SupabaseClient<Database>

    const { data: connection, error: fetchError } = await (supabase
        .from('social_connections') as unknown as SafeSelectBuilder<'social_connections'>)
        .select('*')
        .eq('id', connectionId)
        .single()

    if (fetchError || !connection) {
        return { success: false, error: 'Connection not found' }
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (!webhookUrl) {
        console.warn('N8N_WEBHOOK_URL not configured')
        return {
            success: false,
            error: 'Integration bridge (n8n) not configured. Please check your N8N_WEBHOOK_URL in .env.local'
        }
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
            await (supabase
                .from('social_connections') as unknown as SafeUpdateBuilder<'social_connections'>)
                .update({ status: 'active' })
                .eq('id', connectionId)

            return { success: true }
        } else {
            await (supabase
                .from('social_connections') as unknown as SafeUpdateBuilder<'social_connections'>)
                .update({ status: 'error' })
                .eq('id', connectionId)

            return { success: false, error: 'n8n validation failed' }
        }
    } catch (error) {
        console.error('Error testing connection with n8n:', error)
        return { success: false, error: 'Webhook communication error' }
    }
}

export async function updateSafetyZonesAction(projectId: string, safetyZones: Json) {
    const supabase = (await createClient()) as SupabaseClient<Database>

    const { error } = await (supabase
        .from('project_master') as unknown as SafeUpdateBuilder<'project_master'>)
        .update({ safety_zones: safetyZones })
        .eq('id', projectId)

    if (error) {
        console.error('Error updating safety zones:', error)
        // return { success: false, error: error.message } // SafeUpdateBuilder error is unknown
        return { success: false, error: 'Update failed' }
    }

    return { success: true }
}

export async function deleteSocialConnectionAction(connectionId: string, projectId: string) {
    const supabase = (await createClient()) as SupabaseClient<Database>
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    console.log(`Attempting to delete connection ${connectionId} for project ${projectId}`)

    // Verify ownership by checking if the connection belongs to the user AND project
    // Although RLS handles user check, explicit logic is good for specific error handling
    const { error, count } = await (supabase
        .from('social_connections') as unknown as SafeDeleteBuilder)
        .delete({ count: 'exact' })
        .eq('id', connectionId)
        .eq('project_id', projectId) // Extra safety check

    if (error) {
        console.error('Error deleting connection:', error)
        return { success: false, error: 'Delete failed' }
    }

    if (count === 0) {
        // ... retry logic using SafeDeleteBuilder same way ...
        // Skipping full retry block rewrite for brevity in this chunk, assuming main path covers valid deletes.
        // Actually I should allow the retry to work.
        console.warn(`No connection found with id ${connectionId} for project ${projectId}`)
        // Retry without project_id
        const { error: retryError, count: retryCount } = await (supabase
            .from('social_connections') as unknown as SafeDeleteBuilder)
            .delete({ count: 'exact' })
            .eq('id', connectionId)
            .eq('user_id', user.id)

        if (retryError) return { success: false, error: 'Retry delete failed' }
        if (retryCount === 0) return { success: false, error: 'Connection not found or already deleted' }
    }

    console.log('Connection deleted successfully')
    return { success: true }
}
