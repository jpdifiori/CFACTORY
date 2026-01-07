'use client'

import React from 'react'
import { UserMenu } from './UserMenu'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import { Menu } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export function Header() {
    const pathname = usePathname()
    const { toggle } = useSidebar()
    const { t } = useLanguage()

    // Simple breadcrumb logic
    const pathParts = pathname.split('/').filter(p => p)
    const lastPart = pathParts[pathParts.length - 1]

    const getPageName = () => {
        if (!lastPart || lastPart === 'dashboard') return t.nav.dashboard
        if (lastPart === 'projects') return t.nav.projects
        if (lastPart === 'settings') return t.nav.settings
        return lastPart.replace(/-/g, ' ')
    }

    return (
        <header className="fixed top-0 right-0 left-0 lg:left-72 z-[999] px-4 md:px-8 py-4 lg:py-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between glass px-6 py-4 rounded-[2rem] border-white/5 shadow-2xl backdrop-blur-2xl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggle}
                        className="lg:hidden p-2 hover:bg-white/5 rounded-xl text-gray-400 transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">{t.dashboard.title}</h2>
                        <p className="text-sm font-bold text-white capitalize">{getPageName()}</p>
                    </div>
                </div>

                <UserMenu />
            </div>
        </header>
    )
}
