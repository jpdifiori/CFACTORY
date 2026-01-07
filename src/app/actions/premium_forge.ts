'use server'

import { createClient } from '@/utils/supabase/server'
import { runEbookOutlineFlow, runChapterGenerationFlow } from '@/lib/ai/flows'
import { stitchImages } from '@/lib/ai/stitching'
import { revalidatePath } from 'next/cache'

export async function getPremiumProjectsAction() {
    const supabase = await createClient()
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
        .from('project_master')
        .select('*')
        .eq('id', formData.projectId)
        .single() as any)

    if (!projectMaster) throw new Error("Project not found")

    // 2. Create the project entry
    const { data: newProjectResult, error: createError } = await (supabase
        .from('premium_content_projects') as any)
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
    const project = newProjectResult as any

    try {
        const outline = await runEbookOutlineFlow({
            topic: formData.title,
            context: {
                companyName: (projectMaster as any).app_name,
                niche: (projectMaster as any).niche_vertical,
                targetAudience: (projectMaster as any).target_audience
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
            .from('content_chapters') as any)
            .insert(chapters)

        if (chapterError) throw chapterError

        // 5. Update project status
        await (supabase
            .from('premium_content_projects') as any)
            .update({ status: 'Draft', metadata: { outline } })
            .eq('id', (project as any).id)

        revalidatePath('/premium-forge')
        return { success: true, id: (project as any).id }

    } catch (error: any) {
        console.error("Premium project creation failed:", error)
        await (supabase
            .from('premium_content_projects') as any)
            .update({ status: 'Error' })
            .eq('id', (project as any).id)
        throw error
    }
}

export async function generateChapterAction(chapterId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // 1. Fetch chapter and project info
    const { data: chapterResult } = await (supabase
        .from('content_chapters')
        .select(`
            *,
            premium_content_projects (*)
        `)
        .eq('id', chapterId)
        .single() as any)

    const ch = chapterResult as any
    if (!ch) throw new Error("Chapter not found")

    // 2. Fetch project context
    const { data: projectMaster } = await (supabase
        .from('project_master')
        .select('*')
        .eq('id', ch.premium_content_projects.project_id)
        .single() as any)

    // 3. Fetch previous summaries for context
    const { data: previousChapters } = await supabase
        .from('content_chapters')
        .select('summary')
        .eq('premium_project_id', ch.premium_project_id)
        .lt('chapter_index', ch.chapter_index)
        .order('chapter_index', { ascending: true })

    const previousSummaries = previousChapters?.map((c: any) => c.summary).filter(Boolean).join('\n') || ''

    await (supabase
        .from('content_chapters') as any)
        .update({ status: 'Generating' })
        .eq('id', chapterId)

    try {
        // 4. Generate Content (Gemini)
        const genResult = await runChapterGenerationFlow({
            projectTitle: ch.premium_content_projects.title,
            chapterTitle: ch.title,
            chapterIndex: ch.chapter_index,
            totalChapters: 10, // Default or fetch from metadata
            previousSummaries,
            context: {
                companyName: (projectMaster as any).app_name,
                niche: (projectMaster as any).niche_vertical,
                targetAudience: (projectMaster as any).target_audience
            },
            language: 'Español' // Should be passed from project metadata
        })

        // 5. Stitch Images (FAL.ai + Regex)
        const stitchedHtml = await stitchImages(
            genResult.data.content_markdown,
            ch.premium_content_projects.id,
            user.id
        )

        // 6. Update DB
        const { error: updateError } = await (supabase
            .from('content_chapters') as any)
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

    } catch (error: any) {
        console.error("Chapter generation failed:", error)
        await (supabase
            .from('content_chapters') as any)
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
        .from('content_chapters') as any)
        .update({ content_html: contentHtml })
        .eq('id', chapterId)

    if (error) throw error
    return { success: true }
}

export async function generateForgeWizardOptionsAction(topic: string, projectId: string, language: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data: projectMaster } = await (supabase
        .from('project_master')
        .select('*')
        .eq('id', projectId)
        .single() as any)

    if (!projectMaster) throw new Error("Project not found")

    const { runForgeWizardFlow } = await import('@/lib/ai/flows')

    const options = await runForgeWizardFlow({
        topic,
        context: {
            companyName: (projectMaster as any).app_name,
            niche: (projectMaster as any).niche_vertical
        },
        language
    })

    return options
}

export async function updateProjectDesignAction(projectId: string, designConfig: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await (supabase
        .from('premium_content_projects') as any)
        .update({ design_config: designConfig })
        .eq('id', projectId)

    if (error) throw error
    revalidatePath(`/premium-forge/${projectId}`)
    return { success: true }
}
