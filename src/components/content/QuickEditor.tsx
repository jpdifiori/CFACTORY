
import React, { useState, useEffect } from 'react'
import { X, Save, RefreshCw, Sparkles, Loader2, FileText, ImageIcon, Type } from 'lucide-react'
import { Database } from '@/types/database.types'
import { createClient } from '@/utils/supabase/client'
import { ImageTextEditor } from './ImageTextEditor'

type ContentItem = Database['public']['Tables']['content_queue']['Row']

interface QuickEditorProps {
    isOpen: boolean
    onClose: () => void
    onSave: (id: string, newContent: any, imagePrompt?: string, triggerGen?: boolean, overlayText?: string, overlayStyle?: any, imageFinalUrl?: string, skipText?: boolean, targetSize?: string) => void
    item: ContentItem | null
}

export function QuickEditor({ isOpen, onClose, onSave, item }: QuickEditorProps) {
    const [headline, setHeadline] = useState('')
    const [body, setBody] = useState('')
    const [hashtags, setHashtags] = useState('')
    const [imagePrompt, setImagePrompt] = useState('')
    const [isGeneratingImage, setIsGeneratingImage] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [aspectRatio, setAspectRatio] = useState('square_hd')

    // Overlay States
    const [overlayText, setOverlayText] = useState('')
    const [overlayStyle, setOverlayStyle] = useState<any>(null)
    const [showTextEditor, setShowTextEditor] = useState(false)

    const supabase = createClient()

    const [prevItemId, setPrevItemId] = useState<string | null>(null)

    useEffect(() => {
        if (item && item.id !== prevItemId) {
            const output = item.gemini_output as any
            setHeadline(output?.headline || '')
            setBody(output?.body_copy || '')
            setHashtags(output?.hashtags?.join(' ') || '')
            setImagePrompt(item.image_ai_prompt || '')
            setOverlayText((item as any).overlay_text_content || '')
            setOverlayStyle((item as any).overlay_style_json || null)
            setPrevItemId(item.id)
        }
    }, [item, prevItemId])

    if (!isOpen || !item) return null

    // Determine the best image URL to show in the editor
    const displayImageUrl = (item as any).image_url || (item as any).image_final_url

    const handleSave = async (shouldClose = true) => {
        setIsSaving(true)
        try {
            const newContent = {
                ...(item.gemini_output as any),
                headline,
                body_copy: body,
                hashtags: hashtags.split(' ').filter(h => h.trim().startsWith('#')),
            }

            // FORCE SKIP TEXT + ASPECT RATIO
            // We pass undefined for text/style and true for skipText
            // Pass overlay text and style
            await onSave(
                item.id,
                newContent,
                imagePrompt,
                false,
                overlayText,
                overlayStyle,
                item.image_final_url || undefined,
                false, // Set skipText to false because we WANT to bake if text is present
                aspectRatio
            )

            if (shouldClose) onClose()
        } catch (error) {
            console.error("Error in handleSave:", error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleRegenerateImage = async () => {
        if (!item) return
        setIsGeneratingImage(true)
        try {
            const newContent = { ...(item.gemini_output as any) }
            // FORCE SKIP TEXT + ASPECT RATIO
            await onSave(
                item.id,
                newContent,
                imagePrompt,
                true,
                undefined,
                undefined,
                undefined,
                true,
                aspectRatio
            )
        } finally {
            setIsGeneratingImage(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 md:p-8">
            <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-4xl max-h-[85vh] rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col">

                {/* Header */}
                <div className="flex-none flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-2 md:p-3 bg-primary/20 rounded-xl md:rounded-2xl">
                            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-black text-lg md:text-xl text-white uppercase tracking-tighter">Editor de Contenido</h3>
                            <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">IA Design Suite</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 md:p-4 hover:bg-white/5 rounded-xl md:rounded-2xl transition-all border border-white/5 text-gray-400 hover:text-white">
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                    <div className="flex flex-col gap-4">

                        {/* SECTION 1: VISUAL EDITOR (Now at the top) */}
                        <div className="space-y-6 pt-2 pb-6 border-b border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ImageIcon className="w-5 h-5 text-yellow-500" />
                                    <h4 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Imagen y Texto Overlay</h4>
                                </div>
                            </div>

                            <div className="flex flex-col gap-8 md:gap-10">
                                {/* IMAGE PREVIEW */}
                                <div className="w-full">
                                    {displayImageUrl ? (
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary/20 rounded-lg">
                                                        <Type className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Editor de Texto Overlay</h5>
                                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Posiciona el texto donde desees</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setShowTextEditor(!showTextEditor)}
                                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${showTextEditor ? 'bg-primary text-black' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
                                                >
                                                    {showTextEditor ? 'Ver Imagen Original' : 'Abrir Editor de Texto'}
                                                </button>
                                            </div>

                                            {showTextEditor ? (
                                                <ImageTextEditor
                                                    imageUrl={displayImageUrl}
                                                    initialText={overlayText}
                                                    initialStyle={overlayStyle}
                                                    onUpdate={(txt, stl) => {
                                                        setOverlayText(txt)
                                                        setOverlayStyle(stl)
                                                    }}
                                                />
                                            ) : (
                                                <div className="aspect-square w-full bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 relative group bg-[url('/grid.svg')]">
                                                    <img
                                                        src={displayImageUrl}
                                                        alt="Background"
                                                        className="w-full h-full object-contain select-none"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-white/5 aspect-square rounded-[3rem] flex flex-col items-center justify-center border-2 border-dashed border-white/5 p-20 text-center space-y-6">
                                            <div className="relative">
                                                <Loader2 className="w-12 h-12 text-primary/40 animate-spin" />
                                                <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm text-white/60 font-black uppercase tracking-widest text-primary">Cargando Visual...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* CONTROLS AREA (Regen & Aspect Ratio) */}
                                <div className="w-full">
                                    <div className="p-6 bg-white/5 border border-white/5 rounded-3xl flex flex-col sm:flex-row gap-6 items-end">
                                        <div className="flex-1 space-y-3 w-full">
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Instrucciones Visuales</label>
                                            <textarea
                                                value={imagePrompt}
                                                onChange={(e) => setImagePrompt(e.target.value)}
                                                className="w-full h-20 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-gray-300 font-mono text-[10px] outline-none focus:border-primary/50 transition-all resize-none leading-relaxed"
                                            />
                                        </div>

                                        <div className="flex-shrink-0 flex gap-4 w-full sm:w-auto">
                                            <div className="grid grid-cols-3 gap-2 flex-grow sm:flex-grow-0">
                                                {[
                                                    { label: '1:1', value: 'square_hd' },
                                                    { label: '9:16', value: 'portrait_16_9' },
                                                    { label: '16:9', value: 'landscape_16_9' }
                                                ].map((ratio) => (
                                                    <button
                                                        key={ratio.value}
                                                        onClick={() => setAspectRatio(ratio.value)}
                                                        className={`px-3 py-2 rounded-lg border text-[9px] font-black transition-all ${aspectRatio === ratio.value ? 'bg-primary text-black border-primary' : 'bg-black/40 text-gray-500 border-white/10'}`}
                                                    >
                                                        {ratio.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => handleRegenerateImage()}
                                                disabled={isGeneratingImage || isSaving}
                                                className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-widest border border-white/10 flex items-center justify-center gap-2"
                                            >
                                                <RefreshCw className={`w-3 h-3 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                                                Regenerar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: TEXT CONTENT (Now at the bottom) */}
                        <div className="space-y-8 pt-6">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-primary" />
                                    <h4 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Copia del Post</h4>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="group">
                                        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Titular</label>
                                        <input
                                            type="text"
                                            value={headline}
                                            onChange={(e) => setHeadline(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-primary/50 transition-all text-xs"
                                        />
                                    </div>

                                    <div className="group">
                                        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Cuerpo del Mensaje</label>
                                        <textarea
                                            value={body}
                                            onChange={(e) => setBody(e.target.value)}
                                            className="w-full h-40 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-300 outline-none focus:border-primary/50 transition-all resize-none leading-relaxed text-[11px] custom-scrollbar"
                                        />
                                    </div>

                                    <div className="group">
                                        <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Hashtags</label>
                                        <input
                                            type="text"
                                            value={hashtags}
                                            onChange={(e) => setHashtags(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-primary font-mono text-xs outline-none focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex-none p-6 border-t border-white/5 bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className={`w-4 h-4 animate-spin ${isSaving ? 'opacity-100' : 'opacity-0'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{isSaving ? 'Guardando...' : 'Cambios sin guardar'}</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-8 py-3 rounded-xl border border-white/10 text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all outline-none"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={isSaving || isGeneratingImage}
                            className="flex-1 sm:flex-none px-10 py-3 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 outline-none"
                        >
                            <Save className="w-4 h-4" />
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>

    )
}
