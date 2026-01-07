'use server'

import { createClient } from '@/utils/supabase/server'
import { addDays, setHours, setMinutes, startOfHour, isBefore, addMinutes } from 'date-fns'

export async function autoFillScheduleAction(projectId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Auth required" }

    try {
        // 1. Fetch User Profile for schedule_config
        const { data: profile } = await (supabase
            .from('profiles')
            .select('schedule_config')
            .eq('id', user.id)
            .single() as any)

        const config = (profile as any)?.schedule_config || {
            workdays: { count: 1, hours: ['09:00'] },
            weekends: { count: 1, hours: ['12:00'] }
        }

        // 2. Fetch all Unscheduled items in the project queue
        const { data: items, error: fetchError } = await supabase
            .from('content_queue')
            .select('id, scheduled_at')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .is('scheduled_at', null)
            .order('created_at', { ascending: true })

        if (fetchError) throw fetchError
        if (!items || items.length === 0) return { success: true, count: 0 }

        // 3. Calculation Logic
        const updates = []
        let currentPointer = new Date()

        // Ensure we don't schedule in the past
        currentPointer = addMinutes(currentPointer, 30)

        for (const item of (items as any[])) {
            let foundSlot = false
            while (!foundSlot) {
                const dayOfWeek = currentPointer.getDay() // 0=Sun, 1=Mon...
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                const dayType = isWeekend ? 'weekends' : 'workdays'
                const slots = config[dayType].hours.sort()

                for (const slotTime of slots) {
                    const [h, m] = slotTime.split(':').map(Number)
                    let slotDate = setMinutes(setHours(currentPointer, h), m)

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

        // 4. Batch Update (Supabase handle individual updates in loop or sophisticated RPC)
        // For simplicity in this demo, we do individual updates or a single call if RPC is available.
        // Direct update by ID loop:
        for (const update of updates) {
            await (supabase.from('content_queue') as any)
                .update({ scheduled_at: update.scheduled_at })
                .eq('id', update.id)
        }

        return { success: true, count: updates.length }

    } catch (error: any) {
        console.error("AutoFill Error:", error)
        return { success: false, error: error.message }
    }
}
