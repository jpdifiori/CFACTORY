'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Save, Paintbrush, Target, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/types/database.types'
import { CreatableSelect } from '@/components/ui/CreatableSelect'
import { useLanguage } from '@/context/LanguageContext'
import { useTitle } from '@/context/TitleContext'
import { SafeSelectBuilder, SafeUpdateBuilder } from '@/utils/supabaseSafe'

type Objective = Database['public']['Tables']['campaigns']['Row']['objective']
type VisualStyle = Database['public']['Tables']['campaigns']['Row']['visual_style']

// LOV Constants
const OBJ_OPTIONS = [
    { value: 'Educativo', label: 'Educativo (Teach & Value)', framework: 'Hook-Story-Offer' },
    { value: 'Venta Directa', label: 'Venta Directa (Conversion)', framework: 'AIDA' },
    { value: 'Autoridad_Miedo', label: 'Autoridad/Miedo (Problem Aware)', framework: 'PAS' },
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

export default function EditCampaignPage() {
    const router = useRouter()
    const params = useParams()
    const supabase = createClient()
    const projectId = params.id as string
    const campaignId = params.campaignId as string
    const { t } = useLanguage()
    const { setTitle } = useTitle()
    const [projectName, setProjectName] = useState('')

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        objective: 'Educativo' as Objective,
        pillars: [] as string[],
        cta: '',
        visual_style: 'Fotografia_Realista' as VisualStyle,
        color_palette: '',
        mood: '',
        custom_copy_instructions: '',
        custom_visual_instructions: ''
    })

    // Pillar input helper
    const [tempPillar, setTempPillar] = useState('')

    useEffect(() => {
        const fetchProject = async () => {
            const { data } = await (supabase
                .from('project_master') as unknown as SafeSelectBuilder<'project_master'>)
                .select('app_name')
                .eq('id', projectId)
                .single()
            if (data) setProjectName((data as { app_name: string }).app_name)
        }

        const fetchCampaign = async () => {
            try {
                const { data, error } = await (supabase
                    .from('campaigns') as unknown as SafeSelectBuilder<'campaigns'>)
                    .select('*')
                    .eq('id', campaignId)
                    .single()

                if (error) throw error
                if (data) {
                    setFormData({
                        name: data.name || '',
                        objective: data.objective as Objective,
                        pillars: data.pillars || [],
                        cta: data.cta || '',
                        visual_style: data.visual_style as VisualStyle,
                        color_palette: data.color_palette || '',
                        mood: data.mood || '',
                        custom_copy_instructions: data.custom_copy_instructions || '',
                        custom_visual_instructions: data.custom_visual_instructions || ''
                    })
                }
            } catch (error) {
                console.error('Error fetching campaign:', error)
                alert('Failed to load campaign data.')
            } finally {
                setLoading(false)
            }
        }

        if (campaignId && projectId) {
            fetchCampaign()
            fetchProject()
        }
    }, [campaignId, projectId, supabase])

    useEffect(() => {
        if (formData.name) {
            setTitle(`${projectName || '...'} / ${formData.name} (${t.projects.edit_title})`)
        }
        return () => setTitle('')
    }, [projectName, formData.name, setTitle, t.projects.edit_title])

    const addPillar = () => {
        if (tempPillar.trim() && !formData.pillars?.includes(tempPillar.trim())) {
            setFormData(prev => ({
                ...prev,
                pillars: [...(prev.pillars || []), tempPillar.trim()]
            }))
            setTempPillar('')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const { error } = await (supabase
                .from('campaigns') as unknown as SafeUpdateBuilder<'campaigns'>)
                .update(formData)
                .eq('id', campaignId)

            if (error) throw error

            router.push(`/projects/${projectId}`)
        } catch (error) {
            console.error('Error updating campaign:', error)
            alert('Failed to update campaign.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground animate-pulse">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                <p className="font-mono text-xs uppercase tracking-widest">Loading Campaign Settings...</p>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <Link href={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Project
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Edit Campaign Strategy</h1>
                <p className="text-muted-foreground">Modify the core strategy and visual direction for &quot;{formData.name}&quot;.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* 1. Strategy Level */}
                <div className="bg-card border border-border p-8 rounded-xl shadow-lg space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <Target className="w-6 h-6 text-blue-400" />
                        <h3 className="text-xl font-semibold text-white">Strategy Level</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Campaign Name</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                                placeholder="e.g. Summer Launch 2024"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Objective</label>
                                <select
                                    required
                                    className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
                                    value={formData.objective}
                                    onChange={(e) => setFormData({ ...formData, objective: e.target.value as Objective })}
                                >
                                    {OBJ_OPTIONS.map(opt => (
                                        <option key={opt.value} className="bg-gray-900" value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Main CTA</label>
                                <CreatableSelect
                                    options={CTA_OPTIONS}
                                    value={formData.cta}
                                    onChange={(val) => setFormData({ ...formData, cta: val })}
                                    placeholder="Select or type CTA..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Content Pillars</label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <CreatableSelect
                                        options={PILLAR_OPTIONS}
                                        value={tempPillar}
                                        onChange={setTempPillar}
                                        placeholder="Select or type a pillar..."
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={addPillar}
                                    className="px-4 bg-secondary hover:bg-white/10 rounded-lg text-white transition-colors border border-border"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.pillars?.map((p, i) => (
                                    <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 flex items-center gap-2">
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
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Custom Copywriting Instructions (Master Prompt)</label>
                            <textarea
                                className="w-full h-32 bg-secondary/50 border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                                placeholder="e.g. Always start with a provocative question."
                                value={formData.custom_copy_instructions}
                                onChange={(e) => setFormData({ ...formData, custom_copy_instructions: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Visual Level */}
                <div className="bg-card border border-border p-8 rounded-xl shadow-lg space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <Paintbrush className="w-6 h-6 text-purple-400" />
                        <h3 className="text-xl font-semibold text-white">Visual Identity</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Visual Style</label>
                            <select
                                required
                                className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
                                value={formData.visual_style}
                                onChange={(e) => setFormData({ ...formData, visual_style: e.target.value as VisualStyle })}
                            >
                                {STYLE_OPTIONS.map(opt => (
                                    <option key={opt.value} className="bg-gray-900" value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mood / Vibe</label>
                            <CreatableSelect
                                options={MOOD_OPTIONS}
                                value={formData.mood}
                                onChange={(val) => setFormData({ ...formData, mood: val })}
                                placeholder="Select or type Mood..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Color Palette</label>
                        <CreatableSelect
                            options={PALETTE_OPTIONS}
                            value={formData.color_palette}
                            onChange={(val) => setFormData({ ...formData, color_palette: val })}
                            placeholder="Select or type Palette..."
                        />
                    </div>

                    <div className="space-y-2 pt-4">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Custom Visual Artist Instructions (Master Prompt)</label>
                        <textarea
                            className="w-full h-32 bg-secondary/50 border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                            placeholder="e.g. Figures should be silhouettes."
                            value={formData.custom_visual_instructions}
                            onChange={(e) => setFormData({ ...formData, custom_visual_instructions: e.target.value })}
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-full font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-primary/25 hover:scale-105"
                    >
                        {saving ? 'Saving Changes...' : 'Save Campaign Changes'}
                        {!saving && <Save className="w-5 h-5" />}
                    </button>
                </div>
            </form>
        </div>
    )
}
