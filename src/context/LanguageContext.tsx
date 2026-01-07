'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '@/lib/translations'

type Language = 'en' | 'es'

interface LanguageContextType {
    lang: Language
    setLang: (lang: Language) => void
    t: typeof translations.en
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    // Initialize state with a function to read from localStorage only once on mount (client-side)
    const [lang, setLangState] = useState<Language>('es')
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('lang') as Language
            if (saved && (saved === 'en' || saved === 'es')) {
                setLangState(saved)
            } else {
                // Auto-detect browser language
                const browserLang = navigator.language.split('-')[0]
                if (browserLang === 'en' || browserLang === 'es') {
                    setLangState(browserLang as Language)
                }
            }
            setIsInitialized(true)
        }
    }, [])

    const setLang = (l: Language) => {
        setLangState(l)
        localStorage.setItem('lang', l)
    }

    const t = translations[lang]

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) throw new Error('useLanguage must be used within LanguageProvider')
    return context
}
