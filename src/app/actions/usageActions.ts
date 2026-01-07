'use server'

import { createClient } from '@/utils/supabase/server'

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
        if (!user) return { success: false, error: 'Not authenticated' }

        // 1. Update Profile total
        const { error: profileError } = await supabase.rpc('increment_user_tokens', {
            user_id: user.id,
            tokens_to_add: tokens
        } as any)

        if (profileError) {
            // Fallback if RPC doesn't exist yet, though RPC is safer for concurrency
            const { data: profile } = await supabase
                .from('profiles')
                .select('total_tokens_used')
                .eq('id', user.id)
                .single()

            const current = ((profile as any)?.total_tokens_used || 0) as number
            await (supabase
                .from('profiles') as any)
                .update({ total_tokens_used: Number(current) + tokens } as any)
                .eq('id', user.id)
        }

        // 2. Log detailed usage
        await (supabase
            .from('ai_usage_logs') as any)
            .insert({
                user_id: user.id,
                model_name: model,
                input_tokens: inputTokens,
                output_tokens: outputTokens,
                total_tokens: tokens,
                feature_name: feature
            })

        return { success: true }
    } catch (error: any) {
        console.error('Error recording AI usage:', error)
        return { success: false, error: error.message }
    }
}

export async function getUserUsageAction() {
    const supabase = await createClient()
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data: profile } = await supabase
            .from('profiles')
            .select('total_tokens_used, token_limit')
            .eq('id', user.id)
            .single()

        return profile
    } catch (e) {
        return null
    }
}
