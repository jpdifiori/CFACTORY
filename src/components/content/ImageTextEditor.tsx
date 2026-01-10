'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Type as TypeIcon } from 'lucide-react'

interface ImageTextEditorProps {
    imageUrl: string
    initialText: string
    initialStyle?: any
    onUpdate: (text: string, style: any) => void
}

const FONTS = [
    { name: 'Bebas Neue', value: 'Bebas Neue' },
    { name: 'Montserrat Bold', value: 'Montserrat' },
    { name: 'Outfit Black', value: 'Outfit' },
    { name: 'System Sans', value: 'sans-serif' }
]

const COLORS = [
    '#ffffff', '#000000', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'
]

export function ImageTextEditor({ imageUrl, initialText, initialStyle, onUpdate }: ImageTextEditorProps) {
    const [text, setText] = useState(initialText || '')

    // Position state in percentages (0-100)
    const [style, setStyle] = useState({
        x: 50,
        y: 10,
        fontSize: 54,
        fontFamily: 'Bebas Neue',
        color: '#ffffff',
        opacity: 1,
        shadowIntensity: 0.8,
        ...initialStyle
    })

    const containerRef = useRef<HTMLDivElement>(null)

    const updateStyle = (patch: any) => {
        const rect = containerRef.current?.getBoundingClientRect()
        const newStyle = {
            ...style,
            ...patch,
            containerWidth: rect?.width || style.containerWidth
        }
        setStyle(newStyle)
        onUpdate(text, newStyle)
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value
        setText(newText)
        onUpdate(newText, style)
    }

    const handleDragEnd = (_: any, info: any) => {
        if (!containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()

        // Calculate the delta in percentages relative to the container size
        const deltaXPercent = (info.offset.x / rect.width) * 100
        const deltaYPercent = (info.offset.y / rect.height) * 100

        // New position = Old position + Delta
        const newX = Math.max(0, Math.min(100, style.x + deltaXPercent))
        const newY = Math.max(0, Math.min(100, style.y + deltaYPercent))

        updateStyle({ x: newX, y: newY })
    }

    useEffect(() => {
        if (initialText !== undefined) setText(initialText)
        if (initialStyle) setStyle((prev: any) => ({ ...prev, ...initialStyle }))
    }, [initialText, initialStyle])

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* CANVAS AREA */}
            <div
                ref={containerRef}
                className="flex-1 relative aspect-square bg-black rounded-[2rem] overflow-hidden border border-white/10 group shadow-2xl bg-[url('/grid.svg')]"
            >
                <img
                    src={imageUrl}
                    alt="Background"
                    className="w-full h-full object-cover select-none pointer-events-none"
                />

                {/* Draggable Layer */}
                <div className="absolute inset-0 z-[100] pointer-events-none">
                    <motion.div
                        key={`${style.x}-${style.y}`} // Force reset of internal drag offset on sync
                        drag
                        dragMomentum={false}
                        dragElastic={0}
                        dragConstraints={containerRef}
                        onDragEnd={handleDragEnd}
                        style={{
                            position: 'absolute',
                            left: `${style.x}%`,
                            top: `${style.y}%`,
                            x: 0,
                            y: 0,
                            zIndex: 200,
                            pointerEvents: 'auto',
                            cursor: 'grab',
                            width: 'max-content',
                            maxWidth: '90%'
                        }}
                        className="active:cursor-grabbing"
                    >
                        {/* Visual Element with Centering Transform - Separated to avoid drag conflicts */}
                        <div
                            style={{
                                transform: 'translate(-50%, -50%)',
                                color: style.color || '#ffffff',
                                fontSize: `${(style.fontSize || 54) / 4}px`,
                                fontFamily: `"${style.fontFamily || 'Bebas Neue'}", sans-serif`,
                                fontWeight: 900,
                                textAlign: 'center',
                                lineHeight: 1.1,
                                opacity: style.opacity ?? 1,
                                textShadow: `0 ${4 * style.shadowIntensity}px ${8 * style.shadowIntensity}px rgba(0,0,0,${Math.min(0.9, style.shadowIntensity)})`,
                                whiteSpace: 'pre-wrap',
                                padding: '1rem',
                                border: '1px solid transparent',
                                borderRadius: '0.75rem',
                                transition: 'border-color 0.2s'
                            }}
                            className="hover:border-white/20 select-none group/text relative"
                        >
                            {text || ''}

                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary px-2 py-0.5 rounded text-[8px] font-black text-black opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter whitespace-nowrap">
                                Drag to Move
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* CONTROLS AREA */}
            <div className="w-full lg:w-80 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                <div className="space-y-4 bg-white/5 border border-white/5 rounded-3xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <TypeIcon className="w-4 h-4 text-primary" />
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Personalizar Texto</h4>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">Contenido</label>
                        <textarea
                            value={text}
                            onChange={handleTextChange}
                            className="w-full h-24 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-primary/50 transition-all resize-none leading-relaxed"
                            placeholder="Type overlay text..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">Tipografía</label>
                        <div className="grid grid-cols-2 gap-2">
                            {FONTS.map(f => (
                                <button
                                    key={f.value}
                                    onClick={() => updateStyle({ fontFamily: f.value })}
                                    style={{ fontFamily: f.value }}
                                    className={`py-2 px-3 rounded-lg border text-[10px] transition-all ${style.fontFamily === f.value ? 'bg-primary text-black border-primary' : 'bg-black/20 text-gray-400 border-white/10 hover:border-white/20'}`}
                                >
                                    {f.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Tamaño</label>
                            <span className="text-[9px] font-mono text-primary">{style.fontSize}px</span>
                        </div>
                        <input
                            type="range"
                            min="20"
                            max="120"
                            value={style.fontSize}
                            onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) })}
                            className="w-full accent-primary bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest pl-1">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => updateStyle({ color: c })}
                                    className={`w-6 h-6 rounded-full border-2 transition-all ${style.color === c ? 'border-primary scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Opacidad</label>
                            <span className="text-[9px] font-mono text-primary">{Math.round(style.opacity * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={style.opacity * 100}
                            onChange={(e) => updateStyle({ opacity: parseInt(e.target.value) / 100 })}
                            className="w-full accent-primary bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Sombra</label>
                            <span className="text-[9px] font-mono text-primary">{Math.round(style.shadowIntensity * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={style.shadowIntensity * 100}
                            onChange={(e) => updateStyle({ shadowIntensity: parseInt(e.target.value) / 100 })}
                            className="w-full accent-primary bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                    <p className="text-[9px] text-primary/70 font-bold uppercase tracking-widest leading-relaxed">
                        Tip: Arrastra el texto en la imagen para posicionarlo donde mejor luzca.
                    </p>
                </div>
            </div>
        </div>
    )
}
