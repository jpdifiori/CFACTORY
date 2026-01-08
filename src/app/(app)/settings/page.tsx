'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useLanguage } from '@/context/LanguageContext'
import { User, Save, Loader2, Sparkles } from 'lucide-react'
import { useTitle } from '@/context/TitleContext'

export default function SettingsPage() {
    const supabase = createClient()
    const { t } = useLanguage()
    const { setTitle } = useTitle()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState({
        full_name: '',
        job_title: ''
    })

    useEffect(() => {
        fetchProfile()
        setTitle(t.nav.settings)
        return () => setTitle('')
    }, [setTitle, t.nav.settings])

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await (supabase
                .from('profiles')
                .select('full_name, job_title')
                .eq('id', user.id)
                .single() as any)

            if (error) {
                console.error('Supabase fetch error details:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                })
                if (error.code === 'PGRST116') {
                    console.warn('No profile found (PGRST116), using fallback defaults.')
                    setProfile({
                        full_name: user.user_metadata?.full_name || '',
                        job_title: (user.user_metadata?.job_title || '')
                    })
                    return
                }
                throw error
            }
            if (data) setProfile(data)
        } catch (error: any) {
            console.error('Final catch in fetchProfile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error } = await (supabase
                .from('profiles') as any)
                .update(profile)
                .eq('id', user.id)

            if (error) throw error
            alert(t.settings.success)
        } catch (error) {
            console.error('Error updating profile:', error)
            alert(t.settings.error)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="mb-10">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-blue-600/10 rounded-2xl">
                        <User className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight">{t.settings.title}</h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">{t.settings.profile_section}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="glass p-8 rounded-[2.5rem] border-white/5 shadow-2xl space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">{t.settings.full_name}</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-600/50 outline-none transition-all placeholder:text-gray-600 font-bold"
                            value={profile.full_name || ''}
                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1">{t.settings.job_title}</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-600/50 outline-none transition-all placeholder:text-gray-600 font-bold"
                            value={profile.job_title || ''}
                            onChange={(e) => setProfile({ ...profile, job_title: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-2xl shadow-blue-600/20 group hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {saving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {t.settings.save}
                                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
