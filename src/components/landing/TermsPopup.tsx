'use client'

import React from 'react'
import { X, Shield, ScrollText, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface TermsPopupProps {
    isOpen: boolean
    onClose: () => void
}

export function TermsPopup({ isOpen, onClose }: TermsPopupProps) {
    const { t } = useLanguage()
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <ScrollText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">{t.terms.title}</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{t.terms.updated}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto space-y-8 scrollbar-hide">
                    {t.terms.sections.map((section, i) => (
                        <div key={i} className="space-y-4">
                            <h4 className="flex items-center gap-2 text-white font-bold">
                                <Shield className="w-4 h-4 text-primary" />
                                {section.title}
                            </h4>
                            <p className="text-gray-400 leading-relaxed text-sm">
                                {section.content}
                            </p>
                        </div>
                    ))}

                    <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-4">
                        <CheckCircle2 className="w-6 h-6 text-blue-400 shrink-0" />
                        <p className="text-xs text-blue-100/60 leading-relaxed italic">
                            {t.terms.disclaimer}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/5 bg-white/[0.02]">
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-xl bg-primary hover:bg-blue-600 text-white font-black transition-all shadow-lg active:scale-95"
                    >
                        {t.terms.button}
                    </button>
                </div>
            </div>
        </div>
    )
}
