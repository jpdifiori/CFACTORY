
import React, { useState, useEffect } from 'react'
import { X, Save, RefreshCw, Sparkles, Loader2, FileText, ImageIcon } from 'lucide-react'
import { Database } from '@/types/database.types'
import { createClient } from '@/utils/supabase/client'

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
    const supabase = createClient()

    const [prevItemId, setPrevItemId] = useState<string | null>(null)

    useEffect(() => {
        if (item && item.id !== prevItemId) {
            const output = item.gemini_output as any
            setHeadline(output?.headline || '')
            setBody(output?.body_copy || '')
            setHashtags(output?.hashtags?.join(' ') || '')
            setImagePrompt(item.image_ai_prompt || '')
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
            await onSave(
                item.id,
                newContent,
                imagePrompt,
                false,
                undefined,
                undefined,
                item.image_final_url || undefined, // Keep existing URL if just saving text
                true,
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

                        {/* SECTION 1: TEXT CONTENT (Full Width) */}
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-primary" />
                                    <h4 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Contenido del Post</h4>
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
                                            className="w-full h-48 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-300 outline-none focus:border-primary/50 transition-all resize-none leading-relaxed text-[11px] custom-scrollbar"
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

                        {/* SECTION 2: VISUAL EDITOR (Full Width) */}
                        <div className="space-y-6 pt-6 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ImageIcon className="w-5 h-5 text-yellow-500" />
                                    <h4 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Imagen Generada (Sin Texto)</h4>
                                </div>
                            </div>

                            <div className="flex flex-col gap-8 md:gap-10">
                                {/* IMAGE PREVIEW (Left on large, Top on small) */}
                                <div className="w-full">
                                    {displayImageUrl ? (
                                        <div className="aspect-square w-full bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 relative group bg-[url('/grid.svg')]">
                                            <img
                                                src={displayImageUrl}
                                                alt="Background"
                                                className="w-full h-full object-contain select-none"
                                            />
                                        </div>
                                    ) : (
                                        <div className="bg-white/5 aspect-square rounded-[3rem] flex flex-col items-center justify-center border-2 border-dashed border-white/5 p-20 text-center space-y-6">
                                            <div className="relative">
                                                <Loader2 className="w-12 h-12 text-primary/40 animate-spin" />
                                                <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm text-white/60 font-black uppercase tracking-widest text-primary">Cargando Visual...</p>
                                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                                                    Si la imagen no aparece en unos segundos, es posible que la IA aún la esté procesando.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* CONTROLS (Right on large, Bottom on small) */}
                                <div className="w-full flex flex-col gap-6">
                                    <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] flex flex-col gap-8 h-full">
                                        {/* Aspect Ratio Selector */}
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Formato de Salida</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { label: '1:1', sub: 'Post', value: 'square_hd' },
                                                    { label: '9:16', sub: 'Story', value: 'portrait_16_9' },
                                                    { label: '16:9', sub: 'Web', value: 'landscape_16_9' }
                                                ].map((ratio) => (
                                                    <button
                                                        key={ratio.value}
                                                        onClick={() => setAspectRatio(ratio.value)}
                                                        className={`py-4 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all ${aspectRatio === ratio.value
                                                            ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20'
                                                            : 'bg-black/40 text-gray-500 border-white/10 hover:border-white/20 hover:bg-white/5'
                                                            }`}
                                                    >
                                                        <span className="text-sm font-black tracking-tighter">{ratio.label}</span>
                                                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{ratio.sub}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Instrucciones Visuales</label>
                                            <textarea
                                                value={imagePrompt}
                                                onChange={(e) => setImagePrompt(e.target.value)}
                                                className="w-full h-full min-h-[60px] bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-gray-300 font-mono text-[10px] outline-none focus:border-primary/50 transition-all resize-none leading-relaxed"
                                                placeholder="Describe el estilo, la iluminación, el ambiente..."
                                            />
                                        </div>

                                        <button
                                            onClick={() => handleRegenerateImage()}
                                            disabled={isGeneratingImage || isSaving}
                                            className="w-full py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group border border-white/5 hover:border-white/20"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${isGeneratingImage ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                                            {isGeneratingImage ? 'Creando...' : 'Regenerar Variación'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}
