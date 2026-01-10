'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Building2, Target, Sparkles, Loader2, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/types/database.types'
import { useLanguage } from '@/context/LanguageContext'
import { useTitle } from '@/context/TitleContext'
import { SafeSelectBuilder, SafeUpdateBuilder } from '@/utils/supabaseSafe'

type BrandVoice = Database['public']['Tables']['project_master']['Row']['brand_voice']

export default function EditProjectPage() {
    const router = useRouter()
    const params = useParams()
    const supabase = createClient()
    const { t, lang } = useLanguage()
    const { setTitle } = useTitle()
    const projectId = typeof params.id === 'string' ? params.id : (Array.isArray(params.id) ? params.id[0] : '')

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        app_name: '',
        niche_vertical: '',
        description: '', // Qué vende
        target_audience: '',
        brand_voice: 'Professional' as BrandVoice,
        usp: '', // Diferencial clave
        problem_solved: '' // Qué problema resuelve
    })

    useEffect(() => {
        if (projectId) {
            fetchProject()
        }
    }, [projectId])

    const fetchProject = async () => {
        try {
            const { data, error } = await (supabase
                .from('project_master') as unknown as SafeSelectBuilder<'project_master'>)
                .select('*')
                .eq('id', projectId)
                .single()

            if (error) throw error
            if (data) {
                setFormData({
                    app_name: data.app_name || '',
                    niche_vertical: data.niche_vertical || '',
                    description: data.description || '',
                    target_audience: data.target_audience || '',
                    brand_voice: (data.brand_voice as BrandVoice) || 'Professional',
                    usp: data.usp || '',
                    problem_solved: data.problem_solved || ''
                })
            }
        } catch (error) {
            console.error('Error fetching project:', error)
            alert(t.settings.error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (formData.app_name) {
            setTitle(`${t.projects.edit_title}: ${formData.app_name}`)
        }
        return () => setTitle('')
    }, [formData.app_name, setTitle, t.projects.edit_title])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const { data, error } = await (supabase
                .from('project_master') as unknown as SafeUpdateBuilder<'project_master'>)
                .update({
                    app_name: formData.app_name,
                    niche_vertical: formData.niche_vertical,
                    description: formData.description,
                    target_audience: formData.target_audience,
                    brand_voice: formData.brand_voice,
                    usp: formData.usp,
                    problem_solved: formData.problem_solved
                })
                .eq('id', projectId)
                .select()

            if (error) throw error

            if (!data || data.length === 0) {
                throw new Error("No record updated. You may not have permission.")
            }

            router.push(`/projects/${projectId}`)
        } catch (error: any) {
            console.error('Error updating project:', error)
            alert(`Error updating company: ${error.message || 'Unknown error'}`)
        } finally {
            setSaving(false)
        }
    }

    const voiceOptions: { value: BrandVoice; label: string }[] = [
        { value: 'Professional', label: lang === 'es' ? 'Profesional (Confiable, serio)' : 'Professional (Trustworthy, serious)' },
        { value: 'Funny', label: lang === 'es' ? 'Divertido (Humorístico, atractivo)' : 'Funny (Humorous, engaging)' },
        { value: 'Urgent', label: lang === 'es' ? 'Urgente (Orientado a la acción)' : 'Urgent (Action-oriented, time-sensitive)' },
        { value: 'Educational', label: lang === 'es' ? 'Educativo (Informativo, útil)' : 'Educational (Informative, helpful)' },
        { value: 'Minimalist', label: lang === 'es' ? 'Minimalista (Limpio, directo)' : 'Minimalist (Clean, direct)' },
    ]

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-gray-400 font-medium">{t.projects.loading_details}</p>
            </div>
        )
    }

    // Effect for cleanup
    useEffect(() => {
        return () => setTitle('')
    }, [setTitle])

    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <Link href={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-8 transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {t.projects.back_to_project}
            </Link>

            <div className="mb-10 text-center md:text-left">
                <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">{t.projects.edit_title}</h1>
                </div>
                <p className="text-gray-400">{t.projects.foundation_desc}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* section 1: Basic Info */}
                <div className="bg-card/50 backdrop-blur-sm border border-border p-8 rounded-2xl shadow-xl space-y-6">
                    <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {t.projects.foundation_title}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company Name</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-gray-600"
                                value={formData.app_name}
                                onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Niche / Industry</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-gray-600"
                                value={formData.niche_vertical}
                                onChange={(e) => setFormData({ ...formData, niche_vertical: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Offering (Simple phrase)</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-gray-600"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                {/* section 2: Competitive Edge */}
                <div className="bg-card/50 backdrop-blur-sm border border-border p-8 rounded-2xl shadow-xl space-y-6">
                    <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {t.features.badge}
                    </h3>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Key Differential (USP)</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-gray-600"
                            value={formData.usp}
                            onChange={(e) => setFormData({ ...formData, usp: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Problem Solved</label>
                        <textarea
                            required
                            className="w-full h-24 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none resize-none transition-all placeholder:text-gray-600"
                            value={formData.problem_solved}
                            onChange={(e) => setFormData({ ...formData, problem_solved: e.target.value })}
                        />
                    </div>
                </div>

                {/* section 3: Audience & Tone */}
                <div className="bg-card/50 backdrop-blur-sm border border-border p-8 rounded-2xl shadow-xl space-y-6">
                    <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        {t.projects.audience_label} & {t.projects.voice_label}
                    </h3>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Audience</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-gray-600"
                            value={formData.target_audience}
                            onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Brand Voice</label>
                        <select
                            required
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none appearance-none cursor-pointer group"
                            value={formData.brand_voice}
                            onChange={(e) => setFormData({ ...formData, brand_voice: e.target.value as BrandVoice })}
                        >
                            {voiceOptions.map(opt => (
                                <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-primary hover:bg-blue-600 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {saving ? t.projects.saving : t.projects.save_changes}
                        {!saving && <Save className="w-5 h-5" />}
                    </button>
                </div>
            </form>
        </div>
    )
}
