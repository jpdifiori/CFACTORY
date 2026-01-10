'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2 } from 'lucide-react'
import { SafeSelectBuilder } from '@/utils/supabaseSafe'

export default function HubRedirect() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const redirect = async () => {
            // ...

            const { data: projects } = await (supabase
                .from('project_master') as unknown as SafeSelectBuilder<'project_master'>)
                .select('id')
                .order('created_at', { ascending: false })
                .limit(1)

            if (projects && projects.length > 0) {
                router.replace(`/hub/${projects[0].id}`)
            } else {
                router.replace('/projects/new')
            }
        }

        redirect()
    }, [router, supabase])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            <p className="font-black text-gray-500 uppercase tracking-widest text-xs">Redirecting to project hub...</p>
        </div>
    )
}
