'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ContentCard } from '@/components/content/ContentCard'
import { QuickEditor } from '@/components/content/QuickEditor'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/database.types'
import { Settings, BarChart3, Plus, Target, Calendar, Zap, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { CampaignList } from '@/components/campaigns/CampaignList'
import { GenerationModal } from '@/components/campaigns/GenerationModal'
import { SchedulerSettings } from '@/components/dashboard/SchedulerSettings'
import { generateContentAction } from '@/app/actions/ai'
import { triggerImageGenerationAction } from '@/app/actions/imageActions'
import { autoFillScheduleAction } from '@/app/actions/scheduler'
import { publishContentAction } from '@/app/actions/publish'
import { useLanguage } from '@/context/LanguageContext'

export default function ProjectPage() {
    const params = useParams()
    const projectId = params.id as string
    const supabase = createClient()
    const router = useRouter()

    const [project, setProject] = useState<any>(null)
    const [items, setItems] = useState<any[]>([])
    const [campaigns, setCampaigns] = useState<Database['public']['Tables']['campaigns']['Row'][]>([])
    const [profile, setProfile] = useState<any>(null)

    const { t, lang } = useLanguage()

    // UI State
    const [isGenerating, setIsGenerating] = useState(false)
    const [isScheduling, setIsScheduling] = useState(false)
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [generationModalOpen, setGenerationModalOpen] = useState(false)
    const [activeCampaign, setActiveCampaign] = useState<any>(null)

    // Filter State
    const [statusFilter, setStatusFilter] = useState('All')
    const [campaignFilter, setCampaignFilter] = useState('All')
    const [monthFilter, setMonthFilter] = useState('All')

    // Editor State
    const [editingItem, setEditingItem] = useState<any | null>(null)

    useEffect(() => {
        if (projectId) {
            fetchProjectDetails()
            fetchContentQueue()
            fetchCampaigns()
            fetchProfile()
        }
    }, [projectId])

    // Memoized Months
    const availableMonths = React.useMemo(() => {
        const months = items.map(item => {
            const date = item.scheduled_at ? new Date(item.scheduled_at) : new Date(item.created_at)
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        })
        return Array.from(new Set(months)).sort().reverse()
    }, [items])

    // Filter Logic
    const filteredItems = React.useMemo(() => {
        return items.filter(item => {
            const matchesStatus = statusFilter === 'All' || item.status === statusFilter
            const matchesCampaign = campaignFilter === 'All' || item.campaign_id === campaignFilter

            const itemDate = item.scheduled_at ? new Date(item.scheduled_at) : new Date(item.created_at)
            const itemMonthFormatted = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`
            const matchesMonth = monthFilter === 'All' || itemMonthFormatted === monthFilter

            return matchesStatus && matchesCampaign && matchesMonth
        })
    }, [items, statusFilter, campaignFilter, monthFilter])

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await (supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single() as any)
            if (data) setProfile(data)
        }
    }

    const handleSaveSchedule = async (newConfig: any) => {
        setIsSavingProfile(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { error } = await (supabase.from('profiles') as any)
                .update({ schedule_config: newConfig })
                .eq('id', user.id)

            if (error) alert("Error saving schedule")
            else setProfile({ ...profile, schedule_config: newConfig })
        }
        setIsSavingProfile(false)
    }

    const handleAutoFill = async () => {
        setIsScheduling(true)
        const result = await autoFillScheduleAction(projectId)
        if (result.success) {
            await fetchContentQueue()
            alert(lang === 'es' ? `¡Se programaron con éxito ${result.count} publicaciones!` : `Succesfully scheduled ${result.count} posts!`)
        } else {
            alert((lang === 'es' ? "Error de programación: " : "Scheduling failed: ") + result.error)
        }
        setIsScheduling(false)
    }

    const handlePublish = async (itemId: string) => {
        const result = await publishContentAction(itemId)
        if (result.success) {
            await fetchContentQueue()
        } else {
            alert((lang === 'es' ? "Error de publicación: " : "Publishing failed: ") + result.error)
        }
    }

    const fetchProjectDetails = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await (supabase
            .from('project_master')
            .select('*')
            .eq('id', projectId)
            .eq('user_id', user.id)
            .single() as any)

        if (error) console.error('Error fetching project:', error)
        if (data) setProject(data)
    }

    const fetchContentQueue = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('content_queue')
            .select('*')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) console.error('Error fetching queue:', error)
        if (data) setItems(data)
    }

    const fetchCampaigns = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) console.error('Error fetching campaigns:', error)
        if (data) setCampaigns(data)
    }

    const openGenerationModal = (campaign: any) => {
        setActiveCampaign(campaign)
        setGenerationModalOpen(true)
    }

    const handleGenerateContent = async (type: Database['public']['Tables']['content_queue']['Row']['content_type'], quantity: number, language: 'Ingles' | 'Español') => {
        if (!project || !activeCampaign) return

        setIsGenerating(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const result = await generateContentAction({
                context: {
                    niche: activeCampaign.topic || project.niche_vertical,
                    targetAudience: activeCampaign.target_orientation || project.target_audience,
                    brandVoice: project.brand_voice,
                    description: project.description,
                    usp: project.usp,
                    companyName: project.app_name,
                    offering: project.description,
                    differential: activeCampaign.differential || project.usp,
                    problemSolved: activeCampaign.problem_solved || project.problem_solved,
                    strategyContext: {
                        topic: activeCampaign.topic || project.niche_vertical,
                        orientation: activeCampaign.target_orientation || project.target_audience,
                        problem: activeCampaign.problem_solved || project.problem_solved,
                        differential: activeCampaign.differential || project.usp
                    }
                },
                campaign: {
                    id: activeCampaign.id,
                    name: activeCampaign.name,
                    objective: activeCampaign.objective,
                    pillars: activeCampaign.pillars,
                    mainCTA: activeCampaign.cta,
                    visualStyle: activeCampaign.visual_style,
                    mood: activeCampaign.mood,
                    colorPalette: activeCampaign.color_palette
                },
                config: {
                    count: quantity,
                    contentType: type,
                    language: language
                }
            })

            if (!result.success) throw new Error(result.error)

            // Save to DB
            const queueItems = result.data!.map(res => ({
                project_id: projectId,
                user_id: user.id,
                campaign_id: activeCampaign.id,
                content_type: type,
                status: 'AI_Generated',
                gemini_output: res,
                image_ai_prompt: res.image_prompt,
                confidence_score: 0.9,
                angle_type: res.angle_assigned,
                scheduled_at: null // Will be auto-filled by scheduler
            }))

            const { error: dbError } = await (supabase.from('content_queue') as any).insert(queueItems)
            if (dbError) throw dbError

            await fetchContentQueue()
            setGenerationModalOpen(false)

        } catch (error) {
            console.error("Generation failed:", error)
            alert(lang === 'es' ? "Error de generación. Ver consola." : "Failed to generate content. See console.")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleEdit = (item: any) => {
        setEditingItem(item)
    }

    const handleSaveContent = async (id: string, newContent: any, imagePrompt?: string, triggerGen?: boolean) => {
        // Optimistic update
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    gemini_output: newContent,
                    image_ai_prompt: imagePrompt || item.image_ai_prompt
                }
            }
            return item
        }))

        try {
            const { error } = await (supabase.from('content_queue') as any)
                .update({
                    gemini_output: newContent,
                    image_ai_prompt: imagePrompt
                })
                .eq('id', id)

            if (error) throw error

            if (triggerGen && imagePrompt) {
                triggerImageGenerationAction(id, imagePrompt, {
                    image_text: newContent.short_image_text,
                    // Use defaults or fetch from project if needed, for simplicity using standard params
                })
            }
        } catch (error) {
            console.error("Error saving content:", error)
            alert(t.settings.error)
        }
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">{project?.app_name || t.common.loading}</h1>
                        {project?.niche_vertical && (
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-mono uppercase tracking-widest">
                                Niche: {project.niche_vertical}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                        <span className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Target: {project?.target_audience || '...'}
                        </span>
                        <span className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Voice: {project?.brand_voice || '...'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link href={`/projects/${projectId}/edit`}>
                        <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10">
                            <Settings className="w-5 h-5" />
                            {t.dashboard.edit_details}
                        </button>
                    </Link>
                    <Link href={`/projects/${projectId}/campaigns/new`}>
                        <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary hover:bg-blue-600 text-white font-bold transition-all shadow-lg shadow-primary/20">
                            <Plus className="w-5 h-5" />
                            {t.dashboard.new_campaign}
                        </button>
                    </Link>
                </div>
            </div>

            {/* Campaigns Deck */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    {t.dashboard.active_campaigns}
                </h2>
                <CampaignList
                    campaigns={campaigns}
                    onGenerateClick={openGenerationModal}
                />
            </div>

            {/* Scheduler & Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 pt-8 border-t border-white/5">
                <SchedulerSettings
                    config={profile?.schedule_config}
                    onSave={handleSaveSchedule}
                    loading={isSavingProfile}
                />
            </div>

            {/* Content Queue */}
            <div className="pt-8 border-t border-white/5">
                <div className="flex flex-col space-y-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">{t.dashboard.content_queue} ({filteredItems.length})</h2>
                            <p className="text-xs text-gray-400 mt-1">{t.dashboard.queue_desc}</p>
                        </div>
                        <button
                            onClick={handleAutoFill}
                            disabled={isScheduling}
                            className="flex items-center gap-2 px-6 py-2 rounded-full bg-secondary hover:bg-white/10 text-white font-bold transition-all border border-white/10 disabled:opacity-50"
                        >
                            {isScheduling ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : <Sparkles className="w-4 h-4 text-primary" />}
                            {t.dashboard.auto_fill}
                        </button>
                    </div>

                    {/* Filters LOV */}
                    <div className="flex flex-wrap gap-4 items-end p-6 glass rounded-2xl border-white/5 shadow-xl">
                        <div className="flex-1 min-w-[200px] space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{t.common.filter_campaign}</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 focus:ring-2 focus:ring-primary/50 outline-none transition-all cursor-pointer"
                                value={campaignFilter}
                                onChange={(e) => setCampaignFilter(e.target.value)}
                            >
                                <option value="All" className="bg-gray-900">{t.common.all}</option>
                                {campaigns.map(c => (
                                    <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 min-w-[200px] space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{t.common.filter_month}</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 focus:ring-2 focus:ring-primary/50 outline-none transition-all cursor-pointer"
                                value={monthFilter}
                                onChange={(e) => setMonthFilter(e.target.value)}
                            >
                                <option value="All" className="bg-gray-900">{t.common.all}</option>
                                {availableMonths.map(m => (
                                    <option key={m} value={m} className="bg-gray-900">{m}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            {['All', 'Draft', 'Approved', 'Published'].map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setStatusFilter(filter)}
                                    className={`text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all border ${statusFilter === filter
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {filter === 'All' ? t.common.all : filter}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map(item => (
                        <div key={item.id} className="h-full">
                            <ContentCard
                                item={item}
                                onEdit={handleEdit}
                                onStatusUpdate={(id, status) => {
                                    setItems(prev => prev.map(it => it.id === id ? { ...it, status } : it));
                                    (supabase.from('content_queue') as any).update({ status }).eq('id', id).then()
                                }}
                            />
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="col-span-full py-24 glass rounded-[3rem] border-white/5 border-dashed border-2 text-center">
                            <Zap className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold">{t.dashboard.no_results}</p>
                            <button
                                onClick={() => { setStatusFilter('All'); setCampaignFilter('All'); setMonthFilter('All'); }}
                                className="mt-4 text-primary text-xs font-black uppercase tracking-widest hover:underline"
                            >
                                {t.dashboard.clear_filters}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <QuickEditor
                isOpen={!!editingItem}
                onClose={() => setEditingItem(null)}
                item={editingItem}
                onSave={handleSaveContent}
            />

            <GenerationModal
                isOpen={generationModalOpen}
                onClose={() => setGenerationModalOpen(false)}
                onGenerate={handleGenerateContent}
                campaignName={activeCampaign?.name || ''}
                loading={isGenerating}
            />
        </div>
    )
}
