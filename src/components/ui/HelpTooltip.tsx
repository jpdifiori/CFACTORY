import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { HelpCircle, X, Lightbulb } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface HelpContent {
    description: string
    examples: string
}

interface HelpTooltipProps {
    text: HelpContent
}

export function HelpTooltip({ text }: HelpTooltipProps) {
    const [isOpen, setIsOpen] = useState(false)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const [coords, setCoords] = useState({ top: 0, left: 0 })

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            setCoords({
                top: rect.top + window.scrollY,
                left: rect.left + rect.width / 2
            })
        }
    }, [isOpen])

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && !triggerRef.current?.contains(event.target as Node)) {
                // Since it's a portal, we also need to check if the click was inside the portal content
                const portalContent = document.getElementById('help-portal-content')
                if (portalContent && !portalContent.contains(event.target as Node)) {
                    setIsOpen(false)
                }
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    return (
        <div className="inline-block ml-2 align-middle">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`p-0.5 rounded-full transition-all duration-300 ${isOpen ? 'bg-blue-500/20 text-blue-400 scale-110' : 'text-gray-500 hover:text-blue-400'
                    }`}
            >
                <HelpCircle className="w-4 h-4 cursor-pointer" />
            </button>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    <motion.div
                        id="help-portal-content"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        style={{
                            position: 'absolute',
                            top: coords.top - 15, // Adjusted to be above the icon
                            left: coords.left,
                            transform: 'translate(-50%, -100%)',
                            zIndex: 9999
                        }}
                        className="w-[320px] md:w-[400px] bg-[#0a0c10] border border-blue-500/30 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden"
                    >
                        <div className="p-6 space-y-5">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-xl">
                                        <HelpCircle className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Centro de Ayuda</span>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-200 leading-relaxed">
                                        {text.description}
                                    </p>
                                </div>

                                <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-4 space-y-2.5">
                                    <div className="flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4 text-blue-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400/90">Ejemplos Recomendados</span>
                                    </div>
                                    <p className="text-[12px] text-gray-400 italic leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                                        "{text.examples}"
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Connecting Arrow */}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0a0c10] border-r border-b border-blue-500/30 rotate-45" />
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </div>
    )
}
