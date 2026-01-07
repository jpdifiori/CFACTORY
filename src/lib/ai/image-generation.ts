import { supabase } from '@/lib/supabase'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY // Or IMAGE_GENERATION_API_KEY

interface GenerateImageResult {
    url: string
}

/**
 * Generates an image using OpenAI DALL-E 3
 */
export async function generateImage(prompt: string): Promise<string | null> {
    if (!OPENAI_API_KEY) {
        console.warn("No OpenAI API Key found. Returning mock image.")
        return "https://via.placeholder.com/1024x1024.png?text=AI+Generated+Image"
    }

    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                response_format: "url" // or b64_json
            })
        })

        const data = await response.json()

        if (data.error) {
            throw new Error(data.error.message)
        }

        return data.data[0].url
    } catch (error) {
        console.error('Image Generation Error:', error)
        return null
    }
}

/**
 * Downloads an image from a URL and uploads it to Supabase Storage
 */
export async function uploadImageToSupabase(imageUrl: string, projectId: string): Promise<string | null> {
    try {
        // 1. Download image
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const arrayBuffer = await blob.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // 2. Upload to Supabase
        const fileName = `${projectId}/${Date.now()}.png`
        const { data, error } = await supabase
            .storage
            .from('project-images')
            .upload(fileName, buffer, {
                contentType: 'image/png',
                upsert: false
            })

        if (error) {
            console.error('Supabase Upload Error:', error)
            throw error
        }

        // 3. Get Public URL
        const { data: publicData } = supabase
            .storage
            .from('project-images')
            .getPublicUrl(fileName)

        return publicData.publicUrl
    } catch (error) {
        console.error('Failed to upload image:', error)
        return null
    }
}
