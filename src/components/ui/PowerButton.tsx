'use client'

import React, { useState } from 'react'
import { Zap, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PowerButtonProps {
    onGenerate: () => Promise<void>
}

export function PowerButton({ onGenerate }: PowerButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleClick = async () => {
        setLoading(true)
        try {
            await onGenerate()
        } catch (e) {
            console.error(e)
        } finally {
            // Keep loading slightly longer for effect
            setTimeout(() => setLoading(false), 1000)
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={cn(
                "group relative inline-flex items-center gap-3 px-6 py-3 rounded-full font-bold text-white transition-all duration-300",
                loading
                    ? "bg-gray-800 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:scale-105 hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]"
            )}
        >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
                <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300 transition-transform group-hover:rotate-12" />
            )}

            <span className="tracking-wide">
                {loading ? 'GENERATING STRATEGY...' : 'GENERATE MONTH'}
            </span>

            {/* Glow Effect */}
            {!loading && (
                <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 animate-pulse" />
            )}
        </button>
    )
}
