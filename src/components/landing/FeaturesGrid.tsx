'use client'

import React from 'react'
import { TrendingUp, ImageIcon, MessageSquare, BarChart3, Globe } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export function FeaturesGrid() {
    const { t } = useLanguage()

    const featureIcons = [TrendingUp, ImageIcon, Globe, MessageSquare]
    const featuresExtended = t.features.items.map((item, i) => ({
        ...item,
        icon: featureIcons[i],
        color: i === 0 ? "text-blue-400" : i === 1 ? "text-purple-400" : i === 2 ? "text-green-400" : "text-amber-400",
        bg: i === 0 ? "bg-blue-400/10" : i === 1 ? "bg-purple-400/10" : i === 2 ? "bg-green-400/10" : "bg-amber-400/10",
        image: i === 0 ? "/market_trend_dashboard_illustration_1766886791299.png" : i === 1 ? "/landing_page_hero_bg_1766886777258.png" : null
    }))

    return (
        <section className="py-4 md:py-8 px-4 md:px-6 max-w-7xl mx-auto space-y-10 md:space-y-16">
            <div className="text-center space-y-3 max-w-3xl mx-auto px-4">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none">
                    {t.features.badge} <br className="md:hidden" />
                    <span className="text-gradient">{t.features.badge_accent}</span>
                </h2>
                <p className="text-gray-400 text-sm md:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                    {t.features.description}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {featuresExtended.map((feature) => (
                    <div
                        key={feature.title}
                        className={`glass-card p-0.5 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group hover:border-white/10 transition-all duration-500 ${feature.image ? 'md:col-span-2' : ''}`}
                    >
                        <div className={`p-6 md:p-10 flex flex-col ${feature.image ? 'lg:flex-row gap-6 md:gap-10 items-center' : 'h-full space-y-6'}`}>
                            <div className="flex-1 space-y-4 md:space-y-6">
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${feature.bg} flex items-center justify-center ${feature.color}`}>
                                    <feature.icon className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-xl md:text-3xl font-black text-white tracking-tight leading-none">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed text-xs md:text-base font-medium opacity-80">{feature.description}</p>
                                </div>
                                <div className="pt-2 flex items-center gap-3">
                                    <div className="flex -space-x-1.5 text-xs">
                                        {[1, 2, 3].map(n => (
                                            <div key={n} className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-[#0a0a0a] bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-[8px] md:text-[10px] text-gray-400 font-bold">AI</div>
                                        ))}
                                    </div>
                                    <span className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.features.trusted}</span>
                                </div>
                            </div>

                            {feature.image && (
                                <div className="flex-1 w-full relative aspect-[16/9] lg:aspect-[4/3] max-h-[300px] md:max-h-[400px] rounded-xl md:rounded-2xl overflow-hidden glass border-white/5 group-hover:border-white/10 transition-all mt-4 lg:mt-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-transparent to-transparent" />

                                    <div className="absolute bottom-3 left-3 right-3 p-3 glass rounded-lg md:rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                <span className="text-[8px] md:text-[10px] font-black text-white tracking-widest uppercase">{t.features.live_data}</span>
                                            </div>
                                            <BarChart3 className="w-3.5 h-3.5 text-white/30" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
