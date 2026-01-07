'use client'

import React from 'react'
import { Database } from '@/types/database.types'
import { Target, Paintbrush, Calendar, ArrowRight, Zap, Settings } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

type Campaign = Database['public']['Tables']['campaigns']['Row']

interface CampaignListProps {
    campaigns: Campaign[]
    onGenerateClick: (campaign: Campaign) => void
}

export function CampaignList({ campaigns, onGenerateClick }: CampaignListProps) {
    const { t } = useLanguage()
    if (campaigns.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-secondary/5">
                <Target className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium text-white mb-1">{t.campaigns.empty_title}</h3>
                <p className="text-sm text-gray-500">{t.campaigns.empty_desc}</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
                <div key={campaign.id} className="group bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent -mr-8 -mt-8 rounded-full blur-xl group-hover:from-primary/20 transition-all" />

                    <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                            <a href={`/projects/${campaign.project_id}/campaigns/${campaign.id}`} className="block flex-1 hover:opacity-80 transition-opacity">
                                <div>
                                    <h4 className="font-bold text-white text-lg leading-tight mb-1">{campaign.name}</h4>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${campaign.objective === 'Venta Directa' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        campaign.objective === 'Educativo' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                        }`}>
                                        {campaign.objective}
                                    </span>
                                </div>
                            </a>
                            <div className="flex items-center gap-1.5 z-10">
                                <Link
                                    href={`/projects/${campaign.project_id}/campaigns/${campaign.id}/edit`}
                                    className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                                    title={t.campaigns.edit_campaign}
                                >
                                    <Settings className="w-4 h-4" />
                                </Link>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        e.preventDefault()
                                        onGenerateClick(campaign)
                                    }}
                                    className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                                    title={t.campaigns.quick_generate}
                                >
                                    <Zap className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <a href={`/projects/${campaign.project_id}/campaigns/${campaign.id}`} className="block">
                            <div className="space-y-3 text-xs text-gray-400 mb-4">
                                <div className="flex items-center gap-2">
                                    <Paintbrush className="w-3.5 h-3.5" />
                                    <span className="truncate">{campaign.visual_style.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Target className="w-3.5 h-3.5" />
                                    <span className="truncate">{t.campaigns.cta_label}: {campaign.cta}</span>
                                </div>
                            </div>

                            {campaign.pillars && campaign.pillars.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {campaign.pillars.slice(0, 3).map((pillar, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-secondary border border-white/5 rounded text-[10px] text-gray-300">
                                            {pillar}
                                        </span>
                                    ))}
                                    {campaign.pillars.length > 3 && (
                                        <span className="px-1.5 py-0.5 text-[10px] text-gray-500">+{campaign.pillars.length - 3}</span>
                                    )}
                                </div>
                            )}
                        </a>
                    </div>
                </div>
            ))}
        </div>
    )
}
