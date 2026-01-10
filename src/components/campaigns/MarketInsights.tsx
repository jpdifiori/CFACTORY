import React from 'react'
import { Sparkles, TrendingUp, Search, ShieldAlert, Zap, BarChart3, AlertCircle } from 'lucide-react'
import { StrategyResponse } from '@/app/actions/strategy_actions'
import { useLanguage } from '@/context/LanguageContext'

interface MarketInsightsProps {
    data: StrategyResponse
    isLoading: boolean
}

export function MarketInsights({ data, isLoading }: MarketInsightsProps) {
    const { t } = useLanguage()
    const m = t.new_campaign.wizard.market.insights

    if (isLoading) {
        return (
            <div className="bg-black/40 border border-white/10 rounded-xl p-8 animate-pulse flex flex-col items-center justify-center gap-4">
                <Sparkles className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{m.analyzing}</p>
            </div>
        )
    }

    if (!data || !data.success) {
        if (data?.error) {
            return (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 flex items-center gap-4">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase">{m.failed}</h4>
                        <p className="text-red-300 text-xs">{data.error}</p>
                    </div>
                </div>
            )
        }
        return null
    }

    const { viral_card, seo_card, authority_card, scorecard } = data

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Scorecard Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 md:p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl -mr-32 -mt-32 rounded-full pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <svg className="w-24 h-24 transform -rotate-90">
                                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                <circle
                                    cx="48" cy="48" r="40"
                                    stroke="currentColor" strokeWidth="8" fill="transparent"
                                    strokeDasharray={251.2}
                                    strokeDashoffset={251.2 - (251.2 * scorecard.viral_potential) / 100}
                                    className="text-primary transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-white">{scorecard.viral_potential}</span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase">{m.score}</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">{m.viral_potential}</h3>
                            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-1">
                                <TrendingUp className="w-4 h-4" />
                                {scorecard.projected_reach}
                            </div>
                            <p className="text-gray-400 text-xs max-w-sm leading-relaxed">{scorecard.reasoning}</p>
                        </div>
                    </div>

                    <div className="hidden md:block w-px h-16 bg-white/10" />

                    <div className="flex flex-col gap-4">
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{m.niche_gap}</div>
                            <div className="text-white font-bold text-xs max-w-[200px] break-words">{authority_card.niche_gap || 'Analyzing...'}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{m.top_hook}</div>
                            <div className="text-white font-bold text-xs max-w-[200px] break-words">{viral_card.hooks?.[0] || 'Analyzing...'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insight Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Viral Hooks */}
                <div className="bg-black/20 border border-white/5 rounded-xl p-5 hover:border-primary/30 transition-colors group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-pink-500/10 rounded-lg group-hover:bg-pink-500/20 transition-colors">
                            <Zap className="w-4 h-4 text-pink-400" />
                        </div>
                        <h4 className="font-bold text-white text-sm uppercase tracking-wide">{m.hooks}</h4>
                    </div>
                    <ul className="space-y-3">
                        {viral_card.hooks?.map((hook, i) => (
                            <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                <span className="text-pink-500 font-bold mt-0.5">•</span>
                                <span className="italic">&quot;{hook}&quot;</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">{m.patterns}</p>
                        <div className="flex flex-wrap gap-1.5">
                            {viral_card.patterns?.map((p, i) => (
                                <span key={i} className="px-2 py-0.5 bg-pink-500/10 border border-pink-500/20 rounded text-[9px] text-pink-300 font-medium">
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. SEO & Search */}
                <div className="bg-black/20 border border-white/5 rounded-xl p-5 hover:border-blue-500/30 transition-colors group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                            <Search className="w-4 h-4 text-blue-400" />
                        </div>
                        <h4 className="font-bold text-white text-sm uppercase tracking-wide">{m.seo_title}</h4>
                    </div>
                    <p className="text-xs text-gray-400 mb-4 leading-relaxed">{seo_card.description}</p>
                    <div className="space-y-2">
                        {seo_card.keywords?.map((kw, i) => (
                            <div key={i} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg">
                                <span className="text-xs text-gray-200 font-medium">{kw}</span>
                                <BarChart3 className="w-3 h-3 text-blue-400 opacity-50" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Niche Authority (New) */}
                <div className="bg-black/20 border border-white/5 rounded-xl p-5 hover:border-yellow-500/30 transition-colors group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                            <ShieldAlert className="w-4 h-4 text-yellow-400" />
                        </div>
                        <h4 className="font-bold text-white text-sm uppercase tracking-wide">{m.authority_title}</h4>
                    </div>
                    <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-lg p-3 mb-4">
                        <p className="text-[10px] font-bold text-yellow-500 uppercase mb-1">{m.gap_label}</p>
                        <p className="text-xs text-yellow-100/80 leading-relaxed font-medium">
                            {authority_card.niche_gap}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-500 uppercase">{m.auth_keywords}</p>
                        <div className="flex flex-wrap gap-1.5">
                            {authority_card.keywords?.map((kw, i) => (
                                <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-gray-300 font-medium">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

