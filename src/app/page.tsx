'use client'

import React, { useState } from 'react'
import { LandingHero } from '@/components/landing/LandingHero'
import { FeaturesGrid } from '@/components/landing/FeaturesGrid'
import { TestimonialsCarousel } from '@/components/landing/TestimonialsCarousel'
import { TermsPopup } from '@/components/landing/TermsPopup'
import { ScrollText, Github, Twitter, Linkedin, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/lib/utils'

export default function LandingPage() {
    const [isTermsOpen, setIsTermsOpen] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { lang, setLang, t } = useLanguage()

    return (
        <main className="min-h-screen bg-[#0a0a0a] selection:bg-blue-500/30 overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 px-4 md:px-6 py-6 lg:mt-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between glass px-6 md:px-8 py-4 rounded-3xl border-none">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-xl">
                            C
                        </div>
                        <span className="text-xl font-black text-white tracking-tighter uppercase hidden xs:block">FACTORY</span>
                    </div>

                    <div className="hidden lg:flex items-center gap-10">
                        <a href="#features" className="text-[10px] font-black text-gray-400 hover:text-white transition-colors uppercase tracking-[0.2em]">{t.nav.features}</a>
                        <a href="#testimonials" className="text-[10px] font-black text-gray-400 hover:text-white transition-colors uppercase tracking-[0.2em]">{t.nav.testimonials}</a>
                        <button onClick={() => setIsTermsOpen(true)} className="text-[10px] font-black text-gray-400 hover:text-white transition-colors uppercase tracking-[0.2em]">{t.nav.terms}</button>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                        {/* Language Selector */}
                        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10">
                            <button
                                onClick={() => setLang('en')}
                                className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center transition-all text-[9px] font-black",
                                    lang === 'en' ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                                )}
                            >EN</button>
                            <button
                                onClick={() => setLang('es')}
                                className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center transition-all text-[9px] font-black",
                                    lang === 'es' ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                                )}
                            >ES</button>
                        </div>

                        <Link href="/login" className="hidden sm:block text-[10px] font-black text-white hover:text-blue-400 transition-colors uppercase tracking-widest px-2">
                            {t.nav.login}
                        </Link>

                        <Link href="/signup" className="hidden xs:block">
                            <button className="px-5 py-3 rounded-xl bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5">
                                {t.nav.join}
                            </button>
                        </Link>

                        <button
                            className="lg:hidden p-2 glass rounded-xl text-white"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={cn(
                    "lg:hidden absolute top-24 left-4 right-4 glass p-8 rounded-[2.5rem] border-white/10 space-y-8 transition-all duration-500",
                    isMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-4 pointer-events-none"
                )}>
                    <div className="flex flex-col gap-6 text-center">
                        <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-sm font-black text-gray-400 uppercase tracking-widest">{t.nav.features}</a>
                        <a href="#testimonials" onClick={() => setIsMenuOpen(false)} className="text-sm font-black text-gray-400 uppercase tracking-widest">{t.nav.testimonials}</a>
                        <button onClick={() => { setIsTermsOpen(true); setIsMenuOpen(false); }} className="text-sm font-black text-gray-400 uppercase tracking-widest">{t.nav.terms}</button>
                    </div>
                    <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                        <Link href="/login" className="w-full text-center py-4 text-sm font-black text-white uppercase tracking-widest">{t.nav.login}</Link>
                        <Link href="/signup" className="w-full">
                            <button className="w-full py-4 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-widest">{t.nav.join}</button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Sections */}
            <div className="flex flex-col">
                <LandingHero />

                <section id="features" className="scroll-mt-32 -mt-12 md:-mt-20">
                    <FeaturesGrid />
                </section>

                <section id="testimonials" className="scroll-mt-32 -mt-4 md:-mt-8">
                    <TestimonialsCarousel />
                </section>

                {/* Integration / Call to Action CTA */}
                <section className="py-12 md:py-16 px-4 md:px-6">
                    <div className="max-w-5xl mx-auto glass-card rounded-[3rem] md:rounded-[4rem] p-8 md:p-14 text-center space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-blue-600/10 md:bg-blue-600/20 blur-[80px] md:blur-[120px] rounded-full -z-1" />
                        <div className="absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-purple-600/10 md:bg-purple-600/20 blur-[80px] md:blur-[120px] rounded-full -z-1" />

                        <div className="space-y-6">
                            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none">
                                {t.cta.title} <br className="md:hidden" />
                                <span className="text-gradient">{t.cta.title_accent}</span>
                            </h2>
                            <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
                                {t.cta.description}
                            </p>
                        </div>

                        <Link href="/signup" className="inline-block pt-4 w-full md:w-auto">
                            <button className="w-full md:px-12 py-5 md:py-6 rounded-2xl md:rounded-3xl bg-blue-600 text-white font-black text-lg md:text-2xl shadow-[0_10px_50px_rgba(37,99,235,0.3)] hover:scale-[1.05] transition-all active:scale-95">
                                {t.cta.button}
                            </button>
                        </Link>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="py-20 px-4 md:px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center md:text-left">
                        <div className="flex items-center gap-3 justify-center md:justify-start font-black text-xl">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">C</div>
                            <span className="tracking-tighter uppercase">FACTORY</span>
                        </div>
                        <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">© 2025 Matrix AI Labs. {t.footer.rights}</p>
                    </div>

                    <div className="flex items-center gap-10">
                        <button onClick={() => setIsTermsOpen(true)} className="text-gray-500 hover:text-white transition-colors"><ScrollText className="w-5 h-5" /></button>
                        <a href="#" className="text-gray-500 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                        <a href="#" className="text-gray-500 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                        <a href="#" className="text-gray-500 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                    </div>
                </div>
            </footer>

            {/* Terms Popup */}
            <TermsPopup isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
        </main>
    )
}
