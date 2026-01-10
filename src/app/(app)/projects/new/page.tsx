'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Rocket, Building2, Target, Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/types/database.types'
import { useLanguage } from '@/context/LanguageContext'
import { SafeInsertBuilder } from '@/utils/supabaseSafe'

type BrandVoice = Database['public']['Tables']['project_master']['Row']['brand_voice']

export default function NewProjectPage() {
    const router = useRouter()
    const supabase = React.useMemo(() => createClient(), [])
    const { t, lang } = useLanguage()
    const [loading, setLoading] = useState(false)

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            if (!user) throw new Error('Not authenticated')

            const { data, error } = await (supabase
                .from('project_master') as unknown as SafeInsertBuilder<'project_master'>)
                .insert([{ ...formData, user_id: user.id }])
                .select()

            if (error) throw error

            if (data && data[0]) {
                router.push(`/projects/${data[0].id}`)
            }
        } catch (error) {
            console.error('Error creating project:', error)
            alert(t.settings.error)
        } finally {
            setLoading(false)
        }
    }

    const voiceOptions: { value: BrandVoice; label: string }[] = [
        { value: 'Professional', label: lang === 'es' ? 'Profesional (Confiable, serio)' : 'Professional (Trustworthy, serious)' },
        { value: 'Funny', label: lang === 'es' ? 'Divertido (Humorístico, atractivo)' : 'Funny (Humorous, engaging)' },
        { value: 'Urgent', label: lang === 'es' ? 'Urgente (Orientado a la acción)' : 'Urgent (Action-oriented, time-sensitive)' },
        { value: 'Educational', label: lang === 'es' ? 'Educativo (Informativo, útil)' : 'Educational (Informative, helpful)' },
        { value: 'Minimalist', label: lang === 'es' ? 'Minimalista (Limpio, directo)' : 'Minimalist (Clean, direct)' },
    ]

    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-8 transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {t.projects.back_to_dashboard}
            </Link>

            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">{t.projects.initialize_title}</h1>
                </div>
                <p className="text-gray-400">{t.projects.initialize_desc}</p>
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
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.projects.name_label}</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none placeholder:text-gray-600 transition-all"
                                placeholder="e.g. PoolPal AI"
                                value={formData.app_name}
                                onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.projects.niche_label}</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none placeholder:text-gray-600 transition-all"
                                placeholder="e.g. Mantenimiento de Piscinas"
                                value={formData.niche_vertical}
                                onChange={(e) => setFormData({ ...formData, niche_vertical: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.projects.offering_label}</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none placeholder:text-gray-600 transition-all"
                            placeholder="e.g. Un asistente IA que analiza el agua de tu piscina con una foto."
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
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.projects.usp_label}</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none placeholder:text-gray-600 transition-all"
                            placeholder="e.g. Es 10 veces más rápido y preciso que los tests manuales."
                            value={formData.usp}
                            onChange={(e) => setFormData({ ...formData, usp: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.projects.problem_label}</label>
                        <textarea
                            required
                            className="w-full h-24 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none resize-none placeholder:text-gray-600 transition-all"
                            placeholder="e.g. Elimina la incertidumbre sobre qué químicos agregar y evita que el agua se ponga verde."
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
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.projects.audience_label}</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none placeholder:text-gray-600 transition-all"
                            placeholder="e.g. Dueños de casas con piscina, gente ocupada..."
                            value={formData.target_audience}
                            onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.projects.voice_label}</label>
                        <select
                            required
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none appearance-none cursor-pointer"
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
                        disabled={loading}
                        className="bg-primary hover:bg-blue-600 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? t.projects.initializing : t.projects.create_company}
                        {!loading && <Rocket className="w-5 h-5" />}
                    </button>
                </div>
            </form>
        </div>
    )
}
