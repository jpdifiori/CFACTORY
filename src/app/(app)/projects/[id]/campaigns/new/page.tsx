'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Sparkles, Paintbrush, Target, Search, HelpCircle, Wand2, Loader2, Save } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/types/database.types'
import { CreatableSelect } from '@/components/ui/CreatableSelect'
import { useLanguage } from '@/context/LanguageContext'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { HelpTooltip } from '@/components/ui/HelpTooltip'
import { MarketInsights } from '@/components/campaigns/MarketInsights'
import { calculateStrategyAction, generateInstructionsAction } from '@/app/actions/strategy_actions'

type Objective = Database['public']['Tables']['campaigns']['Row']['objective']
type VisualStyle = Database['public']['Tables']['campaigns']['Row']['visual_style']

// LOV Constants
const OBJ_OPTIONS = [
    { value: 'Educativo', label: 'Educativo (Teach & Value)', framework: 'Hook-Story-Offer' },
    { value: 'Venta Directa', label: 'Venta Directa (Conversion)', framework: 'AIDA' },
    { value: 'Autoridad_Miedo', label: 'Autoridad/Miedo (Problem Aware)', framework: 'PAS' },
    { value: 'Redireccion', label: 'Redirección a Web/Leads', framework: 'AIDA' },
]

const PILLAR_OPTIONS = [
    "Tips & Tricks", "Mitos vs Realidades", "Before & After", "Behind the Scenes",
    "User Testimonials", "Product Showcase", "Educational Deep Dive", "Industry News",
    "Quick Hacks", "Q&A Session", "Tutorial Paso a Paso", "Errores Comunes"
]

const CTA_OPTIONS = [
    "Link in Bio", "Sign Up Now", "Learn More", "Shop Collection",
    "Book Consultation", "DM for Info", "Comment Below", "Share with a Friend",
    "Save for Later", "Visita nuestra web", "Escríbenos al WhatsApp"
]

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
    "Modern Tech (Blue/Purple)", "Sunset (Orange/Pink)", "Monochrome (Black/White)",
    "Nature (Green/Brown)", "Ocean (Teal/Blue)", "High Contrast",
    "Pastel Soft", "Dark Mode Neon", "Earth Tones", "Vibrant Pop"
]

export default function NewCampaignPage() {
    const router = useRouter()
    const params = useParams()
    const supabase = createClient()
    const projectId = params.id as string
    const { t, lang } = useLanguage()

    const [loading, setLoading] = useState(false)

    // Market Intel State
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [marketData, setMarketData] = useState<any>(null)
    const [contextData, setContextData] = useState({
        topic: '',
        orientation: '',
        problem: '',
        differential: ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        objective: 'Educativo' as Objective,
        strategic_objective: '',
        duration_type: 'Mensual',
        pillars: [] as string[],
        cta: '',
        visual_style: 'Fotografia_Realista' as VisualStyle,
        color_palette: '',
        mood: '',
        custom_copy_instructions: '',
        custom_visual_instructions: '',
        target_url: ''
    })

    const handleAnalyzeMarket = async () => {
        if (!contextData.topic) return
        setIsAnalyzing(true)
        try {
            const result = await calculateStrategyAction(
                contextData.topic,
                contextData.orientation,
                contextData.problem,
                lang
            )
            setMarketData(result)

            // Auto-fill form if empty
            if (result.success && !formData.name) {
                const namePrefix = lang === 'es' ? 'Estrategia' : 'Strategy';
                const objectivePrefix = lang === 'es' ? 'Resolver problema' : 'Solve problem';
                setFormData(prev => ({
                    ...prev,
                    name: `${namePrefix}: ${contextData.topic}`,
                    strategic_objective: `${objectivePrefix}: ${contextData.problem}`,
                    pillars: [...(prev.pillars || []), ...(result.seo_card.keywords || []).slice(0, 3)]
                }))
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const [isGeneratingCopy, setIsGeneratingCopy] = useState(false)
    const [isGeneratingVisual, setIsGeneratingVisual] = useState(false)

    const handleGenerateInstructions = async (type: 'copy' | 'visual') => {
        if (type === 'copy') setIsGeneratingCopy(true)
        else setIsGeneratingVisual(true)

        try {
            const result = await generateInstructionsAction(
                type,
                {
                    topic: contextData.topic,
                    orientation: contextData.orientation,
                    problem: contextData.problem,
                    objective: formData.strategic_objective
                },
                lang
            )

            if (result.success) {
                if (type === 'copy') {
                    setFormData(prev => ({ ...prev, custom_copy_instructions: result.content }))
                } else {
                    setFormData(prev => ({ ...prev, custom_visual_instructions: result.content }))
                }
            }
        } catch (e) {
            console.error(e)
        } finally {
            if (type === 'copy') setIsGeneratingCopy(false)
            else setIsGeneratingVisual(false)
        }
    }

    // Pillar input helper
    const [tempPillar, setTempPillar] = useState('')

    const addPillar = () => {
        if (tempPillar.trim() && !formData.pillars?.includes(tempPillar.trim())) {
            setFormData(prev => ({
                ...prev,
                pillars: [...(prev.pillars || []), tempPillar.trim()]
            }))
            setTempPillar('')
        }
    }

    const steps = [
        { id: 1, name: t.new_campaign.wizard.steps.context },
        { id: 2, name: t.new_campaign.wizard.steps.insights },
        { id: 3, name: t.new_campaign.wizard.steps.strategy },
        { id: 4, name: t.new_campaign.wizard.steps.content },
        { id: 5, name: t.new_campaign.wizard.steps.visual }
    ]

    const [currentStep, setCurrentStep] = useState(1)

    const validateStep = (step: number) => {
        const newErrors: Record<string, string> = {}
        if (step === 1) {
            if (!contextData.topic) newErrors.topic = "Required"
        }
        if (step === 2) {
            if (!formData.name) newErrors.name = "Required"
        }
        if (step === 3) {
            if (!formData.strategic_objective) newErrors.strategic_objective = "Required"
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 5))
        }
    }
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setLoading(true)

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error } = await (supabase
                .from('campaigns') as any)
                .insert([{
                    project_id: projectId,
                    user_id: user.id,
                    ...formData,
                    topic: contextData.topic,
                    target_orientation: contextData.orientation,
                    problem_solved: contextData.problem,
                    differential: contextData.differential
                }] as any)

            if (error) throw error

            router.push(`/projects/${projectId}`)
        } catch (error: any) {
            console.error('Error creating campaign:', {
                message: error?.message,
                code: error?.code,
                details: error?.details,
                hint: error?.hint,
                fullError: error
            })
            alert(`Failed to create campaign: ${error?.message || 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <Link href={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                {t.new_campaign.back}
            </Link>

            <div className="mb-12 text-center">
                <h1 className="text-4xl font-black text-white mb-3 tracking-tighter uppercase [text-shadow:0_0_20px_rgba(59,130,246,0.3)]">{t.new_campaign.title}</h1>
                <p className="text-muted-foreground text-sm max-w-lg mx-auto">{t.new_campaign.subtitle}</p>
            </div>

            <StepIndicator steps={steps} currentStep={currentStep} />

            <div className="mt-8">
                {/* STEP 1: MARKET CONTEXT */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-[#0f1115] border border-blue-500/20 p-8 rounded-3xl shadow-xl shadow-blue-900/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg shadow-inner">
                                        <Sparkles className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white uppercase tracking-tight">{t.new_campaign.wizard.market.intel_title}</h3>
                                        <p className="text-xs text-blue-400/80 font-medium">{t.new_campaign.wizard.market.intel_subtitle}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                            {t.new_campaign.wizard.market.topic_label} <span className="text-red-500">*</span> <HelpTooltip text={t.new_campaign.wizard.help.topic} />
                                        </label>
                                        <input
                                            type="text"
                                            className={`w-full bg-black/40 border ${errors.topic ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-700`}
                                            placeholder={t.new_campaign.wizard.market.topic_placeholder}
                                            value={contextData.topic}
                                            onChange={(e) => {
                                                setContextData({ ...contextData, topic: e.target.value })
                                                if (errors.topic) setErrors(prev => ({ ...prev, topic: '' }))
                                            }}
                                        />
                                        {errors.topic && <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">{errors.topic}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
                                                {t.new_campaign.wizard.market.orientation_label} <HelpTooltip text={t.new_campaign.wizard.help.orientation} />
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-700"
                                                placeholder={t.new_campaign.wizard.market.orientation_placeholder}
                                                value={contextData.orientation}
                                                onChange={(e) => setContextData({ ...contextData, orientation: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
                                                {t.new_campaign.wizard.market.problem_label} <HelpTooltip text={t.new_campaign.wizard.help.problem} />
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-700"
                                                placeholder={t.new_campaign.wizard.market.problem_placeholder}
                                                value={contextData.problem}
                                                onChange={(e) => setContextData({ ...contextData, problem: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
                                            {t.new_campaign.wizard.market.differential_label} <HelpTooltip text={t.new_campaign.wizard.help.differential} />
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-700"
                                            placeholder={t.new_campaign.wizard.market.differential_placeholder}
                                            value={contextData.differential}
                                            onChange={(e) => setContextData({ ...contextData, differential: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleAnalyzeMarket}
                                        disabled={isAnalyzing || !contextData.topic}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Sparkles className="w-4 h-4 animate-spin" />
                                                {t.new_campaign.wizard.market.analyzing}
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                                {t.new_campaign.wizard.market.analyze_button}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: AI INSIGHTS & CAMPAIGN NAME */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        {marketData && (
                            <div className="bg-[#0f1115] border border-blue-500/20 p-8 rounded-3xl shadow-xl shadow-blue-900/10">
                                <MarketInsights data={marketData} isLoading={isAnalyzing} />
                            </div>
                        )}

                        <div className="bg-[#0f1115] border border-white/10 p-8 rounded-3xl shadow-lg space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                    {t.new_campaign.form.name_label} <span className="text-red-500">*</span> <HelpTooltip text={t.new_campaign.wizard.help.name} />
                                </label>
                                <input
                                    required
                                    type="text"
                                    className={`w-full bg-black/40 border ${errors.name ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-700`}
                                    placeholder={t.new_campaign.form.name_placeholder}
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value })
                                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                                    }}
                                />
                                {errors.name && <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">{errors.name}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: CORE STRATEGY */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-[#0f1115] border border-white/10 p-8 rounded-3xl shadow-lg space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <Target className="w-5 h-5 text-blue-400" />
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight">{t.new_campaign.wizard.steps.strategy}</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                        {t.new_campaign.form.objective_label} <span className="text-red-500">*</span> <HelpTooltip text={t.new_campaign.wizard.help.objective} />
                                    </label>
                                    <textarea
                                        className={`w-full h-24 bg-black/40 border ${errors.strategic_objective ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-blue-500/50 outline-none resize-none transition-all placeholder:text-gray-700`}
                                        placeholder={t.new_campaign.form.objective_placeholder}
                                        value={formData.strategic_objective}
                                        onChange={(e) => {
                                            setFormData({ ...formData, strategic_objective: e.target.value })
                                            if (errors.strategic_objective) setErrors(prev => ({ ...prev, strategic_objective: '' }))
                                        }}
                                    />
                                    {errors.strategic_objective && <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">{errors.strategic_objective}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
                                            {t.new_campaign.form.duration_label} <HelpTooltip text={t.new_campaign.wizard.help.duration} />
                                        </label>
                                        <select
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer"
                                            value={formData.duration_type}
                                            onChange={(e) => setFormData({ ...formData, duration_type: e.target.value })}
                                        >
                                            <option value="Mensual">{t.new_campaign.options.duration.monthly}</option>
                                            <option value="Trimestral">{t.new_campaign.options.duration.quarterly}</option>
                                            <option value="Anual">{t.new_campaign.options.duration.annual}</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
                                            {t.new_campaign.form.framework_label} <HelpTooltip text={t.new_campaign.wizard.help.framework} />
                                        </label>
                                        <select
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer"
                                            value={formData.objective}
                                            onChange={(e) => setFormData({ ...formData, objective: e.target.value as Objective })}
                                        >
                                            {OBJ_OPTIONS.map(opt => (
                                                <option key={opt.value} className="bg-gray-900" value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tight mt-1">
                                            Framework: {OBJ_OPTIONS.find(o => o.value === formData.objective)?.framework}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
                                        {t.new_campaign.form.cta_label} <HelpTooltip text={t.new_campaign.wizard.help.cta} />
                                    </label>
                                    <CreatableSelect
                                        options={CTA_OPTIONS}
                                        value={formData.cta}
                                        onChange={(val: string) => setFormData({ ...formData, cta: val })}
                                        placeholder={t.new_campaign.form.cta_placeholder}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: CONTENT FOUNDATIONS */}
                {currentStep === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-[#0f1115] border border-white/10 p-8 rounded-3xl shadow-lg space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight">{t.new_campaign.wizard.steps.content}</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
                                        {t.new_campaign.form.pillars_label} <HelpTooltip text={t.new_campaign.wizard.help.pillars} />
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <CreatableSelect
                                                options={PILLAR_OPTIONS}
                                                value={tempPillar}
                                                onChange={setTempPillar}
                                                placeholder={t.new_campaign.form.pillars_placeholder}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addPillar}
                                            className="px-6 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all border border-white/10"
                                        >
                                            {t.new_campaign.form.add_pillar}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.pillars?.map((p, i) => (
                                            <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-300 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-blue-500/20 flex items-center gap-2 animate-in zoom-in duration-300">
                                                {p}
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, pillars: prev.pillars?.filter((_, idx) => idx !== i) }))}
                                                    className="hover:text-white"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
                                            {t.new_campaign.form.copy_instructions_label} <HelpTooltip text={t.new_campaign.wizard.help.copy_instructions} />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => handleGenerateInstructions('copy')}
                                            disabled={isGeneratingCopy || !contextData.topic}
                                            className="text-[10px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 uppercase tracking-wider transition-colors disabled:opacity-50"
                                        >
                                            {isGeneratingCopy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                            {t.new_campaign.wizard.market.insights.generate_instructions}
                                        </button>
                                    </div>
                                    <textarea
                                        className="w-full h-40 bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white text-sm focus:ring-1 focus:ring-blue-500/50 outline-none resize-none transition-all placeholder:text-gray-700"
                                        placeholder={t.new_campaign.form.copy_instructions_placeholder}
                                        value={formData.custom_copy_instructions}
                                        onChange={(e) => setFormData({ ...formData, custom_copy_instructions: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 5: VISUAL IDENTITY */}
                {currentStep === 5 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-[#0f1115] border border-white/10 p-8 rounded-3xl shadow-lg space-y-6">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <Paintbrush className="w-5 h-5 text-blue-400" />
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight">{t.new_campaign.wizard.steps.visual}</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                            {t.new_campaign.form.visual_style_label} <span className="text-red-500">*</span> <HelpTooltip text={t.new_campaign.wizard.help.visual_style} />
                                        </label>
                                        <select
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer"
                                            value={formData.visual_style}
                                            onChange={(e) => setFormData({ ...formData, visual_style: e.target.value as VisualStyle })}
                                        >
                                            {STYLE_OPTIONS.map(opt => (
                                                <option key={opt.value} className="bg-gray-900" value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
                                            {t.new_campaign.form.mood_label} <HelpTooltip text={t.new_campaign.wizard.help.mood} />
                                        </label>
                                        <CreatableSelect
                                            options={MOOD_OPTIONS}
                                            value={formData.mood}
                                            onChange={(val: string) => setFormData({ ...formData, mood: val })}
                                            placeholder={t.new_campaign.form.mood_placeholder}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
                                        {t.new_campaign.form.palette_label} <HelpTooltip text={t.new_campaign.wizard.help.palette} />
                                    </label>
                                    <CreatableSelect
                                        options={PALETTE_OPTIONS}
                                        value={formData.color_palette}
                                        onChange={(val: string) => setFormData({ ...formData, color_palette: val })}
                                        placeholder={t.new_campaign.form.palette_placeholder}
                                    />
                                </div>

                                <div className="space-y-2 pt-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
                                            {t.new_campaign.form.visual_instructions_label} <HelpTooltip text={t.new_campaign.wizard.help.visual_instructions} />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => handleGenerateInstructions('visual')}
                                            disabled={isGeneratingVisual || !contextData.topic}
                                            className="text-[10px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 uppercase tracking-wider transition-colors disabled:opacity-50"
                                        >
                                            {isGeneratingVisual ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                            {t.new_campaign.wizard.market.insights.generate_instructions}
                                        </button>
                                    </div>
                                    <textarea
                                        className="w-full h-40 bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white text-sm focus:ring-1 focus:ring-blue-500/50 outline-none resize-none transition-all placeholder:text-gray-700"
                                        placeholder={t.new_campaign.form.visual_instructions_placeholder}
                                        value={formData.custom_visual_instructions}
                                        onChange={(e) => setFormData({ ...formData, custom_visual_instructions: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* NAVIGATION BUTTONS */}
                <div className="pt-12 flex items-center justify-between border-t border-white/5">
                    <button
                        type="button"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all disabled:opacity-0 disabled:pointer-events-none"
                    >
                        {t.new_campaign.wizard.nav.back}
                    </button>

                    <div className="flex gap-4">
                        {currentStep < 5 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/10 hover:border-blue-500/50 shadow-lg shadow-blue-500/5"
                            >
                                {t.new_campaign.wizard.nav.next}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleSubmit()}
                                disabled={loading}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95"
                            >
                                {loading ? t.new_campaign.form.submitting : t.new_campaign.wizard.nav.create}
                                {!loading && <Save className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
