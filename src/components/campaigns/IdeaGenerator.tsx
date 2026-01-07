'use client'

import React, { useState } from 'react'
import { Sparkles, Lightbulb, CheckCircle2, Loader2, Zap, Paintbrush, Layout } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { CampaignIdea } from '@/lib/ai/flows'
import { generateCampaignIdeasAction } from '@/app/actions/ai'

interface IdeaGeneratorProps {
    project: any
    campaign: any
    onSelectIdea: (idea: CampaignIdea) => void
}

export function IdeaGenerator({ project, campaign, onSelectIdea }: IdeaGeneratorProps) {
    const { t, lang } = useLanguage()
    const [ideas, setIdeas] = useState<CampaignIdea[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [lastSelection, setLastSelection] = useState<string | null>(null)
    const [selectedTexts, setSelectedTexts] = useState<Record<number, string>>({})
    const [currentIndex, setCurrentIndex] = useState(0)

    const handleGenerate = async () => {
        setIsLoading(true)
        setCurrentIndex(0) // Reset index on new generation
        try {
            const result = await generateCampaignIdeasAction({
                context: {
                    companyName: project.app_name,
                    niche: project.niche_vertical,
                    targetAudience: campaign.target_orientation || project.target_audience,
                    problemSolved: campaign.problem_solved || project.problem_solved,
                    offering: project.description,
                    differential: project.usp,
                    topic: campaign.topic || project.niche_vertical,
                    strategicObjective: campaign.strategic_objective || campaign.objective
                },
                campaignId: campaign.id,
                objective: campaign.strategic_objective || campaign.objective,
                language: lang === 'es' ? 'Español' : 'Ingles'
            })

            if (result.success && result.ideas) {
                setIdeas(result.ideas)
                setSelectedTexts({}) // Reset on new generation
            } else {
                alert(result.error || "Failed to generate ideas")
            }
        } catch (error) {
            console.error("Error generating ideas:", error)
            alert("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSelect = (idea: CampaignIdea, index: number) => {
        const selectedText = selectedTexts[index] || idea.image_text_examples[0]
        setLastSelection(idea.title)

        onSelectIdea({
            ...idea,
            visual_prompt: `${idea.visual_prompt}. Image Text: "${selectedText}"`
        })
    }

    const nextIdeas = () => {
        if (currentIndex + 2 < ideas.length) {
            setCurrentIndex(prev => prev + 2)
        }
    }

    const prevIdeas = () => {
        if (currentIndex - 2 >= 0) {
            setCurrentIndex(prev => prev - 2)
        }
    }

    const visibleIdeas = ideas.slice(currentIndex, currentIndex + 2)

    return (
        <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 space-y-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl -mr-16 -mt-16 rounded-full" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Lightbulb className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-widest uppercase">{t.campaigns.strategy_brainstorm}</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{t.campaigns.brainstorm_desc}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {ideas.length > 2 && (
                        <div className="flex items-center gap-2 mr-4">
                            <button
                                onClick={prevIdeas}
                                disabled={currentIndex === 0}
                                className="p-2 rounded-full border border-white/10 hover:bg-white/5 disabled:opacity-20 transition-all text-white"
                            >
                                ←
                            </button>
                            <span className="text-[10px] font-mono text-gray-500">
                                {Math.floor(currentIndex / 2) + 1} / {Math.ceil(ideas.length / 2)}
                            </span>
                            <button
                                onClick={nextIdeas}
                                disabled={currentIndex + 2 >= ideas.length}
                                className="p-2 rounded-full border border-white/10 hover:bg-white/5 disabled:opacity-20 transition-all text-white"
                            >
                                →
                            </button>
                        </div>
                    )}
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-primary hover:bg-blue-600 border border-primary/20 rounded-full text-xs font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {t.campaigns.generate_ideas}
                    </button>
                </div>
            </div>

            {ideas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[400px]">
                    {visibleIdeas.map((idea, vIndex) => {
                        const actualIndex = currentIndex + vIndex;
                        return (
                            <div
                                key={actualIndex}
                                className={`group relative bg-black/40 border p-5 rounded-2xl transition-all cursor-pointer hover:border-primary/50 hover:bg-black/60 ${lastSelection === idea.title ? 'border-primary shadow-lg shadow-primary/10 bg-primary/5' : 'border-white/5'}`}
                                onClick={() => handleSelect(idea, actualIndex)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-[9px] font-black text-primary uppercase tracking-widest">
                                        {idea.angle}
                                    </span>
                                    {lastSelection === idea.title && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                </div>
                                <h4 className="text-sm font-bold text-white mb-2 leading-tight group-hover:text-primary transition-colors">{idea.title}</h4>
                                <p className="text-[11px] text-gray-400 leading-relaxed mb-4 line-clamp-3 italic">"{idea.description}"</p>

                                <div className="bg-black/20 rounded-xl p-3 border border-white/5 mb-4 group-hover:border-primary/20 transition-all">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <Paintbrush className="w-3 h-3 text-primary" /> {lang === 'es' ? 'Imagen Recomendada' : 'Recommended Image'}
                                    </p>
                                    <p className="text-[10px] text-gray-300 leading-snug line-clamp-2 italic">
                                        {typeof idea.visual_prompt === 'string'
                                            ? idea.visual_prompt
                                            : (idea.visual_prompt as any)?.description || (idea.visual_prompt as any)?.title || 'Visual recommendation'}
                                    </p>
                                </div>

                                {idea.headline_examples && idea.headline_examples.length > 0 && (
                                    <div className="space-y-2 mb-4 bg-primary/5 rounded-xl p-3 border border-primary/10">
                                        <p className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                                            <Zap className="w-3 h-3" /> {t.campaigns.headline_examples}
                                        </p>
                                        <div className="space-y-1.5">
                                            {idea.headline_examples.map((ex, i) => (
                                                <p key={i} className="text-[10px] text-white/80 font-medium leading-tight pl-3 border-l-2 border-primary/30">
                                                    {ex}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {idea.image_text_examples && idea.image_text_examples.length > 0 && (
                                    <div className="space-y-2 mb-4 bg-secondary/30 rounded-xl p-3 border border-white/5">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                            <Layout className="w-3 h-3 text-blue-400" /> {t.campaigns.image_text_options}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {idea.image_text_examples.map((txt, i) => {
                                                const isSelected = selectedTexts[actualIndex] === txt || (!selectedTexts[actualIndex] && i === 0);
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedTexts(prev => ({ ...prev, [actualIndex]: txt }));
                                                        }}
                                                        className={`px-2 py-1 rounded text-[10px] border font-black uppercase tracking-tighter transition-all ${isSelected
                                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20 scale-105'
                                                            : 'bg-black/40 border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                                                            }`}
                                                    >
                                                        "{txt}"
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelect(idea, actualIndex);
                                        }}
                                        className="text-[9px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                                    >
                                        {t.campaigns.select_idea} →
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-2xl bg-black/20">
                    <Zap className="w-10 h-10 text-gray-700 mx-auto mb-3 opacity-20" />
                    <p className="text-sm text-gray-500 font-bold italic uppercase tracking-widest">
                        {isLoading ? t.campaigns.processing : t.campaigns.no_ideas}
                    </p>
                </div>
            )}
        </div>
    )
}
