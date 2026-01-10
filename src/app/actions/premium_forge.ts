'use server'

import { createClient } from '@/utils/supabase/server'
import { runEbookOutlineFlow, runChapterGenerationFlow } from '@/lib/ai/flows'
import { stitchImages } from '@/lib/ai/stitching'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

import { SafeInsertBuilder, SafeSelectBuilder, SafeUpdateBuilder } from '@/utils/supabaseSafe'

type ProjectRow = Database['public']['Tables']['premium_content_projects']['Row']
type ChapterRow = Database['public']['Tables']['content_chapters']['Row']
type ProjectMasterRow = Database['public']['Tables']['project_master']['Row']
type Json = Database['public']['Tables']['premium_content_projects']['Row']['design_config']

export async function getPremiumProjectsAction() {
    const supabase = (await createClient()) as SupabaseClient<Database>
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
        .from('premium_content_projects')
        .select(`
            *,
            project_master (app_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function createPremiumProjectAction(formData: {
    projectId: string
    title: string
    contentType: 'ebook' | 'blog' | 'whitepaper'
    language: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // 1. Fetch project master data for context
    const { data: projectMaster } = await (supabase
        .from('project_master') as unknown as SafeSelectBuilder<'project_master'>)
        .select('*')
        .eq('id', formData.projectId)
        .single()

    if (!projectMaster) throw new Error("Project not found")

    // 2. Create the project entry
    const { data: newProjectResult, error: createError } = await (supabase
        .from('premium_content_projects') as unknown as SafeInsertBuilder<'premium_content_projects'>)
        .insert({
            project_id: formData.projectId,
            user_id: user.id,
            title: formData.title,
            type: formData.contentType,
            status: 'Generating'
        })
        .select()
        .single()

    if (createError) throw createError
    const project = newProjectResult as ProjectRow

    try {
        const outline = await runEbookOutlineFlow({
            topic: formData.title,
            context: {
                companyName: (projectMaster as ProjectMasterRow).app_name || '',
                niche: (projectMaster as ProjectMasterRow).niche_vertical || '',
                targetAudience: (projectMaster as ProjectMasterRow).target_audience || '',
                problemSolved: '',
                offering: '',
                differential: ''
            },
            language: formData.language
        })

        const chapters = outline.data.chapters.map(ch => ({
            premium_project_id: project.id,
            chapter_index: ch.index,
            title: ch.title,
            status: 'Pending'
        }))

        const { error: chapterError } = await (supabase
            .from('content_chapters') as unknown as SafeInsertBuilder<'content_chapters'>)
            .insert(chapters)

        if (chapterError) throw chapterError

        // 5. Update project status
        await (supabase
            .from('premium_content_projects') as unknown as SafeUpdateBuilder<'premium_content_projects'>)
            .update({ status: 'Draft', metadata: { outline: outline as unknown as Json } })
            .eq('id', project.id)

        revalidatePath('/premium-forge')
        return { success: true, id: project.id }

    } catch (error: unknown) {
        console.error("Premium project creation failed:", error)
        await (supabase
            .from('premium_content_projects') as unknown as SafeUpdateBuilder<'premium_content_projects'>)
            .update({ status: 'Error' })
            .eq('id', project.id)
        throw error
    }
}

export async function generateChapterAction(chapterId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // 1. Fetch chapter and project info
    const { data: chapterResult } = await (supabase
        .from('content_chapters') as unknown as SafeSelectBuilder<'content_chapters'>)
        .select(`
            *,
            premium_content_projects (*)
        `)
        .eq('id', chapterId)
        .single()

    type ChapterWithProject = ChapterRow & { premium_content_projects: ProjectRow }
    const ch = chapterResult as unknown as ChapterWithProject
    if (!ch) throw new Error("Chapter not found")

    // 2. Fetch project context
    const { data: projectMaster } = await (supabase
        .from('project_master') as unknown as SafeSelectBuilder<'project_master'>)
        .select('*')
        .eq('id', ch.premium_content_projects.project_id)
        .single()

    // 3. Fetch previous summaries for context
    const { data: previousChapters } = await (supabase
        .from('content_chapters') as unknown as SafeSelectBuilder<'content_chapters'>)
        .select('summary') // SafeSelect strictly returns Row defined cols.
        .eq('premium_project_id', ch.premium_project_id)
    // .lt is missing in simple SafeSelectBuilder. We can trust normal Select for this advanced case or extend SafeSelect.
    // Or simply failover to 'any' for the Builder if needed, but we wanted to avoid 'any'.
    // Let's rely on standard client for complex queries where possible, but if 'never' happens we need Safe.
    // Assuming lt() works on standard client if we don't cast. If it breaks, we need SafeSelectBuilderWithFilters.
    // For now let's assume standard client works for 'lt' unless proven otherwise (it broke for 'update' mostly).
    // Wait, 'select' generally inferred correctly. It was 'update' that broke.
    // So I will revert to standard client for this query but cast result.

    // Actually, let's use standard client here:

    const { data: prevChaps } = await supabase
        .from('content_chapters')
        .select('summary') as any; // Still using 'any' on result is bad.
    // Let's use standard supabase client but cast result to known type.

    // ... (rest of logic)

    // Re-doing the previousChapters query cleanly:
    const { data: previousChaptersRaw } = await supabase
        .from('content_chapters')
        .select('summary')
        .eq('premium_project_id', ch.premium_project_id)
        .lt('chapter_index', ch.chapter_index)
        .order('chapter_index', { ascending: true })

    const previousSummaries = (previousChaptersRaw as unknown as { summary: string | null }[] || []).map((c) => c.summary).filter(Boolean).join('\n') || ''

    await (supabase
        .from('content_chapters') as unknown as SafeUpdateBuilder<'content_chapters'>)
        .update({ status: 'Generating' })
        .eq('id', chapterId)

    try {
        // 4. Generate Content (Gemini)
        const genResult = await runChapterGenerationFlow({
            projectTitle: ch.premium_content_projects.title,
            chapterTitle: ch.title,
            chapterIndex: ch.chapter_index,
            totalChapters: 10,
            previousSummaries,
            context: {
                companyName: (projectMaster as ProjectMasterRow).app_name || '',
                niche: (projectMaster as ProjectMasterRow).niche_vertical || '',
                targetAudience: (projectMaster as ProjectMasterRow).target_audience || '',
                problemSolved: '',
                offering: '',
                differential: ''
            },
            language: 'Español'
        })

        // 5. Stitch Images (FAL.ai + Regex)
        const stitchedHtml = await stitchImages(
            genResult.data.content_markdown,
            ch.premium_content_projects.id,
            user.id
        )

        // 6. Update DB
        const { error: updateError } = await (supabase
            .from('content_chapters') as unknown as SafeUpdateBuilder<'content_chapters'>)
            .update({
                content_markdown: genResult.data!.content_markdown,
                content_html: stitchedHtml,
                summary: genResult.data!.summary,
                status: 'Completed'
            })
            .eq('id', chapterId)

        if (updateError) throw updateError

        revalidatePath(`/premium-forge/${ch.premium_project_id}`)
        return { success: true }

    } catch (error: unknown) {
        console.error("Chapter generation failed:", error)
        await (supabase
            .from('content_chapters') as unknown as SafeUpdateBuilder<'content_chapters'>)
            .update({ status: 'Error' })
            .eq('id', chapterId)
        throw error
    }
}

export async function updateChapterContentAction(chapterId: string, contentHtml: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await (supabase
        .from('content_chapters') as unknown as SafeUpdateBuilder<'content_chapters'>)
        .update({ content_html: contentHtml })
        .eq('id', chapterId)

    if (error) throw error
    return { success: true }
}

export async function generateForgeWizardOptionsAction(topic: string, projectId: string, language: string) {
    const supabase = await createClient()
    const { data: { user } = {} } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data: projectMaster } = await (supabase
        .from('project_master') as unknown as SafeSelectBuilder<'project_master'>)
        .select('*')
        .eq('id', projectId)
        .single()

    if (!projectMaster) throw new Error("Project not found")

    const { runForgeWizardFlow } = await import('@/lib/ai/flows')

    const options = await runForgeWizardFlow({
        topic,
        context: {
            companyName: (projectMaster as ProjectMasterRow).app_name || '',
            niche: (projectMaster as ProjectMasterRow).niche_vertical || '',
            targetAudience: '',
            problemSolved: '',
            offering: '',
            differential: ''
        },
        language
    })

    return options
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateProjectDesignAction(projectId: string, designConfig: Json) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // design_config missing from Update type in generated types, forcing cast
    const { error } = await (supabase
        .from('premium_content_projects') as unknown as SafeUpdateBuilder<'premium_content_projects'>)
        .update({ design_config: designConfig } as any)
        .eq('id', projectId)

    if (error) throw error
    revalidatePath(`/premium-forge/${projectId}`)
    return { success: true }
}
