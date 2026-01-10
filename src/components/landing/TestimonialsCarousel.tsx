'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export function TestimonialsCarousel() {
    const { t } = useLanguage()
    const [activeIndex, setActiveIndex] = useState(0)

    const items = t.testimonials.items

    const next = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % items.length)
    }, [items.length])

    const prev = () => setActiveIndex((prev) => (prev - 1 + items.length) % items.length)

    useEffect(() => {
        const interval = setInterval(next, 5000)
        return () => clearInterval(interval)
    }, [next])

    return (
        <section className="py-6 md:py-10 px-6 overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/[0.03] blur-[100px] rounded-full -z-1" />

            <div className="max-w-7xl mx-auto space-y-10 md:space-y-16">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">{t.testimonials.title} <span className="text-gradient">{t.testimonials.title_accent}</span></h2>
                    <p className="text-gray-400 text-sm md:text-base font-medium opacity-70">{t.testimonials.subtitle}</p>
                </div>

                <div className="relative">
                    <div className="flex justify-center items-center">
                        <button onClick={prev} className="p-4 rounded-full glass hover:bg-white/5 text-white absolute left-0 z-10 hidden md:flex transition-all">
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <div className="w-full max-w-4xl px-4 md:px-0">
                            <div className="glass-card rounded-[3rem] p-10 md:p-20 relative overflow-hidden transition-all duration-500 animate-in fade-in zoom-in-95">
                                <Quote className="absolute top-10 right-10 w-24 h-24 text-white/[0.03] -rotate-12" />

                                <div className="space-y-8 relative z-10">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-2xl md:text-4xl font-bold text-white leading-tight italic">
                                        &quot;{items[activeIndex].content}&quot;
                                    </p>
                                    <div className="pt-8 flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white">
                                            {items[activeIndex].name[0]}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white">{items[activeIndex].name}</h4>
                                            <p className="text-blue-400 font-bold text-sm uppercase tracking-widest">{items[activeIndex].role}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button onClick={next} className="p-4 rounded-full glass hover:bg-white/5 text-white absolute right-0 z-10 hidden md:flex transition-all">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Dots */}
                    <div className="flex justify-center gap-3 mt-12">
                        {items.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveIndex(i)}
                                className={`h-2 rounded-full transition-all duration-500 ${i === activeIndex ? 'w-10 bg-primary shadow-[0_0_10px_rgba(37,99,235,0.8)]' : 'w-2 bg-white/10 hover:bg-white/20'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
