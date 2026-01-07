'use server'

import { createClient } from '@/utils/supabase/server'
import { generateImageFal } from '@/lib/ai/fal'
import { runChapterBlueprintFlow, runBlockGenerationFlow } from '@/lib/ai/flows'
import { revalidatePath } from 'next/cache'

/**
 * Triggers real image generation for a block
 */
async function callFalAiFlux(prompt: string): Promise<string> {
    console.log("Calling real FAL.ai Flux with prompt:", prompt)
    return await generateImageFal(prompt, {
        skipText: true,
        image_size: "landscape_hd"
    });
}

export async function generateChapterBlueprintAction(chapterId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Not authenticated" }

        // 1. Fetch chapter and project context safely
        const { data: chapter, error: chapterError } = await (supabase
            .from('content_chapters')
            .select(`
                *,
                premium_content_projects!inner (*)
            `)
            .eq('id', chapterId)
            .single() as any)

        if (chapterError || !chapter) {
            console.error("Chapter fetch error:", chapterError)
            return { success: false, error: "Chapter not found" }
        }

        // 2. Generate the Blueprint (Block sequence)
        const projectTitle = (chapter as any).premium_content_projects?.title || 'MassGenix Project'

        const blueprint = await runChapterBlueprintFlow({
            chapterTitle: (chapter as any).title,
            chapterDescription: (chapter as any).summary || '',
            ebookTopic: projectTitle,
            context: {
                companyName: 'MassGenix',
                niche: 'Digital Marketing'
            },
            language: 'Español'
        })

        if (!blueprint?.blocks?.length) {
            return { success: false, error: "AI failed to generate structural blueprint" }
        }

        // 3. Insert Blocks as Pending
        const blocksToInsert = blueprint.blocks.map((b, idx) => ({
            project_id: (chapter as any).premium_project_id,
            chapter_id: (chapter as any).id,
            index: idx,
            type: b.type,
            status: 'Pending',
            content_json: { reasoning: b.reasoning }
        }))

        const { error: blockError } = await (supabase
            .from('content_blocks') as any)
            .insert(blocksToInsert)

        if (blockError) {
            console.error("Blueprint insert error:", blockError)
            return { success: false, error: blockError.message }
        }

        revalidatePath(`/premium-forge/${(chapter as any).premium_project_id}`)
        return { success: true, count: blocksToInsert.length }
    } catch (error: any) {
        console.error("Blueprint generation fatal error:", error)
        return { success: false, error: error.message || "Unknown error" }
    }
}

export async function generateBlockContentAction(blockId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Not authenticated" }

        // 1. Fetch block with its project safely
        const { data: block, error: blockError } = await (supabase
            .from('content_blocks')
            .select(`
                *,
                premium_content_projects!inner (*)
            `)
            .eq('id', blockId)
            .single() as any)

        if (blockError || !block) {
            console.error("Block fetch error:", blockError)
            return { success: false, error: "Block not found" }
        }

        // Update status to Generating
        await (supabase
            .from('content_blocks') as any)
            .update({ status: 'Generating' })
            .eq('id', blockId)

        console.log("Running block generation for:", blockId, "type:", (block as any).type)

        // 2. Run Atomic Generation
        const ebookTitle = (block as any).premium_content_projects?.title || 'MassGenix Project'

        const genResult = await runBlockGenerationFlow({
            blockType: (block as any).type,
            chapterTitle: ebookTitle,
            ebookTopic: ebookTitle,
            context: {
                companyName: 'MassGenix',
                niche: 'Digital Marketing'
            },
            language: 'Español'
        })

        console.log("AI Generation Result for block:", blockId, JSON.stringify(genResult, null, 2))

        // 3. Update DB with content
        const { error: updateError } = await (supabase
            .from('content_blocks') as any)
            .update({
                content_json: genResult.content || {},
                image_url: genResult.image_prompt || null,
                status: genResult.image_prompt ? 'ProcessingImage' : 'Completed'
            })
            .eq('id', blockId)

        if (updateError) {
            console.error("Database update error (Block content):", updateError)
            return { success: false, error: updateError.message }
        }

        console.log("Database updated with content for block:", blockId)

        // 4. Trigger Image Generation if needed
        if (genResult.image_prompt) {
            try {
                console.log("Starting image generation for block:", blockId)
                const finalImageUrl = await callFalAiFlux(genResult.image_prompt)
                console.log("Image generation success. New URL:", finalImageUrl)

                const { error: imgUpdateError } = await (supabase
                    .from('content_blocks') as any)
                    .update({
                        image_url: finalImageUrl,
                        status: 'Completed'
                    })
                    .eq('id', blockId)

                if (imgUpdateError) {
                    console.error("Database update error (Image URL):", imgUpdateError)
                }
            } catch (imgError) {
                console.error("Image generation failed", imgError)
                await (supabase
                    .from('content_blocks') as any)
                    .update({ status: 'Error' })
                    .eq('id', blockId)
            }
        }

        revalidatePath(`/premium-forge/${(block as any).project_id}`)
        return { success: true }
    } catch (error: any) {
        console.error("Block generation fatal error:", error)
        return { success: false, error: error.message || "Unknown error" }
    }
}

export async function updateBlockContentAction(blockId: string, updates: { content_json?: any, html_override?: string, index?: number }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await (supabase
        .from('content_blocks') as any)
        .update(updates)
        .eq('id', blockId)

    if (error) throw error
    return { success: true }
}
