'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Sparkles, Loader2, Save, Move, Type } from 'lucide-react';
import { analyzeImageForPlacementAction } from '@/app/actions/imageActions';
import Image from 'next/image';

interface EditorStyle {
    x?: number;
    y?: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    opacity?: number;
    lineHeight?: number;
    shadowIntensity?: number;
    text?: string;
    containerWidth?: number;
}

interface SmartTextEditorProps {
    imageUrl: string;
    initialText?: string;
    initialStyle?: EditorStyle;
    onSave: (text: string, style: EditorStyle) => void;
}

const FONTS = [
    'Inter', 'Montserrat', 'Playfair Display', 'Bebas Neue', 'Outfit', 'Roboto', 'Oswald', 'Permanent Marker'
];

export function SmartTextEditor({ imageUrl, initialText = '', initialStyle = {}, onSave }: SmartTextEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Position state in percentage
    const [text, setText] = useState(initialStyle.text || initialText || 'MENSAGE IMPACTANTE');
    const [style, setStyle] = useState({
        x: initialStyle.x !== undefined ? initialStyle.x : 50,
        y: initialStyle.y !== undefined ? initialStyle.y : 40,
        fontSize: initialStyle.fontSize || 120,
        fontFamily: initialStyle.fontFamily || 'Bebas Neue',
        color: initialStyle.color || '#ffffff',
        opacity: initialStyle.opacity !== undefined ? initialStyle.opacity : 1,
        lineHeight: initialStyle.lineHeight || 1.1,
        shadowIntensity: initialStyle.shadowIntensity !== undefined ? initialStyle.shadowIntensity : 0.8
    });

    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleSmartPlacement = async () => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeImageForPlacementAction(imageUrl);
            if (result.success && result.analysis) {
                const { x, y, suggestedColor } = result.analysis;
                setStyle(prev => ({
                    ...prev,
                    x,
                    y,
                    color: suggestedColor === 'white' ? '#ffffff' : '#000000'
                }));
            }
        } catch (err) {
            console.error("Smart Placement Error:", err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();

        // Convert pixel offset to percentage
        const dxPer = (info.offset.x / rect.width) * 100;
        const dyPer = (info.offset.y / rect.height) * 100;

        setStyle(prev => ({
            ...prev,
            x: Math.max(0, Math.min(100, prev.x + dxPer)),
            y: Math.max(0, Math.min(100, prev.y + dyPer))
        }));
    };

    // --- AUTO SYNC ---
    // Keep reference to onSave to avoid dependency loops
    const onSaveRef = useRef(onSave);
    useEffect(() => { onSaveRef.current = onSave; }, [onSave]);

    // Auto-propagate changes to parent after delay
    useEffect(() => {
        const timer = setTimeout(() => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                onSaveRef.current(text, { ...style, containerWidth: rect.width });
            } else {
                onSaveRef.current(text, style);
            }
        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [text, style]);
    // -----------------

    return (
        <div className="flex flex-col gap-6 bg-secondary/10 p-4 rounded-3xl border border-white/5">
            {/* Canvas Area - Always top */}
            <div
                ref={containerRef}
                className="relative aspect-square w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 group"
            >
                <div className="absolute inset-0">
                    <Image
                        src={imageUrl}
                        alt="Background"
                        fill
                        draggable={false}
                        className="object-contain select-none pointer-events-none"
                    />
                </div>

                {/* Text Layer */}
                <motion.div
                    drag
                    dragMomentum={false}
                    dragElastic={0}
                    onDragEnd={handleDragEnd}
                    key={`overlay-${style.x}-${style.y}-${style.fontSize}-${style.color}-${style.fontFamily}`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99, cursor: 'grabbing' }}
                    style={{
                        position: 'absolute',
                        left: `${style.x}%`,
                        top: `${style.y}%`,
                        color: style.color,
                        fontSize: `${style.fontSize}px`,
                        fontFamily: style.fontFamily,
                        fontWeight: 900,
                        lineHeight: style.lineHeight,
                        opacity: style.opacity,
                        textShadow: `0 4px ${20 * style.shadowIntensity}px rgba(0,0,0,${style.shadowIntensity})`,
                        zIndex: 50,
                        cursor: 'grab',
                        whiteSpace: 'pre-wrap',
                        padding: '12px',
                        textAlign: 'center',
                        transform: 'translate(-50%, -50%)', // Center based on x,y
                        width: '90%'
                    }}
                >
                    {text}
                </motion.div>

                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex flex-col items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest flex items-center gap-2">
                        <Move className="w-3 h-3" /> Arrastra para posicionar
                    </p>
                </div>
            </div>

            {/* Controls Area - Always below */}
            <div className="space-y-6">
                {/* Text Editing */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Type className="w-4 h-4 text-primary" />
                        <span className="text-[11px] font-black text-white uppercase tracking-widest">Ajustes de Título</span>
                    </div>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Escribe el título aquí..."
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none h-20 text-sm"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Tipografía</label>
                            <select
                                value={style.fontFamily}
                                onChange={(e) => setStyle({ ...style, fontFamily: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-primary/50 cursor-pointer"
                            >
                                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Color</label>
                            <div className="flex gap-2">
                                <button onClick={() => setStyle({ ...style, color: '#ffffff' })} className="w-8 h-8 rounded-lg border border-white/10 bg-white" />
                                <button onClick={() => setStyle({ ...style, color: '#000000' })} className="w-8 h-8 rounded-lg border border-white/10 bg-black" />
                                <input
                                    type="color"
                                    value={style.color}
                                    onChange={(e) => setStyle({ ...style, color: e.target.value })}
                                    className="w-8 h-8 rounded-lg bg-transparent p-0 border-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Sliders */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span>Tamaño</span>
                            <span className="text-primary">{style.fontSize}px</span>
                        </div>
                        <input
                            type="range" min="20" max="200" step="1"
                            value={style.fontSize}
                            onChange={(e) => setStyle({ ...style, fontSize: parseInt(e.target.value) })}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span>Sombra</span>
                            <span className="text-primary">{Math.round(style.shadowIntensity * 100)}%</span>
                        </div>
                        <input
                            type="range" min="0" max="1" step="0.1"
                            value={style.shadowIntensity}
                            onChange={(e) => setStyle({ ...style, shadowIntensity: parseFloat(e.target.value) })}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span>Opacidad</span>
                            <span className="text-primary">{Math.round(style.opacity * 100)}%</span>
                        </div>
                        <input
                            type="range" min="0.1" max="1" step="0.1"
                            value={style.opacity}
                            onChange={(e) => setStyle({ ...style, opacity: parseFloat(e.target.value) })}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span>Interlineado</span>
                            <span className="text-primary">{style.lineHeight}</span>
                        </div>
                        <input
                            type="range" min="0.8" max="2" step="0.1"
                            value={style.lineHeight}
                            onChange={(e) => setStyle({ ...style, lineHeight: parseFloat(e.target.value) })}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    <button
                        onClick={handleSmartPlacement}
                        disabled={isAnalyzing}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
                    >
                        {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-yellow-400 group-hover:scale-125 transition-transform" />}
                        Sugerir Diseño Inteligente
                    </button>

                    <button
                        onClick={() => {
                            if (containerRef.current) {
                                const rect = containerRef.current.getBoundingClientRect();
                                onSave(text, { ...style, containerWidth: rect.width });
                            } else {
                                onSave(text, style);
                            }
                        }}
                        className="w-full py-4 bg-primary/20 hover:bg-primary/30 border border-primary/20 rounded-2xl text-[10px] font-black text-primary uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Save className="w-4 h-4" />
                        ACTUALIZAR VISTA PREVIA
                    </button>
                </div>
            </div>
        </div>
    );
}
