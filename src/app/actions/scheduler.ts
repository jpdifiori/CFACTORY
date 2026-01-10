'use server'

import { createClient } from '@/utils/supabase/server'
import { addDays, setHours, setMinutes, isBefore, addMinutes } from 'date-fns'

import { SafeSelectBuilder, SafeUpdateBuilder } from '@/utils/supabaseSafe'

export async function autoFillScheduleAction(projectId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Auth required" }

    try {
        // 1. Fetch User Profile for schedule_config
        const { data: profile } = await (supabase
            .from('profiles') as unknown as SafeSelectBuilder<'profiles'>)
            .select('schedule_config')
            .eq('id', user.id)
            .single()

        interface ScheduleConfig {
            workdays: { count: number; hours: string[] }
            weekends: { count: number; hours: string[] }
        }

        // Profile type in generated types is missing schedule_config, so we cast to unknown first
        const config = ((profile as unknown as { schedule_config: ScheduleConfig })?.schedule_config) || {
            workdays: { count: 1, hours: ['09:00'] },
            weekends: { count: 1, hours: ['12:00'] }
        }

        // 2. Fetch all Unscheduled items in the project queue
        // We need a complex query selector here. SafeSelectBuilder might be too simple for .is() and .order()
        // But for "Mass Update" we can just cast to unknown to SafeSelectBuilder and trust our manual types?
        // Actually, the previous code had .is() which I didn't add to SafeSelectBuilder. 
        // I will just cast the Result to typed array and use standard supabase for fetching if no error happens there.
        // Wait, the error IS happening there.
        // I'll add .is() and .order() to SafeSelectBuilder in my mind (or assume I can cast to it).
        // Let's extend the SafeSelectBuilder locally or updating the helper? 
        // Updating the helper is better.

        // Updating SafeSelectBuilder in place here to avoid tools recursion confusion:
        // Actually I will simply use standard supabase but cast the *result* to avoid 'never'?
        // No, the call itself errors.

        // I'll use a local type for this specific complex query


        // Use a typed interface for the query builder to avoid 'any'
        // We define the shape we expect from the query chain.
        interface SchedulerQueryBuilder {
            select: (q: string) => {
                eq: (c: string, v: string) => {
                    eq: (c: string, v: string) => {
                        is: (c: string, v: null) => {
                            order: (c: string, o: { ascending: boolean }) => Promise<{ data: { id: string, scheduled_at: string }[] | null, error: unknown }>
                        }
                    }
                }
            }
        }

        const { data: items, error: fetchError } = await (supabase
            .from('content_queue') as unknown as SchedulerQueryBuilder)
            .select('id, scheduled_at')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .is('scheduled_at', null)
            .order('created_at', { ascending: true })

        if (fetchError) throw fetchError
        if (!items || items.length === 0) return { success: true, count: 0 }

        // 3. Calculation Logic
        const updates: { id: string; scheduled_at: string }[] = []
        let currentPointer = new Date()

        // Ensure we don't schedule in the past
        currentPointer = addMinutes(currentPointer, 30)

        for (const item of items) {
            let foundSlot = false
            while (!foundSlot) {
                const dayOfWeek = currentPointer.getDay() // 0=Sun, 1=Mon...
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                const dayType = isWeekend ? 'weekends' : 'workdays'
                const slots = config[dayType].hours.sort()

                for (const slotTime of slots) {
                    const [h, m] = slotTime.split(':').map(Number)
                    const slotDate = setMinutes(setHours(currentPointer, h), m)

                    // If this slot is still in the future relative to our pointer progress
                    if (isBefore(currentPointer, slotDate)) {
                        updates.push({
                            id: item.id,
                            scheduled_at: slotDate.toISOString()
                        })
                        currentPointer = slotDate // Advance pointer to this slot
                        foundSlot = true
                        break
                    }
                }

                if (!foundSlot) {
                    // Move to next day and reset to start of day
                    currentPointer = addDays(currentPointer, 1)
                    currentPointer = setMinutes(setHours(currentPointer, 0), 0)
                }
            }
        }

        // 4. Batch Update
        for (const update of updates) {
            await (supabase.from('content_queue') as unknown as SafeUpdateBuilder<'content_queue'>)
                .update({ scheduled_at: update.scheduled_at })
                .eq('id', update.id)
        }

        return { success: true, count: updates.length }

    } catch (error: unknown) {
        console.error("AutoFill Error:", error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown auto-sched error' }
    }
}
