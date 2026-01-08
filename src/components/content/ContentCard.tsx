'use client'

import React, { useState } from 'react'
import { MoreHorizontal, Edit, Trash2, Download, ExternalLink, Calendar, CheckCircle2, Clock, AlertCircle, Send, Loader2 } from 'lucide-react'
import { Database } from '@/types/database.types'
import { format } from 'date-fns'
import { useLanguage } from '@/context/LanguageContext'

type ContentItem = Database['public']['Tables']['content_queue']['Row']

interface ContentCardProps {
    item: ContentItem
    onEdit: (item: ContentItem) => void
    onStatusUpdate: (id: string, status: ContentItem['status']) => void
    onPublish: (id: string) => void
}

export function ContentCard({ item, onEdit, onStatusUpdate, onPublish }: ContentCardProps) {
    const { t } = useLanguage()
    const [showMenu, setShowMenu] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)

    const statusColors = {
        Draft: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        AI_Generated: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        Approved: 'bg-green-500/10 text-green-400 border-green-500/20',
        Published: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        Review_Required: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    }

    const handleDownload = async () => {
        // Use image_url (raw) if available, fallback to image_final_url (baked)
        // If we have overlay text, we MUST use raw to avoid baking twice.
        const rawUrl = item.image_url || item.image_final_url
        if (!rawUrl) return

        // If no text overlay, just download the image
        if (!(item as any).overlay_text_content) {
            try {
                const cacheBusterUrl = `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}v=${Date.now()}`
                const response = await fetch(cacheBusterUrl)
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `post_${item.id}.jpg`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            } catch (error) {
                console.error('Error downloading image:', error)
            }
            return
        }

        // If text exists, bake it client-side
        try {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.src = `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}v=${Date.now()}`

            await new Promise((resolve, reject) => {
                img.onload = resolve
                img.onerror = reject
            })

            // Set canvas to high res
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight

            // Draw Background
            ctx.drawImage(img, 0, 0)

            // Draw Overlay
            const overlayText = (item as any).overlay_text_content
            const style = (item as any).overlay_style_json || {}

            // FONT SCALING FIX
            // Reference: 54px for a 1024px width image.
            const scaleFactor = canvas.width / 1024
            let fontSize = (style.fontSize || 54) * scaleFactor
            fontSize = Math.round(fontSize)

            const fontFamily = style.fontFamily || 'Bebas Neue'
            const color = style.color || '#ffffff'
            const opacity = style.opacity ?? 1
            const shadowIntensity = style.shadowIntensity ?? 0.8

            ctx.globalAlpha = opacity
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top' // Match CSS "top" behavior

            // Text Shadow
            const shadowBlur = 8 * shadowIntensity * scaleFactor
            const shadowOffset = 4 * shadowIntensity * scaleFactor
            ctx.shadowColor = `rgba(0,0,0,${Math.min(0.9, shadowIntensity)})`
            ctx.shadowBlur = shadowBlur
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = shadowOffset

            // Font Construction
            ctx.font = `900 ${fontSize}px "${fontFamily}", sans-serif`
            ctx.fillStyle = color

            // Position (percentage based)
            // style.y defaults to 10 to match preview's top fallback
            const x = (style.x || 50) / 100 * canvas.width
            const y = (style.y || 10) / 100 * canvas.height

            // Multiline Support
            const lines = overlayText.split('\n')
            const lineHeight = fontSize * (style.lineHeight || 1.1)

            // startY is exactly y since we set textBaseline to 'top'
            const startY = y

            lines.forEach((line: string, i: number) => {
                ctx.fillText(line.toUpperCase(), x, startY + (i * lineHeight))
            })

            // Download
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
            const a = document.createElement('a')
            a.href = dataUrl
            a.download = `weaved_post_${item.id}.jpg`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)

        } catch (error) {
            console.error('Error baking image client-side:', error)
            alert('Error prepping download. Trying raw image...')
            const a = document.createElement('a')
            a.href = rawUrl
            a.download = `raw_post_${item.id}.jpg`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        }
    }

    const output = item.gemini_output as any

    return (
        <div className="group relative bg-secondary/30 border border-white/5 rounded-3xl overflow-hidden transition-all duration-500 hover:border-primary/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            {/* Image Preview */}
            <div className="aspect-square relative overflow-hidden bg-black/40">
                {item.image_final_url || item.image_url ? (
                    <>
                        <img
                            src={item.image_final_url || item.image_url || ''}
                            alt="Post Preview"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Persistent Overlay Preview */}
                        {(item as any).overlay_text_content && (
                            <div
                                className="absolute pointer-events-none select-none px-4 py-2"
                                style={{
                                    top: `${(item as any).overlay_style_json?.y || 10}%`,
                                    color: (item as any).overlay_style_json?.color || '#ffffff',
                                    fontSize: `${((item as any).overlay_style_json?.fontSize || 54) / 4}px`,
                                    fontFamily: (item as any).overlay_style_json?.fontFamily || 'Bebas Neue',
                                    whiteSpace: 'pre-wrap',
                                    fontWeight: 900,
                                    lineHeight: 1.1,
                                    textShadow: (item as any).overlay_style_json?.shadow || '0 2px 8px rgba(0,0,0,0.8)',
                                    textAlign: 'center',
                                    width: '100%',
                                    left: 0
                                }}
                            >
                                {(item as any).overlay_text_content}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-8 text-center bg-black/60">
                        <Clock className="w-8 h-8 text-white/10 animate-pulse" />
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Generando Visual...</p>
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[item.status]}`}>
                        {item.status.replace('_', ' ')}
                    </span>
                    <div className="flex gap-1">
                        {(item as any).social_platform && (
                            <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter bg-black/60 text-white/80 border border-white/10 backdrop-blur-sm">
                                {(item as any).social_platform}
                            </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter bg-primary/20 text-primary border border-primary/20 backdrop-blur-sm">
                            {(t.campaigns as any)[item.content_type.toLowerCase()] || item.content_type}
                        </span>
                    </div>
                </div>

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                    <button
                        onClick={() => onEdit(item)}
                        className="p-4 bg-white/10 hover:bg-primary transition-all rounded-2xl border border-white/10 hover:border-primary group/btn active:scale-95"
                    >
                        <Edit className="w-5 h-5 text-white group-hover/btn:scale-110 transition-transform" />
                    </button>
                    {(item.image_final_url || item.image_url) && (
                        <button
                            onClick={handleDownload}
                            className="p-4 bg-white/10 hover:bg-green-500 transition-all rounded-2xl border border-white/10 hover:border-green-500 group/btn active:scale-95"
                        >
                            <Download className="w-5 h-5 text-white group-hover/btn:scale-110 transition-transform" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-4 bg-gradient-to-b from-transparent to-black/20">
                <div className="space-y-1">
                    <h4 className="text-white font-black text-sm line-clamp-1 uppercase tracking-tight">
                        {output?.headline || 'Untitled Post'}
                    </h4>
                    <div className="text-gray-400 text-xs leading-relaxed whitespace-pre-wrap line-clamp-[8] overflow-y-auto max-h-32 custom-scrollbar">
                        {output?.body_copy?.split(/(\*\*.*?\*\*)/).map((part: string, i: number) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={i} className="text-gray-200 font-black">{part.slice(2, -2)}</strong>
                            }
                            return part
                        })}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(item.created_at), 'MMM dd')}
                    </div>

                    <div className="flex gap-1.5">
                        {item.status !== 'Approved' && (
                            <button
                                onClick={() => onStatusUpdate(item.id, 'Approved')}
                                className="p-2 hover:bg-green-500/10 rounded-lg transition-colors group/status"
                                title="Approve Content"
                            >
                                <CheckCircle2 className="w-4 h-4 text-gray-500 group-hover/status:text-green-400" />
                            </button>
                        )}
                        {item.status === 'Approved' && (
                            <button
                                onClick={async () => {
                                    setIsPublishing(true)
                                    await onPublish(item.id)
                                    setIsPublishing(false)
                                }}
                                disabled={isPublishing}
                                className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors group/publish"
                                title="Publish to Socials"
                            >
                                {isPublishing ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> : <Send className="w-4 h-4 text-gray-500 group-hover/publish:text-blue-400" />}
                            </button>
                        )}
                        <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group/delete">
                            <Trash2 className="w-4 h-4 text-gray-500 group-hover/delete:text-red-400" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
