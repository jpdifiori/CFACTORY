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

import { SafeInsertBuilder, SafeSelectBuilder, SafeUpdateBuilder } from '@/utils/supabaseSafe'

// ...

export async function generateChapterBlueprintAction(chapterId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Not authenticated" }

        // 1. Fetch chapter and project context safely
        const { data: chapter, error: chapterError } = await (supabase
            .from('content_chapters') as unknown as SafeSelectBuilder<'content_chapters'>)
            .select(`
                *,
                premium_content_projects!inner (*)
            `)
            .eq('id', chapterId)
            .single()

        // Cast chapter to include joined Project data
        const ch = chapter as any

        if (chapterError || !ch) {
            console.error("Chapter fetch error:", chapterError)
            return { success: false, error: "Chapter not found" }
        }

        // 2. Generate the Blueprint (Block sequence)
        const projectTitle = ch.premium_content_projects?.title || 'MassGenix Project'

        const blueprint = await runChapterBlueprintFlow({
            chapterTitle: ch.title,
            chapterDescription: ch.summary || '',
            ebookTopic: projectTitle,
            context: {
                companyName: 'MassGenix',
                niche: 'Digital Marketing',
                targetAudience: '',
                problemSolved: '',
                offering: '',
                differential: ''
            },
            language: 'Español'
        })

        if (!blueprint?.data?.blocks?.length) {
            return { success: false, error: "AI failed to generate structural blueprint" }
        }

        // 3. Insert Blocks as Pending
        const blocksToInsert = blueprint.data.blocks.map((b, idx) => ({
            project_id: ch.premium_project_id,
            chapter_id: ch.id,
            index: idx,
            type: b.type,
            status: 'Pending',
            content_json: { reasoning: b.reasoning }
        }))

        const { error: blockError } = await (supabase
            .from('content_blocks') as unknown as SafeInsertBuilder<'content_blocks'>)
            .insert(blocksToInsert)

        if (blockError) {
            console.error("Blueprint insert error:", blockError)
            return { success: false, error: 'Failed to insert blocks' }
        }

        revalidatePath(`/premium-forge/${ch.premium_project_id}`)
        return { success: true, count: blocksToInsert.length }
    } catch (error: unknown) {
        console.error("Blueprint generation fatal error:", error)
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
}

export async function generateBlockContentAction(blockId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Not authenticated" }

        // 1. Fetch block with its project safely
        const { data: block, error: blockError } = await (supabase
            .from('content_blocks') as unknown as SafeSelectBuilder<'content_blocks'>)
            .select(`
                *,
                premium_content_projects!inner (*)
            `)
            .eq('id', blockId)
            .single()

        const blk = block as any

        if (blockError || !blk) {
            console.error("Block fetch error:", blockError)
            return { success: false, error: "Block not found" }
        }

        // Update status to Generating
        await (supabase
            .from('content_blocks') as unknown as SafeUpdateBuilder<'content_blocks'>)
            .update({ status: 'Generating' })
            .eq('id', blockId)

        console.log("Running block generation for:", blockId, "type:", blk.type)

        // 2. Run Atomic Generation
        const ebookTitle = blk.premium_content_projects?.title || 'MassGenix Project'

        const genResult = await runBlockGenerationFlow({
            blockType: blk.type,
            chapterTitle: ebookTitle,
            ebookTopic: ebookTitle,
            context: {
                companyName: 'MassGenix',
                niche: 'Digital Marketing',
                targetAudience: '',
                problemSolved: '',
                offering: '',
                differential: ''
            },
            language: 'Español'
        })

        console.log("AI Generation Result for block:", blockId, JSON.stringify(genResult, null, 2))

        // 3. Update DB with content
        const { error: updateError } = await (supabase
            .from('content_blocks') as unknown as SafeUpdateBuilder<'content_blocks'>)
            .update({
                content_json: genResult.data.content || {},
                image_url: genResult.data.image_prompt || null,
                status: genResult.data.image_prompt ? 'ProcessingImage' : 'Completed'
            })
            .eq('id', blockId)

        if (updateError) {
            console.error("Database update error (Block content):", updateError)
            return { success: false, error: 'Database update failed' }
        }

        console.log("Database updated with content for block:", blockId)

        // 4. Trigger Image Generation if needed
        if (genResult.data.image_prompt) {
            try {
                console.log("Starting image generation for block:", blockId)
                const finalImageUrl = await callFalAiFlux(genResult.data.image_prompt)
                console.log("Image generation success. New URL:", finalImageUrl)

                const { error: imgUpdateError } = await (supabase
                    .from('content_blocks') as unknown as SafeUpdateBuilder<'content_blocks'>)
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
                    .from('content_blocks') as unknown as SafeUpdateBuilder<'content_blocks'>)
                    .update({ status: 'Error' })
                    .eq('id', blockId)
            }
        }

        revalidatePath(`/premium-forge/${blk.project_id}`)
        return { success: true }
    } catch (error: unknown) {
        console.error("Block generation fatal error:", error)
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
}

export async function updateBlockContentAction(blockId: string, updates: { content_json?: unknown, html_override?: string, index?: number }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // We use cast to any on updates because standard update strictly checks schema and content_json is Json
    // SafeUpdateBuilder won't help if the input type isn't matching Update<T> exactly without casting
    // But we avoid 'as any' on the builder itself by using SafeUpdateBuilder logic or just explicit cast.

    // Using SafeUpdateBuilder to ensure 'never' is avoided
    const { error } = await (supabase
        .from('content_blocks') as unknown as SafeUpdateBuilder<'content_blocks'>)
        .update(updates as any) // Cast updates payload to matches internal expectation if needed, or refine Update type.
        .eq('id', blockId)

    if (error) throw error
    return { success: true }
}
