'use client'

import React, { useEffect, useState } from 'react'
import { Book, FileText, Layout, Plus, Sparkles, ChevronRight, Clock, Star, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { getPremiumProjectsAction, createPremiumProjectAction } from '@/app/actions/premium_forge'
import { createClient } from '@/utils/supabase/client'
import { useLanguage } from '@/context/LanguageContext'
import { calculateStrategyAction, StrategyResponse } from '@/app/actions/strategy_actions'
import { Database } from '@/types/database.types'
import { SafeSelectBuilder } from '@/utils/supabaseSafe'

type PremiumProject = Database['public']['Tables']['premium_content_projects']['Row'] & { project_master?: { app_name: string } }
type ProjectMaster = Database['public']['Tables']['project_master']['Row']

interface WizardOptions {
    titles: { title: string; hook: string; reasoning: string }[]
    focus_angles: { id: string; label: string; description: string }[]
}
export default function PremiumForgePage() {
    const { t } = useLanguage()
    const supabase = createClient()
    const [projects, setProjects] = useState<PremiumProject[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [showNewModal, setShowNewModal] = useState(false)

    // Wizard State
    const [wizardStep, setWizardStep] = useState(1) // 1: Topic, 2: Title, 3: Angle
    const [topic, setTopic] = useState('')
    const [wizardOptions, setWizardOptions] = useState<WizardOptions | null>(null)
    const [isGeneratingOptions, setIsGeneratingOptions] = useState(false)
    const [selectedTitle, setSelectedTitle] = useState('')
    const [selectedAngle, setSelectedAngle] = useState('')

    // Strategy State
    const [strategyResponse, setStrategyResponse] = useState<StrategyResponse | null>(null)
    const [isCalculatingStrategy, setIsCalculatingStrategy] = useState(false)

    // New Project State (Keeping these for final submission)
    const [contentType, setContentType] = useState<'ebook' | 'blog' | 'whitepaper'>('ebook')
    const [selectedProjectId, setSelectedProjectId] = useState('')
    const [myProjects, setMyProjects] = useState<ProjectMaster[]>([])

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const data = await getPremiumProjectsAction()
                setProjects(data || [])

                // Fetch projects for the dropdown
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: p } = await (supabase
                        .from('project_master') as unknown as SafeSelectBuilder<'project_master'>)
                        .select('id, app_name')
                        .eq('user_id', user.id)
                    setMyProjects(p as ProjectMaster[])
                    if (p && p.length > 0) setSelectedProjectId(p[0].id)
                }
            } catch (err) {
                console.error("Dashboard error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchInitialData()
    }, [supabase])

    const handleCalculateStrategy = async () => {
        if (!topic || !selectedProjectId) return
        setIsCalculatingStrategy(true)
        try {
            const goal = contentType === 'ebook' ? 'Create a high-authority eBook' : contentType === 'blog' ? 'Generate viral blog content' : 'Professional business whitepaper'
            const res = await calculateStrategyAction(topic, goal)
            if (!res.success) {
                alert(`Analysis Error: ${res.error || 'Failed to generate market intelligence'}`)
                return
            }
            setStrategyResponse(res)
            setWizardStep(1.5)
        } catch (err: unknown) {
            console.error("Strategy error:", err)
            const message = err instanceof Error ? err.message : 'Unknown error'
            alert(`Strategy error: ${message}`)
        } finally {
            setIsCalculatingStrategy(false)
        }
    }

    const fetchWizardOptions = async () => {
        if (!topic || !selectedProjectId || !strategyResponse) return
        setIsGeneratingOptions(true)
        try {
            const lang = t.campaigns.language.split(' ')[0] === 'ENGLISH' ? 'English' : 'Español'
            const { generateForgeWizardOptionsAction } = await import('@/app/actions/premium_forge')
            // We pass the strategy reasoning to influence the titles/angles
            const response = await generateForgeWizardOptionsAction(`${topic} (Strategy focus: ${strategyResponse.scorecard.reasoning})`, selectedProjectId, lang)
            setWizardOptions(response.data)
            setWizardStep(2)
        } catch (err) {
            console.error("Wizard options error:", err)
        } finally {
            setIsGeneratingOptions(false)
        }
    }

    const handleCreate = async () => {
        if (!selectedTitle || !selectedProjectId || !selectedAngle) return
        setIsCreating(true)
        try {
            const res = await createPremiumProjectAction({
                projectId: selectedProjectId,
                title: selectedTitle,
                contentType,
                language: t.campaigns.language.split(' ')[0] === 'ENGLISH' ? 'English' : 'Español'
            })
            if (res.success) {
                window.location.href = `/premium-forge/${res.id}`
            }
        } catch (err) {
            console.error("Creation error:", err)
        } finally {
            setIsCreating(false)
        }
    }

    const contentTypes = [
        { id: 'ebook', title: t.premium_forge.types.ebook.title, icon: Book, desc: t.premium_forge.types.ebook.desc, color: 'from-blue-600 to-cyan-500' },
        { id: 'blog', title: t.premium_forge.types.blog.title, icon: FileText, desc: t.premium_forge.types.blog.desc, color: 'from-purple-600 to-pink-500' },
        { id: 'whitepaper', title: t.premium_forge.types.whitepaper.title, icon: Layout, desc: t.premium_forge.types.whitepaper.desc, color: 'from-orange-600 to-red-500' },
    ]

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-br from-secondary/50 to-secondary/20 p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="px-3 py-1 bg-primary/20 rounded-full border border-primary/20">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">{t.premium_forge.badge}</span>
                        </div>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tighter">
                        {t.premium_forge.title_forge.split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{t.premium_forge.title_forge.split(' ')[1]}</span>
                    </h1>
                    <p className="max-w-xl text-gray-400 font-medium leading-relaxed">
                        {t.premium_forge.description}
                    </p>
                </div>

                <div className="relative z-10">
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="group bg-white text-black px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-primary hover:text-white transition-all shadow-2xl shadow-white/5"
                    >
                        <Plus className="w-5 h-5" />
                        {t.premium_forge.cta_start}
                    </button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] -ml-32 -mb-32" />
            </div>

            {/* Content Type Selector (For New) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(contentTypes || []).map((type) => (
                    <div
                        key={type.id}
                        className={`group relative p-8 rounded-3xl border border-white/5 bg-secondary/20 hover:bg-secondary/40 transition-all cursor-pointer overflow-hidden ${contentType === type.id ? 'ring-2 ring-primary border-transparent' : ''}`}
                        onClick={() => { setContentType(type.id as 'ebook' | 'blog' | 'whitepaper'); setShowNewModal(true); }}
                    >
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                            <type.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">{type.title}</h3>
                        <p className="text-sm text-gray-500 font-medium">{type.desc}</p>

                        <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
                            {t.premium_forge.select_type} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Forge Projects */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-500" />
                        {t.premium_forge.recent_productions}
                    </h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(projects.length > 0 ? projects : [1, 2, 3]).map((i, idx) => (
                            loading ? <div key={idx} className="h-48 rounded-3xl bg-secondary/20 animate-pulse border border-white/5" /> : null
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="bg-secondary/10 border border-white/5 border-dashed p-20 rounded-3xl text-center">
                        <p className="text-gray-500 font-bold mb-4">{t.premium_forge.no_projects}</p>
                        <button onClick={() => setShowNewModal(true)} className="text-primary font-black uppercase text-sm">{t.premium_forge.initialize_first}</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(projects || []).map(p => (
                            <Link key={p.id} href={`/premium-forge/${p.id}`} className="group">
                                <div className="bg-secondary/30 border border-white/5 p-6 rounded-3xl hover:border-white/20 transition-all hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${p.status === 'Completed' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                                            p.status === 'Error' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                                'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                                            }`}>
                                            {p.status}
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                            <ChevronRight className="w-4 h-4 text-gray-500" />
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-black text-white mb-2 line-clamp-1">{p.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                        <Layout className="w-3 h-3" />
                                        {p.type.toUpperCase()}
                                        <span className="w-1 h-1 rounded-full bg-gray-700" />
                                        {p.project_master?.app_name}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Premium Forge Wizard Modal */}
            {showNewModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowNewModal(false)} />
                    <div className="relative bg-[#0d0d0d] border border-white/10 w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">

                        {/* Static Header: Progress Bar */}
                        <div className="p-8 pb-0">
                            <div className="flex gap-2 mb-8">
                                {([1, 1.5, 2, 3]).map(step => (
                                    <div
                                        key={step}
                                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${wizardStep >= step ? (step === 1.5 ? 'bg-primary/60' : 'bg-primary') : 'bg-white/10'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar">

                            {/* STEP 1: TOPIC & CONTEXT */}
                            {wizardStep === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-3xl font-black text-white tracking-tighter mb-2">Defining the Topic</h3>
                                        <p className="text-gray-500 font-medium">What would you like to build today?</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Concept or Main Topic</label>
                                            <input
                                                type="text"
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                placeholder="e.g. 10 Mistakes in Real Estate Investing"
                                                className="w-full bg-secondary/30 border border-white/5 rounded-2xl p-5 text-white font-bold placeholder:text-gray-800 outline-none focus:border-primary transition-all text-lg"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Context Project</label>
                                                <select
                                                    value={selectedProjectId}
                                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                                    className="w-full bg-secondary/30 border border-white/5 rounded-2xl p-4 text-white font-bold outline-none ring-0 appearance-none"
                                                >
                                                    {(myProjects || []).map((p) => <option key={p.id} value={p.id}>{p.app_name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">Content Type</label>
                                                <div className="flex bg-secondary/30 border border-white/5 p-1 rounded-2xl">
                                                    {(contentTypes || []).map(t => (
                                                        <button
                                                            key={t.id}
                                                            onClick={() => setContentType(t.id as 'ebook' | 'blog' | 'whitepaper')}
                                                            className={`flex-1 py-3 rounded-xl transition-all ${contentType === t.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
                                                        >
                                                            <t.icon className="w-4 h-4 mx-auto" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleCalculateStrategy}
                                            disabled={isCalculatingStrategy || !topic || !selectedProjectId}
                                            className="w-full bg-white text-black py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 group mt-10"
                                        >
                                            {isCalculatingStrategy ? 'Consulting Market Intelligence...' : 'Run Real-Time Strategy Check'}
                                            {isCalculatingStrategy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover:scale-125 transition-transform" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 1.5: STRATEGY CARDS */}
                            {wizardStep === 1.5 && strategyResponse && (
                                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-3xl font-black text-white tracking-tighter mb-2">Market Intelligence</h3>
                                            <p className="text-gray-500 font-medium italic">Validated trends and viral potential score</p>
                                        </div>
                                        <button onClick={() => setWizardStep(1)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                                            <ChevronRight className="w-5 h-5 rotate-180" />
                                        </button>
                                    </div>

                                    {/* Scorecard */}
                                    <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl flex items-center justify-between">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Viral Potential Score</span>
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-4xl font-black text-white">{strategyResponse.scorecard.viral_potential}/100</h4>
                                                <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: `${strategyResponse.scorecard.viral_potential}%` }} />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Projected Reach: {strategyResponse.scorecard.projected_reach}</p>
                                        </div>
                                        <div className="p-4 bg-primary/10 rounded-2xl">
                                            <Sparkles className="w-6 h-6 text-primary" />
                                        </div>
                                    </div>

                                    {/* Strategy Cards */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* SEO Card */}
                                        <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                    <Layout className="w-5 h-5" />
                                                </div>
                                                <h4 className="font-black text-white uppercase tracking-widest text-sm">{strategyResponse.seo_card.title}</h4>
                                            </div>
                                            <p className="text-xs text-gray-400 leading-relaxed font-medium">{strategyResponse.seo_card.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {(strategyResponse.seo_card.keywords || []).map(kw => (
                                                    <span key={kw} className="px-2 py-1 bg-white/5 rounded text-[9px] font-black text-gray-500 uppercase tracking-widest border border-white/5">{kw}</span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Viral Card */}
                                        <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
                                                    <Sparkles className="w-5 h-5" />
                                                </div>
                                                <h4 className="font-black text-white uppercase tracking-widest text-sm">{strategyResponse.viral_card.title}</h4>
                                            </div>
                                            <p className="text-xs text-gray-400 leading-relaxed font-medium">{strategyResponse.viral_card.description}</p>
                                            <div className="space-y-2">
                                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] block">TRENDING HOOKS</span>
                                                <div className="space-y-1">
                                                    {(strategyResponse.viral_card.hooks || []).map(hook => (
                                                        <div key={hook} className="flex items-start gap-2 text-xs text-gray-300 font-medium italic">
                                                            <div className="mt-1.5 w-1 h-1 rounded-full bg-pink-500 shrink-0" />
                                                            &quot;{hook}&quot;
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Authority Card */}
                                        <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                                    <Book className="w-5 h-5" />
                                                </div>
                                                <h4 className="font-black text-white uppercase tracking-widest text-sm">{strategyResponse.authority_card.title}</h4>
                                            </div>
                                            <p className="text-xs text-gray-400 leading-relaxed font-medium">{strategyResponse.authority_card.description}</p>
                                            <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/10">
                                                <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block mb-1">NICHE OPPORTUNITY</span>
                                                <p className="text-[11px] text-gray-300 font-bold">{strategyResponse.authority_card.niche_gap}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={fetchWizardOptions}
                                        disabled={isGeneratingOptions}
                                        className="w-full bg-white text-black py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 group mt-10"
                                    >
                                        {isGeneratingOptions ? 'Crafting Strategic Content...' : 'Generate Validated Hooks & Titles'}
                                        {isGeneratingOptions ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                    </button>
                                </div>
                            )}

                            {/* STEP 2: TITLE SELECTION */}
                            {wizardStep === 2 && wizardOptions && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-3xl font-black text-white tracking-tighter mb-2">Select a Winning Title</h3>
                                            <p className="text-gray-500 font-medium">Based on marketing best practices</p>
                                        </div>
                                        <button onClick={() => setWizardStep(1)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                                            <ChevronRight className="w-5 h-5 rotate-180" />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {(wizardOptions.titles || []).map((t: WizardOptions['titles'][0], idx: number) => (
                                            <div
                                                key={idx}
                                                onClick={() => { setSelectedTitle(t.title); setWizardStep(3); }}
                                                className={`group p-5 rounded-2xl border transition-all cursor-pointer ${selectedTitle === t.title ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="text-lg font-black text-white group-hover:text-primary transition-colors pr-8 leading-tight">{t.title}</h4>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedTitle === t.title ? 'border-primary bg-primary' : 'border-white/10'}`}>
                                                        {selectedTitle === t.title && <div className="w-2 h-2 rounded-full bg-white" />}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">Hook</span>
                                                    <p className="text-xs text-gray-400 font-medium italic">&quot;{t.hook}&quot;</p>
                                                </div>
                                                <p className="text-[11px] text-gray-500 font-bold leading-relaxed">{t.reasoning}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: ANGLE SELECTION */}
                            {wizardStep === 3 && wizardOptions && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-3xl font-black text-white tracking-tighter mb-2">Strategic Focus</h3>
                                            <p className="text-gray-500 font-medium">How should we approach the topic?</p>
                                        </div>
                                        <button onClick={() => setWizardStep(2)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                                            <ChevronRight className="w-5 h-5 rotate-180" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {(wizardOptions.focus_angles || []).map((angle: WizardOptions['focus_angles'][0]) => (
                                            <div
                                                key={angle.id}
                                                onClick={() => setSelectedAngle(angle.id)}
                                                className={`group p-6 rounded-2xl border transition-all cursor-pointer ${selectedAngle === angle.id ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}`}
                                            >
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedAngle === angle.id ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'}`}>
                                                            <Star className="w-5 h-5" />
                                                        </div>
                                                        <h4 className="text-xl font-black text-white">{angle.label}</h4>
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedAngle === angle.id ? 'border-primary bg-primary' : 'border-white/10'}`}>
                                                        {selectedAngle === angle.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500 font-medium leading-relaxed">{angle.description}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleCreate}
                                        disabled={isCreating || !selectedAngle || !selectedTitle}
                                        className="w-full bg-white text-black py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all disabled:opacity-30 flex items-center justify-center gap-3 mt-10 group"
                                    >
                                        {isCreating ? 'Finalizing Strategy...' : 'Start Production'}
                                        {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
