'use client'

import React, { useState, useRef, useEffect } from 'react'
import { User, LogOut, ChevronDown, Languages, Settings } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { logoutAction } from '@/app/actions/auth'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export function UserMenu() {
    const { lang, setLang, t } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = async () => {
        setIsLoggingOut(true)
        await logoutAction()
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                    <User className="w-5 h-5" />
                </div>
                <div className="hidden sm:block text-left">
                    <p className="text-xs font-black text-white tracking-tight leading-none mb-1">Strategist</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{lang === 'en' ? 'Pro Plan' : 'Plan Pro'}</p>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-64 glass rounded-[2rem] border-white/10 p-2 shadow-2xl z-[9999] animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-4 border-b border-white/5">
                        <p className="text-sm font-black text-white">{t.nav.settings}</p>
                    </div>

                    <div className="p-2 space-y-1">
                        <Link
                            href="/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
                        >
                            <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="font-bold text-sm tracking-tight">{t.userMenu.profile}</span>
                        </Link>

                        <div className="px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-gray-400">
                                <Languages className="w-5 h-5" />
                                <span className="font-bold text-sm tracking-tight">{t.userMenu.language}</span>
                            </div>
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
                        </div>

                        <div className="pt-2 mt-2 border-t border-white/5">
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-all duration-300 font-bold text-sm tracking-tight group disabled:opacity-50"
                            >
                                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span>{isLoggingOut ? '...' : t.userMenu.logout}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
