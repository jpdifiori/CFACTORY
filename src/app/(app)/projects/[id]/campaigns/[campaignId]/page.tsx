'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/database.types'
import { ArrowLeft, Target, Paintbrush, Video, Layout, Zap, Layers, Sparkles, AlertCircle, CheckCircle2, Save, Eye, Terminal, Instagram, Linkedin, Facebook, Music2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { ContentCard } from '@/components/content/ContentCard'
import { QuickEditor } from '@/components/content/QuickEditor'
import { generateContentAction, optimizeDirectivesAction } from '@/app/actions/ai'
import { triggerImageGenerationAction, bakeImageWithTextAction } from '@/app/actions/imageActions'
import { useLanguage } from '@/context/LanguageContext'
import { useTitle } from '@/context/TitleContext'
import { IdeaGenerator } from '@/components/campaigns/IdeaGenerator'
import { CampaignIdea } from '@/lib/ai/flows'
import { CreatableSelect } from '@/components/ui/CreatableSelect'
import { publishContentToSocialsAction } from '@/app/actions/publishActions'

type ContentType = Database['public']['Tables']['content_queue']['Row']['content_type']

// LOV Constants (Synced with NewCampaignPage)
const STYLE_OPTIONS = [
    { value: 'Fotografia_Realista', label: 'Fotografía Realista' },
    { value: 'Ilustracion_3D', label: 'Ilustración 3D' },
    { value: 'Minimalista', label: 'Estilo Minimalista (Apple)' },
    { value: 'Cinematic_8k', label: 'Cinematic 8K' },
]

const MOOD_OPTIONS = [
    "Luxury", "Energetic", "Cozy", "Professional", "Minimalist",
    "Futuristic", "Nature-focused", "Industrial", "Playful", "Serene",
    "Dark & Moody", "Bright & Airy"
]

const PALETTE_OPTIONS = [
    "Pastel Soft", "Dark Mode Neon", "Earth Tones", "Vibrant Pop"
]

const VOICE_OPTIONS = [
    "Professional", "Funny", "Urgent", "Educational", "Minimalist",
    "Inspirational", "Sarcastic", "Empathetic", "Authoritative", "Bold"
]

export default function CampaignDetailPage() {
    const params = useParams()
    const projectId = params.id as string
    const campaignId = params.campaignId as string
    const supabase = createClient()
    const router = useRouter()
    const { t, lang } = useLanguage()
    const { setTitle } = useTitle()

    const [campaign, setCampaign] = useState<Database['public']['Tables']['campaigns']['Row'] | null>(null)
    const [project, setProject] = useState<any>(null)
    const [items, setItems] = useState<any[]>([])

    // Generation Settings (Now Inline)
    const [genType, setGenType] = useState<ContentType>('Post')
    const [genQuantity, setGenQuantity] = useState(5)
    const [genLanguage, setGenLanguage] = useState<'Ingles' | 'Español'>('Español')
    const [genSize, setGenSize] = useState('square_hd')
    const [imageEngine, setImageEngine] = useState<'fal' | 'gemini'>('fal')
    const [isGenerating, setIsGenerating] = useState(false)
    const [lastGenTime, setLastGenTime] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [socialPlatform, setSocialPlatform] = useState('Instagram')
    const [customCopy, setCustomCopy] = useState('')
    const [customVisual, setCustomVisual] = useState('')
    const [isSavingConfig, setIsSavingConfig] = useState(false)
    const [showPromptPreview, setShowPromptPreview] = useState(false)
    const [skipImageText, setSkipImageText] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)
    const [isOptimizingCopy, setIsOptimizingCopy] = useState(false)
    const [isOptimizingVisual, setIsOptimizingVisual] = useState(false)

    // VISUAL DNA States
    const [vStyle, setVStyle] = useState('Fotografia_Realista')
    const [vMood, setVMood] = useState('Professional')
    const [vPalette, setVPalette] = useState('colores modernos, alegres, desafiantes')
    const [vVoice, setVVoice] = useState('Professional')
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Instagram'])
    const [resourceTab, setResourceTab] = useState('Todo')

    const PLATFORM_SIZES: Record<string, Record<string, string>> = {
        'Instagram': { 'Post': 'square_hd', 'Story': 'portrait_16_9' },
        'TikTok': { 'Carrusel': 'portrait_16_9' },
        'LinkedIn': { 'Post': 'square_hd', 'Landscape': 'landscape_16_9', 'Article': 'landscape_16_9' },
        'Facebook': { 'Post': 'square_hd', 'Landscape': 'landscape_16_9', 'Story': 'portrait_16_9' }
    }

    // Editor State
    const [editingItem, setEditingItem] = useState<any | null>(null)

    useEffect(() => {
        if (campaignId && projectId) {
            fetchCampaign()
            fetchProject()
            fetchCampaignItems()
        }
    }, [campaignId, projectId])

    // Auto-refresh when items are pending images
    useEffect(() => {
        const hasPending = items.some(item => item.status === 'AI_Generated')
        if (!hasPending) return

        const interval = setInterval(() => {
            fetchCampaignItems()
        }, 3000) // Poll every 3s

        return () => clearInterval(interval)
    }, [items])

    // Manage Dynamic Header Title
    useEffect(() => {
        if (campaign) {
            if (project) {
                setTitle(`${project.app_name} / ${campaign.name}`)
            } else {
                setTitle(campaign.name)
            }
        }

        // Reset title on unmount
        return () => setTitle('')
    }, [campaign, project, setTitle])

    // Auto-hide success message
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    const fetchCampaign = async () => {
        const { data } = await (supabase.from('campaigns').select('*').eq('id', campaignId).single() as any)
        if (data) {
            setCampaign(data)
            setCustomCopy(data.custom_copy_instructions || '')
            setCustomVisual(data.custom_visual_instructions || '')
            if (data.visual_style) setVStyle(data.visual_style)
            if (data.mood) setVMood(data.mood)
            if (data.color_palette) setVPalette(data.color_palette)
            if (data.brand_voice) setVVoice(data.brand_voice)

            // Set initial Title
            setTitle(data.name)
        }
    }

    const fetchProject = async () => {
        const { data } = await (supabase.from('project_master').select('*').eq('id', projectId).single() as any)
        if (data) setProject(data)
    }

    const fetchCampaignItems = async () => {
        const { data } = await supabase.from('content_queue').select('*').eq('campaign_id', campaignId).order('created_at', { ascending: false })
        if (data) setItems(data)
    }

    const handleEdit = (item: any) => {
        setEditingItem(item)
    }

    const handleSaveContent = async (id: string, newContent: any, imagePrompt?: string, triggerGen?: boolean, overlayText?: string, overlayStyle?: any, imageFinalUrl?: string, skipText?: boolean, targetSize?: string) => {
        try {
            setItems(prev => prev.map(item => {
                if (item.id === id) {
                    return {
                        ...item,
                        gemini_output: newContent,
                        image_ai_prompt: imagePrompt || item.image_ai_prompt,
                        overlay_text_content: overlayText !== undefined ? overlayText : item.overlay_text_content,
                        overlay_style_json: overlayStyle !== undefined ? overlayStyle : item.overlay_style_json,
                        image_final_url: imageFinalUrl || item.image_final_url
                    }
                }
                return item
            }))

            // Persist to DB
            const { error: dbError } = await (supabase.from('content_queue') as any)
                .update({
                    gemini_output: newContent,
                    image_ai_prompt: imagePrompt,
                    overlay_text_content: overlayText,
                    overlay_style_json: overlayStyle,
                    image_final_url: imageFinalUrl
                })
                .eq('id', id)

            if (dbError) throw dbError

            setSuccess(t.common.success || "Content updated successfully")

            // If we have new text/style but NO new generation, trigger a re-bake
            if (!triggerGen && overlayText && overlayStyle) {
                console.log("Saving Content: Triggering re-bake for", id);
                await bakeImageWithTextAction(id, {
                    text: overlayText,
                    style: overlayStyle
                })
            }

            if (triggerGen && imagePrompt) {
                triggerImageGenerationAction(id, imagePrompt, {
                    image_size: targetSize || genSize,
                    num_inference_steps: 28,
                    style: vStyle, // Use Visual DNA
                    mood: vMood,
                    color_palette: vPalette,
                    imageText: overlayText || newContent.short_image_text,
                    customText: overlayText,
                    customStyle: overlayStyle,
                    masterInstructions: customVisual,
                    language: genLanguage,
                    engine: imageEngine,
                    skipText: skipText !== undefined ? skipText : skipImageText
                })
            }
        } catch (e: any) {
            console.error("Error saving content item:", e)
            setError(`${t.common.error}: ${e.message}`)
        }
    }

    const handlePublish = async (itemId: string) => {
        try {
            const res = await publishContentToSocialsAction(itemId)
            if (res.success) {
                setSuccess(`${t.common.success}: Published to ${res.targetsCount} platforms`)
                // Optimistic update
                setItems(prev => prev.map(item => item.id === itemId ? { ...item, status: 'Published' } : item))
            } else {
                setError(res.error || 'Publishing failed')
            }
        } catch (error: any) {
            setError(error.message || 'Publishing failed')
        }
    }

    const handleGenerate = async () => {
        if (!campaign || !project) return

        setError(null)
        const startTime = Date.now()
        setIsGenerating(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // CALL SERVER ACTION
            const result = await generateContentAction({
                context: {
                    niche: project.niche_vertical,
                    targetAudience: campaign.target_orientation || project.target_audience,
                    brandVoice: project.brand_voice,
                    problemSolved: campaign.problem_solved || project.problem_solved,
                    offering: project.description,
                    differential: campaign.differential || project.usp,
                    companyName: project.app_name,
                    target_url: campaign.target_url,
                    strategyContext: {
                        topic: campaign.topic || project.niche_vertical,
                        orientation: campaign.target_orientation || project.target_audience,
                        problem: campaign.problem_solved || project.problem_solved,
                        differential: campaign.differential || project.usp
                    }
                },
                campaign: {
                    ...campaign,
                    visual_style: vStyle as any,
                    mood: vMood,
                    color_palette: vPalette,
                    brand_voice: vVoice,
                    custom_copy_instructions: customCopy,
                    custom_visual_instructions: customVisual
                },
                config: {
                    count: genQuantity,
                    contentType: genType,
                    language: genLanguage
                }
            })

            if (!result.success) {
                throw new Error(result.error)
            }

            const queueItems = result.data!.map(res => ({
                project_id: projectId,
                user_id: user.id,
                campaign_id: campaignId,
                content_type: genType,
                social_platform: socialPlatform.toLowerCase(),
                status: 'AI_Generated',
                gemini_output: res,
                image_ai_prompt: res.image_prompt,
                confidence_score: 0.98,
                scheduled_at: new Date().toISOString()
            }))

            const { data: newItems, error: dbError } = await supabase
                .from('content_queue')
                .insert(queueItems as any)
                .select()

            if (dbError) throw new Error(`Database Error: ${dbError.message}`)

            // 4. Trigger Image Generation in background for each item
            if (newItems) {
                (newItems as any[]).forEach(item => {
                    const output = item.gemini_output as any;
                    // Add visual parameters
                    const visualParams: any = {
                        image_size: genSize,
                        engine: imageEngine,
                        language: genLanguage,
                        masterInstructions: customVisual,
                        num_inference_steps: 28,
                        style: vStyle,
                        mood: vMood,
                        color_palette: vPalette,
                        imageText: !skipImageText ? output.image_title : undefined,
                        skipText: skipImageText
                    }
                    triggerImageGenerationAction(item.id, item.image_ai_prompt, visualParams)
                })
            }

            setLastGenTime(Date.now() - startTime)
            await fetchCampaignItems()
        } catch (e: any) {
            console.error("GENERATION_FLOW_ERROR:", e)
            setError(e.message || "An unknown error occurred during generation.")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSaveCampaignConfig = async () => {
        setIsSavingConfig(true)
        try {
            const { error } = await (supabase
                .from('campaigns') as any)
                .update({
                    custom_copy_instructions: customCopy,
                    custom_visual_instructions: customVisual,
                    visual_style: vStyle,
                    mood: vMood,
                    color_palette: vPalette,
                    brand_voice: vVoice
                })
                .eq('id', campaignId)

            if (error) throw error
            // Refresh local state
            setCampaign(prev => prev ? {
                ...prev,
                custom_copy_instructions: customCopy,
                custom_visual_instructions: customVisual,
                visual_style: vStyle as any,
                mood: vMood,
                color_palette: vPalette,
                brand_voice: vVoice
            } : null)
            setSuccess(t.campaigns.save_success)
        } catch (e: any) {
            console.error("Error saving campaign config:", e)
            setError(`${t.common.error}: ${e.message}`)
        } finally {
            setIsSavingConfig(false)
        }
    }

    const handleSelectIdea = (idea: CampaignIdea) => {
        // Apply idea to custom directives
        const copyDirective = `${t.campaigns.applying_idea}\n\nTOPIC: ${idea.title}\nCONTEXT: ${idea.description}\nANGLE: ${idea.angle}`
        const visualDirective = `${t.campaigns.visual_impl}: ${idea.title}. ${t.campaigns.concept_desc}: ${idea.visual_prompt}`

        setCustomCopy(copyDirective)
        setCustomVisual(visualDirective)
        setGenQuantity(1)

        // Scroll to generator panel
        const panel = document.getElementById('gen-hub')
        if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    const handleOptimizeDirectives = async (type: 'copy' | 'visual') => {
        if (!campaign || !project) return

        if (type === 'copy') setIsOptimizingCopy(true)
        else setIsOptimizingVisual(true)

        try {
            const result = await optimizeDirectivesAction({
                currentDirectives: type === 'copy' ? customCopy : customVisual,
                type,
                campaignContext: {
                    projectName: project.app_name,
                    niche: project.niche_vertical,
                    objective: campaign.objective,
                    targetAudience: campaign.target_orientation || project.target_audience,
                    language: genLanguage
                }
            })

            if (result.success && result.optimizedText) {
                if (type === 'copy') setCustomCopy(result.optimizedText)
                else setCustomVisual(result.optimizedText)
                setSuccess(t.common.success || "Directive optimized")
            } else {
                setError(result.error || "Failed to optimize")
            }
        } catch (e: any) {
            setError(e.message)
        } finally {
            if (type === 'copy') setIsOptimizingCopy(false)
            else setIsOptimizingVisual(false)
        }
    }

    if (!campaign || !project) return <div className="p-10 text-center text-gray-500 animate-pulse">{t.common.loading}</div>

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Error Display */}
            {error && (
                <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <div className="flex-1">
                        <p className="text-sm font-bold text-red-200 uppercase tracking-tighter">{t.settings.error}</p>
                        <p className="text-xs text-red-300/80 font-mono">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-white">×</button>
                </div>
            )}

            {/* Success Display */}
            {success && (
                <div className="bg-green-500/20 border border-green-500/50 p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <p className="text-xs font-bold text-green-200 uppercase tracking-widest">{success}</p>
                    <button onClick={() => setSuccess(null)} className="ml-auto text-green-400 hover:text-white">×</button>
                </div>
            )}
            {/* Nav */}
            <div className="flex items-center justify-between">
                <Link href={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {t.projects.back_to_project}
                </Link>
                <div />
            </div>

            {/* Campaign Identity Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-card to-secondary/10 border border-border rounded-3xl p-8 lg:p-12 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-32 -mt-32 rounded-full" />

                <div className="relative z-10">
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <Target className="w-6 h-6 text-primary" />
                                </div>
                                <h1 className="text-5xl font-black text-white tracking-tighter uppercase">{campaign.name}</h1>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-gray-400">
                                    {campaign.objective}
                                </span>
                                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-bold text-purple-400 capitalize">
                                    {campaign.visual_style.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>
                        <p className="text-gray-400 max-w-xl text-lg leading-relaxed italic">
                            "{campaign.mood} atmosphere with a {campaign.color_palette} color palette."
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> {t.campaigns.master_directives} (Copy)
                                        </label>
                                        <button
                                            onClick={() => handleOptimizeDirectives('copy')}
                                            disabled={isOptimizingCopy}
                                            className="px-2 py-1 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-md text-[9px] font-black text-primary uppercase tracking-tighter transition-all flex items-center gap-1.5 disabled:opacity-50"
                                        >
                                            {isOptimizingCopy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                            {t.campaigns.optimize}
                                        </button>
                                    </div>
                                    <textarea
                                        className="w-full h-24 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-primary/50 outline-none resize-none"
                                        placeholder="Add custom directives for text..."
                                        value={customCopy}
                                        onChange={(e) => setCustomCopy(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                            <Paintbrush className="w-3 h-3" /> {t.campaigns.master_directives} (Visual)
                                        </label>
                                        <button
                                            onClick={() => handleOptimizeDirectives('visual')}
                                            disabled={isOptimizingVisual}
                                            className="px-2 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-md text-[9px] font-black text-yellow-500 uppercase tracking-tighter transition-all flex items-center gap-1.5 disabled:opacity-50"
                                        >
                                            {isOptimizingVisual ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                            {t.campaigns.optimize}
                                        </button>
                                    </div>
                                    <textarea
                                        className="w-full h-24 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-primary/50 outline-none resize-none"
                                        placeholder="Add custom directives for images..."
                                        value={customVisual}
                                        onChange={(e) => setCustomVisual(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* VISUAL DNA PANEL */}
                            <div className="bg-black/20 border border-white/5 rounded-2xl p-6 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1.5 h-4 bg-primary rounded-full" />
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">{t.campaigns.visual_dna}</h4>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">{t.campaigns.base_style}</label>
                                            <select
                                                value={vStyle}
                                                onChange={(e) => setVStyle(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-white focus:ring-1 focus:ring-primary/50 outline-none appearance-none cursor-pointer"
                                            >
                                                {STYLE_OPTIONS.map(opt => (
                                                    <option key={opt.value} className="bg-gray-900" value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">{t.campaigns.voice_label}</label>
                                            <CreatableSelect
                                                options={VOICE_OPTIONS}
                                                value={vVoice}
                                                onChange={(val: string) => setVVoice(val)}
                                                placeholder={t.campaigns.voice_placeholder}
                                                className="!bg-transparent !border-none !p-0 !min-h-0"
                                                inputClassName="!bg-black/40 !border-white/10 !rounded-lg !px-3 !py-1.5 !text-[11px] !text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">{t.campaigns.mood_label}</label>
                                            <CreatableSelect
                                                options={MOOD_OPTIONS}
                                                value={vMood}
                                                onChange={(val: string) => setVMood(val)}
                                                placeholder={t.campaigns.mood_label}
                                                className="!bg-transparent !border-none !p-0 !min-h-0"
                                                inputClassName="!bg-black/40 !border-white/10 !rounded-lg !px-3 !py-1.5 !text-[11px] !text-white"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">{t.campaigns.palette_label}</label>
                                            <CreatableSelect
                                                options={PALETTE_OPTIONS}
                                                value={vPalette}
                                                onChange={(val: string) => setVPalette(val)}
                                                placeholder={t.campaigns.palette_label}
                                                className="!bg-transparent !border-none !p-0 !min-h-0"
                                                inputClassName="!bg-black/40 !border-white/10 !rounded-lg !px-3 !py-1.5 !text-[11px] !text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            onClick={() => setSkipImageText(!skipImageText)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${skipImageText ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'}`}
                                        >
                                            <span className="text-[9px] font-black uppercase tracking-widest">{t.campaigns.no_text_label}</span>
                                            <div className={`w-8 h-4 rounded-full relative transition-all ${skipImageText ? 'bg-primary' : 'bg-gray-600'}`}>
                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${skipImageText ? 'left-4.5' : 'left-0.5'}`} />
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-4 gap-2">
                            <button
                                onClick={() => setShowPromptPreview(true)}
                                className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-[10px] font-black text-blue-400 uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                                <Eye className="w-3 h-3" /> {t.campaigns.preview_logic}
                            </button>
                            <button
                                onClick={handleSaveCampaignConfig}
                                disabled={isSavingConfig}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black text-white uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                                {isSavingConfig ? t.projects.saving : t.campaigns.save_config}
                                <Save className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Idea Generator (Brainstorm) */}
            <IdeaGenerator
                project={project}
                campaign={campaign}
                onSelectIdea={handleSelectIdea}
            />

            {/* Generation Hub (Refactored) */}
            <div id="gen-hub" className="bg-gradient-to-br from-[#1a1c23] to-[#0f1115] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-32 -mt-32 rounded-full pointer-events-none" />
                <div className="p-8 lg:p-10 space-y-8 relative z-10">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-500/20 rounded-2xl shadow-inner border border-yellow-500/10">
                                <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase">{t.campaigns.generation_hub}</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.campaigns.processing}</p>
                            </div>
                        </div>

                        {/* Social Platform Selection */}
                        <div className="flex flex-wrap gap-2 p-1.5 bg-black/40 border border-white/5 rounded-2xl">
                            {[
                                { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
                                { name: 'TikTok', icon: Music2, color: 'text-cyan-400' },
                                { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-500' },
                                { name: 'Facebook', icon: Facebook, color: 'text-indigo-500' }
                            ].map(platform => (
                                <button
                                    key={platform.name}
                                    onClick={() => {
                                        setSocialPlatform(platform.name)
                                        const availableTypes = Object.keys(PLATFORM_SIZES[platform.name])
                                        setGenType(availableTypes[0] as any)
                                        setGenSize(PLATFORM_SIZES[platform.name][availableTypes[0]])
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border ${socialPlatform === platform.name
                                        ? 'bg-white/10 border-white/20 text-white shadow-lg'
                                        : 'bg-transparent border-transparent text-gray-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <platform.icon className={`w-4 h-4 ${socialPlatform === platform.name ? platform.color : ''}`} />
                                    {platform.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Middle Settings: Content Type & Quantity */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Layout className="w-3.5 h-3.5" /> Content Type & Dimensions
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {Object.keys(PLATFORM_SIZES[socialPlatform]).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setGenType(type as any)
                                                setGenSize(PLATFORM_SIZES[socialPlatform][type])
                                            }}
                                            className={`group relative flex flex-col items-start gap-1 p-4 rounded-2xl border transition-all text-left ${genType === type
                                                ? 'bg-primary/20 border-primary text-white shadow-xl shadow-primary/10'
                                                : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="text-xs font-black uppercase tracking-tighter">
                                                {(t.campaigns as any)[type.toLowerCase()] || type}
                                            </span>
                                            <span className="text-[9px] font-mono opacity-60">
                                                {PLATFORM_SIZES[socialPlatform][type].replace(/_/g, ' ').toUpperCase()}
                                            </span>
                                            {genType === type && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full animate-ping" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-2"><Layers className="w-3.5 h-3.5" /> {t.campaigns.quantity}</span>
                                        <span className="text-primary text-sm font-mono">{genQuantity} items</span>
                                    </div>
                                    <div className="relative group px-1">
                                        <input
                                            type="range" min="1" max="15" step="1"
                                            value={genQuantity}
                                            onChange={(e) => setGenQuantity(parseInt(e.target.value))}
                                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary group-hover:accent-primary/80 transition-all"
                                        />
                                        <div className="flex justify-between mt-2 px-1">
                                            {[1, 5, 10, 15].map(v => (
                                                <span key={v} className="text-[8px] font-black text-gray-700">{v}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-2">🌐 {t.campaigns.language}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Español', 'Ingles'].map((l) => (
                                            <button
                                                key={l}
                                                onClick={() => setGenLanguage(l as any)}
                                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all border ${genLanguage === l
                                                    ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-lg'
                                                    : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                                                    }`}
                                            >
                                                {l === 'Ingles' ? t.campaigns.english : t.campaigns.spanish}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Actions & Stats */}
                        <div className="lg:col-span-4 flex flex-col justify-center gap-6">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="w-full py-6 bg-gradient-to-br from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-500 disabled:opacity-50 text-white font-black rounded-3xl transition-all flex flex-col items-center justify-center gap-2 group relative overflow-hidden shadow-2xl shadow-primary/20 border-t border-white/20 active:scale-[0.98]"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                        <span className="text-sm tracking-widest">{t.campaigns.processing.toUpperCase()}</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-8 h-8 group-hover:rotate-12 transition-transform duration-500" />
                                        <span className="text-xl tracking-tighter uppercase">{t.campaigns.start_generation}</span>
                                    </>
                                )}
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-10 transition-opacity" />
                            </button>

                            {lastGenTime && (
                                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                                        <div>
                                            <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Success Batch</p>
                                            <p className="text-[8px] text-green-400/60 font-mono">{(lastGenTime / 1000).toFixed(1)}s Performance</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6 pt-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between items-start gap-6 border-b border-white/5 pb-6">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                            <Layout className="w-6 h-6 text-primary" />
                            {t.campaigns.assets_title}
                            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-gray-500 font-mono">{items.length}</span>
                        </h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-9">Organized by Channel</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                        {[t.common.all, 'Instagram', 'TikTok', 'LinkedIn', 'Facebook'].map((tab) => {
                            const isTodo = tab === t.common.all;
                            const Icon = tab === 'Instagram' ? Instagram : tab === 'TikTok' ? Music2 : tab === 'LinkedIn' ? Linkedin : tab === 'Facebook' ? Facebook : Layout;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setResourceTab(isTodo ? 'Todo' : tab)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${(resourceTab === tab || (isTodo && resourceTab === 'Todo'))
                                        ? 'bg-white/10 text-white shadow-lg'
                                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {tab !== 'Todo' && <Icon className="w-3 h-3" />}
                                    {tab}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items
                        .filter(item => resourceTab === 'Todo' || item.social_platform === resourceTab)
                        .map(item => (
                            <div key={item.id} className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                                <ContentCard
                                    item={item}
                                    onEdit={handleEdit}
                                    onStatusUpdate={(id, status) => {
                                        setItems(prev => prev.map(it => it.id === id ? { ...it, status } : it));
                                        (supabase.from('content_queue') as any).update({ status }).eq('id', id).then()
                                    }}
                                    onPublish={handlePublish}
                                />
                            </div>
                        ))}
                    {items.length === 0 && (
                        <div className="col-span-full py-32 text-center rounded-3xl border-2 border-dashed border-white/5 bg-white/2 space-y-4">
                            <Zap className="w-12 h-12 text-gray-700 mx-auto" />
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-gray-400 uppercase tracking-tighter">{t.campaigns.ready_activation}</h3>
                                <p className="text-sm text-gray-600">{t.campaigns.ready_activation_desc}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <QuickEditor
                isOpen={!!editingItem}
                onClose={() => setEditingItem(null)}
                item={editingItem}
                onSave={handleSaveContent}
            />
            {/* Prompt Preview Modal */}
            {
                showPromptPreview && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-[#0f1115] border border-white/10 w-full max-w-5xl max-h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-secondary/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <Terminal className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-widest uppercase">{t.campaigns.preview_logic}</h3>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.campaigns.inspecting_logic} {campaign?.name}</p>
                                        <p className="text-[8px] text-gray-600 font-mono flex items-center gap-2">
                                            ID: {campaign?.id} | CREATED: {campaign?.created_at ? new Date(campaign.created_at).toLocaleString() : ''}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setShowPromptPreview(false)} className="text-gray-500 hover:text-white text-2xl font-black">×</button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                                {/* Copywriter Logic */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        <h4 className="text-xs font-black text-white uppercase tracking-widest">{t.campaigns.social_post} Logic</h4>
                                    </div>
                                    <div className="bg-black/60 rounded-2xl p-6 font-mono text-[11px] leading-relaxed text-gray-400 border border-white/5">
                                        <p className="mb-4 text-primary font-bold">--- {t.campaigns.system_role} ---</p>
                                        <p>Role: Elite Direct Response Copywriter. Task: Write a high-converting social media post.</p>

                                        <p className="mt-4 mb-2 text-primary font-bold">--- {t.campaigns.business_context} ---</p>
                                        <p>Company: <span className="text-white">{project?.app_name}</span></p>
                                        <p>Niche: <span className="text-white">[{campaign?.topic || 'EMPTY'}]</span> {!campaign?.topic && <span className="text-[10px] text-yellow-500/50 ml-2 italic">(Project Fallback: {project?.niche_vertical})</span>}</p>
                                        <p>Differential: <span className="text-white">[{campaign?.differential || 'EMPTY'}]</span> {!campaign?.differential && <span className="text-[10px] text-yellow-500/50 ml-2 italic">(Project Fallback: {project?.usp})</span>}</p>
                                        <p>Problem: <span className="text-white">[{campaign?.problem_solved || 'EMPTY'}]</span> {!campaign?.problem_solved && <span className="text-[10px] text-yellow-500/50 ml-2 italic">(Project Fallback: {project?.problem_solved})</span>}</p>
                                        <p>Target: <span className="text-white">[{campaign?.target_orientation || 'EMPTY'}]</span> {!campaign?.target_orientation && <span className="text-[10px] text-yellow-500/50 ml-2 italic">(Project Fallback: {project?.target_audience})</span>}</p>
                                        <p>Voice: <span className="text-white font-bold">{project?.brand_voice}</span></p>

                                        <p className="mt-4 mb-2 text-primary font-bold">--- CAMPAIGN STRATEGY ---</p>
                                        <p>Strategic Objective: <span className="text-white font-bold">[{campaign?.strategic_objective || 'EMPTY'}]</span> {!campaign?.strategic_objective && <span className="text-[10px] text-yellow-500/50 ml-2 italic">(Objective Fallback: {campaign?.objective})</span>}</p>

                                        <p className="mt-4 mb-2 text-primary font-bold">--- {t.campaigns.master_directives} ---</p>
                                        <p className="text-white italic">"{customCopy || '(No custom instructions provided)'}"</p>

                                        <p className="mt-4 mb-2 text-primary font-bold">--- {t.campaigns.marketing_framework} ---</p>
                                        <p>Method: <span className="text-white">{campaign?.objective === 'Venta Directa' ? 'AIDA (Attention, Interest, Desire, Action)' : campaign?.objective === 'Autoridad_Miedo' ? 'PAS (Problem, Agitate, Solution)' : 'Hook-Story-Offer'}</span></p>
                                    </div>
                                </section>

                                {/* Visual Artist Logic */}
                                <section className="space-y-4 pb-8">
                                    <div className="flex items-center gap-2">
                                        <Paintbrush className="w-4 h-4 text-purple-400" />
                                        <h4 className="text-xs font-black text-white uppercase tracking-widest">Visual Art Director Logic</h4>
                                    </div>
                                    <div className="bg-black/60 rounded-2xl p-6 font-mono text-[11px] leading-relaxed text-gray-400 border border-white/5">
                                        <p className="mb-4 text-purple-400 font-bold">--- {t.campaigns.system_role} ---</p>
                                        <p>Role: Professional Creative Director & High-End Photographer.</p>

                                        <p className="mt-4 mb-2 text-purple-400 font-bold">--- CAMPAIGN DNA ---</p>
                                        <p>Base Style: <span className="text-white">{vStyle}</span></p>
                                        <p>Voice: <span className="text-white">{vVoice}</span></p>
                                        <p>Mood: <span className="text-white">{vMood}</span></p>
                                        <p>Palette: <span className="text-white">{vPalette}</span></p>

                                        <p className="mt-4 mb-2 text-purple-400 font-bold">--- PHOTOGRAPHIC SPECS (AUTO-INJECTED) ---</p>
                                        <p className="text-white/80 italic">"Ultra-high definition, 8k, photorealistic textures, cinematic quality. Professional studio setup (Rim lighting, softbox). 85mm f/1.8 optics. Sharp focus, deep depth of field."</p>

                                        <p className="mt-4 mb-2 text-purple-400 font-bold">--- MASTER CREATIVE DIRECTIVE ---</p>
                                        <p className="text-white italic">"{customVisual || '(No custom instructions provided)'}"</p>
                                    </div>
                                </section>
                            </div>

                            <div className="p-6 bg-secondary/10 border-t border-white/5 flex justify-end">
                                <button
                                    onClick={() => setShowPromptPreview(false)}
                                    className="px-6 py-2 bg-primary hover:bg-primary/80 rounded-lg text-xs font-black text-white uppercase tracking-widest transition-all"
                                >
                                    {t.common.all === 'Todo' ? 'Entendido' : 'Got it'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
