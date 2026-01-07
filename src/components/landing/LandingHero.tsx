'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export function LandingHero() {
    const { t } = useLanguage()

    return (
        <section className="relative min-h-[60vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden py-8 md:py-12 px-4 md:px-6">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[#0a0a0a]" />
                <img
                    src="/landing_page_hero_bg_1766886777258.png"
                    alt="Background"
                    className="w-full h-full object-cover opacity-20 md:opacity-30 mix-blend-luminosity scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/90 to-[#0a0a0a]" />
            </div>

            {/* Glowing Orbs */}
            <div className="absolute top-1/4 left-1/4 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-blue-600/5 md:bg-blue-600/10 blur-[60px] md:blur-[120px] rounded-full animate-pulse-slow -z-1" />
            <div className="absolute bottom-1/4 right-1/4 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-purple-600/5 md:bg-purple-600/10 blur-[60px] md:blur-[120px] rounded-full animate-pulse-slow -z-1" />

            <div className="relative z-10 max-w-5xl text-center space-y-5 md:space-y-7 pt-24 md:pt-32">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass border-white/5 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-blue-100">{t.hero.badge}</span>
                </div>

                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    {t.hero.title_part1} <br />
                    <span className="text-gradient">{t.hero.title_part2}</span>
                </h1>

                <p className="max-w-xl mx-auto text-sm md:text-lg text-gray-400 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                    {t.hero.description}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-5 pt-3 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
                    <Link href="/signup" className="w-full sm:w-auto">
                        <button className="w-full px-8 md:px-12 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-sm md:text-base shadow-[0_10px_40px_rgba(37,99,235,0.2)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 active:scale-95 group">
                            {t.hero.cta_primary}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                    <Link href="/login" className="w-full sm:w-auto">
                        <button className="w-full px-8 md:px-12 py-3.5 md:py-4 rounded-xl md:rounded-2xl glass hover:bg-white/5 text-white font-black text-sm md:text-base transition-all border-white/5 active:scale-95">
                            {t.hero.cta_secondary}
                        </button>
                    </Link>
                </div>

                {/* Social Proof Mini */}
                <div className="pt-6 md:pt-10 flex flex-wrap justify-center items-center gap-6 md:gap-10 opacity-30 grayscale transition-all duration-500">
                    <span className="flex items-center gap-2 text-[8px] md:text-[10px] font-black tracking-[0.2em]">{t.hero.social_proof.fastest}</span>
                    <span className="flex items-center gap-2 text-[8px] md:text-[10px] font-black tracking-[0.2em]">{t.hero.social_proof.secure}</span>
                    <span className="flex items-center gap-2 text-[8px] md:text-[10px] font-black tracking-[0.2em]">{t.hero.social_proof.hd}</span>
                </div>
            </div>
        </section>
    )
}
