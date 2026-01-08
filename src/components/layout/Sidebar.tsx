'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Layers, Settings, Plus, Hexagon, Menu, X, LogOut, Sparkles, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/actions/auth'

import { createClient } from '@/utils/supabase/client'

import { useSidebar } from '@/context/SidebarContext'

import { useLanguage } from '@/context/LanguageContext'

export function Sidebar() {
    const pathname = usePathname()
    const supabase = createClient()
    const { isOpen, setIsOpen } = useSidebar()
    const { lang, setLang, t } = useLanguage()
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [projects, setProjects] = useState<any[]>([])
    const [usage, setUsage] = useState({ used: 0, limit: 100000 })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch Projects
        const { data: projData } = await supabase
            .from('project_master')
            .select('id, app_name')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)

        if (projData) setProjects(projData)

        // Fetch Usage
        const { data: profile } = await (supabase
            .from('profiles')
            .select('total_tokens_used, token_limit')
            .eq('id', user.id)
            .single() as any)

        if (profile) {
            setUsage({
                used: Number((profile as any).total_tokens_used || 0),
                limit: Number((profile as any).token_limit || 100000)
            })
        }
    }

    const handleLogout = async () => {
        setIsLoggingOut(true)
        await logoutAction()
    }

    const links = [
        { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
        { href: '/hub', label: t.nav.social_hub, icon: Zap },
        { href: '/projects', label: t.nav.projects, icon: Layers },
        { href: '/premium-forge', label: t.nav.premium_forge, icon: Sparkles },
        { href: '/settings', label: t.nav.settings, icon: Settings },
    ]



    const renderNavContent = () => (
        <>
            {/* Logo */}
            <div className="flex items-center gap-2 font-black text-2xl px-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                    C
                </div>
                <span className="tracking-tighter uppercase">Factory</span>
            </div>

            {/* Main Nav */}
            <div className="space-y-1">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-3 mb-3">{t.sidebar.platform}</h3>
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
                            pathname === link.href
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <link.icon className={cn("w-5 h-5", pathname === link.href ? "text-white" : "group-hover:scale-110 transition-transform")} />
                        <span className="font-bold text-sm tracking-tight">{link.label}</span>
                    </Link>
                ))}
            </div>

            {/* Apps Section */}
            <div className="space-y-1">
                <div className="flex items-center justify-between px-3 mb-3">
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t.sidebar.active_apps}</h3>
                    <Link href="/projects/new">
                        <button className="p-1 hover:bg-white/5 rounded-lg text-blue-400 transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                    </Link>
                </div>

                <div className="space-y-1">
                    {projects.map(p => (
                        <Link
                            key={p.id}
                            href={`/projects/${p.id}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:text-white hover:bg-white/5 transition-all group"
                        >
                            <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                            {p.app_name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Token Usage & Footer Section */}
            <div className="mt-auto pt-6 space-y-4">
                <div className="glass-card rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">{t.sidebar.tokens_used}</span>
                            <span className="text-[10px] font-bold text-gray-400 block">{usage.used.toLocaleString()} / {usage.limit.toLocaleString()}</span>
                        </div>
                        <span className="text-xs font-bold text-blue-400">
                            {Math.min(100, Math.round((usage.used / (usage.limit || 1)) * 100))}%
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000"
                            style={{ width: `${Math.min(100, (usage.used / (usage.limit || 1)) * 100)}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                    <button
                        onClick={() => setLang('es')}
                        className={cn(
                            "flex-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                            lang === 'es' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                        )}
                    > ES </button>
                    <button
                        onClick={() => setLang('en')}
                        className={cn(
                            "flex-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                            lang === 'en' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                        )}
                    > EN </button>
                </div>

                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:text-red-400 font-bold text-sm tracking-tight transition-colors group disabled:opacity-50"
                >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>{isLoggingOut ? t.sidebar.logging_out : t.sidebar.logout}</span>
                </button>
            </div>
        </>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={cn(
                "fixed top-0 bottom-0 left-0 z-[70] w-72 bg-[#0a0a0a] border-r border-white/5 p-6 flex flex-col gap-8 transition-transform duration-500 ease-spring lg:translate-x-0 hidden lg:flex"
            )}>
                {renderNavContent()}
            </aside>

            {/* Mobile Sidebar */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[65] lg:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                    <aside className="fixed top-0 bottom-0 left-0 z-[70] w-72 bg-[#0a0a0a] border-r border-white/5 p-6 flex flex-col gap-8 lg:hidden animate-in slide-in-from-left duration-300">
                        {renderNavContent()}
                    </aside>
                </>
            )}
        </>
    )
}
