'use client'

import React, { useState } from 'react'
import { X, Sparkles, Layers, Video, FileText, Bell } from 'lucide-react'
import { Database } from '@/types/database.types'
import { useLanguage } from '@/context/LanguageContext'

type ContentType = Database['public']['Tables']['content_queue']['Row']['content_type']

interface GenerationModalProps {
    isOpen: boolean
    onClose: () => void
    onGenerate: (type: ContentType, quantity: number, language: 'Ingles' | 'Español') => void
    campaignName: string
    loading: boolean
}

export function GenerationModal({ isOpen, onClose, onGenerate, campaignName, loading }: GenerationModalProps) {
    const { t } = useLanguage()
    const [selectedType, setSelectedType] = useState<ContentType>('Post')
    const [quantity, setQuantity] = useState(5)
    const [language, setLanguage] = useState<'Ingles' | 'Español'>('Español')

    if (!isOpen) return null

    const types: { id: ContentType; label: string; icon: React.ReactNode }[] = [
        { id: 'Post', label: t.campaigns.social_post, icon: <Layers className="w-5 h-5 text-blue-400" /> },
        { id: 'Reel_Script', label: t.campaigns.reel_script, icon: <Video className="w-5 h-5 text-pink-400" /> },
        { id: 'Blog_SEO', label: t.campaigns.blog_article, icon: <FileText className="w-5 h-5 text-green-400" /> },
        { id: 'Push_Notification', label: t.campaigns.push_notification, icon: <Bell className="w-5 h-5 text-yellow-400" /> }
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-secondary/20">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            {t.campaigns.generate_title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Campaign: <span className="text-blue-300">{campaignName}</span></p>
                    </div>
                    <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Content Type Selector */}
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.campaigns.content_type}</label>
                        <div className="grid grid-cols-2 gap-3">
                            {types.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${selectedType === type.id
                                        ? 'bg-primary/10 border-primary text-white'
                                        : 'bg-secondary/30 border-white/5 text-gray-400 hover:bg-secondary/50 hover:text-white'
                                        }`}
                                >
                                    {type.icon}
                                    <span className="text-sm font-medium">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.campaigns.quantity}</label>
                            <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                {quantity} {t.campaigns.items_count}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>1</span>
                            <span>10</span>
                            <span>20</span>
                        </div>
                    </div>

                    {/* Language Selector */}
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.campaigns.language}</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Español', 'Ingles'].map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => setLanguage(lang as any)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${language === lang
                                        ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                                        : 'bg-secondary/30 border-white/5 text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {lang === 'Ingles' ? t.campaigns.english : t.campaigns.spanish}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => onGenerate(selectedType, quantity, language)}
                        disabled={loading}
                        className="w-full py-4 bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {t.campaigns.processing}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                {t.campaigns.start_generation}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
