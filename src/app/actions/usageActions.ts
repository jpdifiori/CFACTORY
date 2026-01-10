'use server'

import { createClient } from '@/utils/supabase/server'
import { SafeSelectBuilder, SafeUpdateBuilder, SafeInsertBuilder } from '@/utils/supabaseSafe'

export async function recordAIUsageAction(
    tokens: number,
    model: string,
    feature: string,
    inputTokens: number = 0,
    outputTokens: number = 0
) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            console.error('recordAIUsageAction: No user found')
            return { success: false, error: 'Not authenticated' }
        }

        console.log(`[USAGE] Recording ${tokens} tokens for ${feature} (Model: ${model}) for user ${user.id}`)

        // 1. Update Profile total
        const { error: profileError } = await supabase.rpc('increment_user_tokens', {
            user_id: user.id,
            tokens_to_add: tokens
        } as unknown as undefined) // Force cast to undefined to satisfy incorrect generated RPC signature if present

        if (profileError) {
            console.warn('[USAGE] RPC increment_user_tokens failed, trying manual update:', profileError.message)

            // Fallback if RPC doesn't exist yet
            const { data: profile, error: fetchError } = await (supabase
                .from('profiles') as unknown as SafeSelectBuilder<'profiles'>)
                .select('total_tokens_used')
                .eq('id', user.id)
                .single()

            if (fetchError) {
                const msg = (fetchError as { message: string }).message || JSON.stringify(fetchError)
                console.error('[USAGE] Failed to fetch profile for manual update:', msg)
            } else {
                const current = (profile?.total_tokens_used || 0) as number
                const { error: updateError } = await (supabase
                    .from('profiles') as unknown as SafeUpdateBuilder<'profiles'>)
                    .update({ total_tokens_used: Number(current) + tokens })
                    .eq('id', user.id)

                if (updateError) {
                    const msg = (updateError as { message: string }).message || JSON.stringify(updateError)
                    console.error('[USAGE] Manual update of tokens failed:', msg)
                } else {
                    console.log(`[USAGE] Manual update success: ${current} -> ${current + tokens}`)
                }
            }
        } else {
            console.log('[USAGE] RPC update success')
        }

        // 2. Log detailed usage (Don't let this block success of the operation)
        const { error: logError } = await (supabase
            .from('ai_usage_logs') as unknown as SafeInsertBuilder<'ai_usage_logs'>)
            .insert({
                user_id: user.id,
                model_name: model,
                input_tokens: inputTokens,
                output_tokens: outputTokens,
                total_tokens: tokens,
                feature_name: feature
            })

        if (logError) {
            const msg = (logError as { message: string }).message || JSON.stringify(logError)
            console.error('[USAGE] Failed to insert usage log:', msg)
        }

        return { success: true }
    } catch (error: unknown) {
        console.error('[USAGE] FATAL ERROR in recordAIUsageAction:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function getUserUsageAction() {
    const supabase = await createClient()
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data: profile } = await (supabase
            .from('profiles') as unknown as SafeSelectBuilder<'profiles'>)
            .select('total_tokens_used, token_limit')
            .eq('id', user.id)
            .single()

        return profile
    } catch {
        return null
    }
}
