'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { updateChapterContentAction, generateChapterAction, updateProjectDesignAction } from '@/app/actions/premium_forge'
import { generateChapterBlueprintAction, generateBlockContentAction, updateBlockContentAction } from '@/app/actions/premium_blocks'
import { generateDesignOverridesAction } from '@/app/actions/design_actions'
import { BlockRenderer } from '@/components/premium-forge/BlockRenderer'
import {
    Loader2, CheckCircle2,
    Settings, Sparkles, ChevronLeft, Maximize2,
    Bold, Italic, Save, X, Edit3, Underline, List,
    ListOrdered,
    Layout, Smartphone, Monitor, FileText,
    Droplets, Type as FontIcon,
    Download,
    Palette, ChevronRight, Layers, BookOpen, Wand2
} from 'lucide-react'
import Link from 'next/link'
import { THEMES, applyTheme, ThemeOverrides } from '@/lib/ai/templates'
import { useLanguage } from '@/context/LanguageContext'

// Debounce hook for persistence
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(handler)
    }, [value, delay])
    return debouncedValue
}

const getDynamicStyles = (overrides: ThemeOverrides) => {
    const isFlow = overrides.layoutMode === 'Flow';

    return `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&family=Roboto:wght@300;400;700&family=Open+Sans:wght@300;400;700&family=JetBrains+Mono:wght@300;400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&family=Montserrat:wght@300;400;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&family=Oswald:wght@300;400;700&display=swap');

:root {
    --atomic-radius: ${isFlow ? '0px' : overrides.borderRadius + 'px'};
    --atomic-border-width: ${isFlow ? '0px' : overrides.borderWidth + 'px'};
    --atomic-border-color: ${isFlow ? 'transparent' : overrides.borderColor};
    --atomic-shadow: ${isFlow ? 'none' : (
            overrides.shadowDepth === 'none' ? 'none' :
                overrides.shadowDepth === 'soft' ? '0 10px 30px -10px rgba(0,0,0,0.1)' :
                    overrides.shadowDepth === 'medium' ? '0 20px 40px -12px rgba(0,0,0,0.15)' :
                        overrides.shadowDepth === 'hard' ? '0 30px 60px -15px rgba(0,0,0,0.25)' :
                            'inset 0 2px 4px 0 rgba(0,0,0,0.06)'
        )};
    --atomic-block-bg: ${isFlow ? 'transparent' : 'white'};
    --atomic-block-padding: ${isFlow ? '0px' : '3rem'};
    --atomic-accent: ${overrides.accentColor};
    --atomic-bg: ${overrides.backgroundColor};
    --atomic-text: ${overrides.textColor};
    --atomic-font-heading: ${overrides.headingFontFamily};
    --atomic-font-body: ${overrides.fontFamily};
    --atomic-spacing: ${overrides.paragraphSpacing}em;
    --atomic-letter-spacing: ${overrides.letterSpacing}px;
    --atomic-image-spacing: ${overrides.imageSpacing || 40}px;
}
`;
}

export default function PremiumProjectDetailPage() {
    const { id } = useParams()
    const { t } = useLanguage()
    const supabase = createClient()
    const [project, setProject] = useState<any>(null)
    const [chapters, setChapters] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedChapter, setSelectedChapter] = useState<any>(null)
    const [blocks, setBlocks] = useState<any[]>([])
    const [isBlueprinting, setIsBlueprinting] = useState(false)
    const [selectedTheme, setSelectedTheme] = useState('saas_modern')
    const [isGeneratingAll, setIsGeneratingAll] = useState(false)
    const [showStudio, setShowStudio] = useState(false)
    const [designMood, setDesignMood] = useState('')
    const [isApplyingMood, setIsApplyingMood] = useState(false)
    const [overrides, setOverrides] = useState<ThemeOverrides>({
        fontSize: 18,
        lineHeight: 1.6,
        accentColor: '#3b82f6',
        backgroundColor: '#ffffff',
        textColor: '#0f172a',
        fontFamily: 'Inter, sans-serif',
        headingFontFamily: 'Inter, sans-serif',
        paragraphSpacing: 1.5,
        pagePadding: 40,
        marginSides: 0,
        letterSpacing: 0,
        columnCount: 1,
        viewport: 'Desktop',
        fontWeight: 400,
        textTransform: 'none',
        textAlign: 'left',
        borderRadius: 0,
        borderWidth: 0,
        borderColor: '#e2e8f0',
        shadowDepth: 'none',
        layoutMode: 'Flow',
        imageSpacing: 40
    })

    const debouncedOverrides = useDebounce(overrides, 1000)

    console.log("PremiumForgePage Render Debug:", {
        chaptersIsArray: Array.isArray(chapters),
        blocksIsArray: Array.isArray(blocks),
        projectExists: !!project
    });

    useEffect(() => {
        if (project?.id && debouncedOverrides && !loading) {
            updateProjectDesignAction(project.id, debouncedOverrides)
        }
    }, [debouncedOverrides])

    // Editor States
    const [isEditing, setIsEditing] = useState(false)
    const [editedContent, setEditedContent] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [toolbarPosition, setToolbarPosition] = useState<{ top: number, left: number } | null>(null)
    const editorRef = React.useRef<HTMLDivElement>(null)
    const chapterScrollRef = React.useRef<HTMLDivElement>(null)

    const scrollChapters = (direction: 'left' | 'right') => {
        if (!chapterScrollRef.current) return
        const scrollAmount = 400
        chapterScrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        })
    }

    useEffect(() => {
        fetchProjectData()
    }, [id])

    useEffect(() => {
        if (selectedChapter?.content_html) {
            setEditedContent(selectedChapter.content_html)
            setIsEditing(false)
        }
    }, [selectedChapter])

    const fetchProjectData = async () => {
        const { data: p } = await (supabase
            .from('premium_content_projects')
            .select(`*, project_master(app_name)`)
            .eq('id', id as string)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .single() as any)

        const { data: c } = await supabase
            .from('content_chapters')
            .select('*')
            .eq('premium_project_id', id as string)
            .order('chapter_index', { ascending: true })

        if (p) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setProject(p as any)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((p as any).design_config) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setOverrides(prev => ({ ...prev, ...((p as any).design_config as any) }))
            }
        }
        if (c) {
            setChapters(c)
            if (!selectedChapter && c.length > 0) setSelectedChapter(c[0])
        }

        // Fetch blocks if a chapter is selected
        if (selectedChapter) {
            const { data: b } = await supabase
                .from('content_blocks')
                .select('*')
                .eq('chapter_id', selectedChapter.id)
                .order('index', { ascending: true })
            if (b) setBlocks(b)
        }

        setLoading(false)
    }

    useEffect(() => {
        if (selectedChapter) {
            fetchBlocks(selectedChapter.id)
        }
    }, [selectedChapter])

    const fetchBlocks = async (chapterId: string) => {
        console.log("Fetching blocks for chapter:", chapterId)
        const { data: b, error } = await supabase
            .from('content_blocks')
            .select('*')
            .eq('chapter_id', chapterId)
            .order('index', { ascending: true })

        if (error) {
            console.error("Error fetching blocks:", error)
        }

        if (b) {
            console.log("Blocks fetched successfully:", b.length)
            setBlocks(b)
            return b
        } else {
            setBlocks([])
            return []
        }
    }

    const handleCreateBlueprint = async () => {
        if (!selectedChapter) return
        setIsBlueprinting(true)
        try {
            const res = await generateChapterBlueprintAction(selectedChapter.id)
            if (!res.success) {
                alert(`Error: ${res.error}`)
                return
            }
            const newBlocks = await fetchBlocks(selectedChapter.id)
            // Automate content generation immediately after blueprinting
            // Pass the blocks directly to avoid waiting for state update
            await handleGenerateBlocks(newBlocks)
        } catch (err) {
            console.error(err)
        } finally {
            setIsBlueprinting(false)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleGenerateBlocks = async (blocksArray?: any[]) => {
        // If called by React onClick, blocksArray will be the synthetic event
        const targetBlocks = Array.isArray(blocksArray) ? blocksArray : blocks
        if (!targetBlocks || !targetBlocks.length) {
            console.log("No blocks to generate.")
            return
        }
        const pendingBlocks = targetBlocks.filter(b => b.status === 'Pending' || b.status === 'Error')
        console.log("Starting parallel generation for blocks:", pendingBlocks.length)

        // Use Promise.all to generate in parallel for speed
        const safePending = Array.isArray(pendingBlocks) ? pendingBlocks : []
        await Promise.all(safePending.map(async (block) => {
            try {
                // Optimistically update status to 'Generating' in UI
                setBlocks(prev => (prev || []).map(b => b.id === block.id ? { ...b, status: 'Generating' } : b))

                const res = await generateBlockContentAction(block.id)

                if (!res.success) {
                    console.error(`Failed to generate block ${block.id}:`, res.error)
                    setBlocks(prev => (prev || []).map(b => b.id === block.id ? { ...b, status: 'Error' } : b))
                } else {
                    // Refresh this specific block's data after success
                    const { data: updatedBlock } = await (supabase
                        .from('content_blocks')
                        .select('*')
                        .eq('id', block.id)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .single() as any)

                    if (updatedBlock) {
                        setBlocks(prev => (prev || []).map(b => b.id === block.id ? updatedBlock : b))
                    }
                }
            } catch (e) {
                console.error("Failed to generate block", block.id, e)
                setBlocks(prev => (prev || []).map(b => b.id === block.id ? { ...b, status: 'Error' } : b))
            }
        }))

        console.log("All parallel generations attempted.")
    }

    const handleUpdateBlock = async (blockId: string, updates: any) => {
        try {
            await updateBlockContentAction(blockId, updates)
            if (selectedChapter) fetchBlocks(selectedChapter.id)
        } catch (err) {
            console.error(err)
        }
    }

    const handleMoveBlock = async (blockId: string, direction: 'up' | 'down') => {
        const index = blocks.findIndex(b => b.id === blockId)
        if (index === -1) return
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === blocks.length - 1) return

        const newBlocks = [...(blocks || [])]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        const [movedBlock] = newBlocks.splice(index, 1)
        newBlocks.splice(targetIndex, 0, movedBlock)

        // Update indices in DB
        try {
            const updates = newBlocks.map((b, i) => updateBlockContentAction(b.id, { index: i }))
            await Promise.all(updates)
            setBlocks(newBlocks)
        } catch (err) {
            console.error(err)
        }
    }

    const handleDeleteBlock = async (blockId: string) => {
        if (!confirm("Are you sure you want to delete this block?")) return
        try {
            await supabase.from('content_blocks').delete().eq('id', blockId)
            if (selectedChapter) fetchBlocks(selectedChapter.id)
        } catch (err) {
            console.error(err)
        }
    }

    const handleGenerateChapter = async (chapterId: string) => {
        try {
            await generateChapterAction(chapterId)
            fetchProjectData()
        } catch (err) {
            console.error(err)
        }
    }

    const handleGenerateAll = async () => {
        setIsGeneratingAll(true)
        const safeChapters = Array.isArray(chapters) ? chapters : []
        for (const ch of safeChapters) {
            if (ch.status !== 'Completed') {
                try {
                    await handleGenerateChapter(ch.id)
                } catch (e) {
                    console.error("Stopping batch generation due to error", e)
                    break
                }
            }
        }
        setIsGeneratingAll(false)
    }

    const handleSelection = () => {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0 && selection.toString().trim() !== '') {
            const range = selection.getRangeAt(0)
            const rect = range.getBoundingClientRect()
            // Center the larger toolbar above selection
            setToolbarPosition({
                top: rect.top + window.scrollY - 60,
                left: rect.left + window.scrollX + (rect.width / 2) - 180
            })
        } else {
            setToolbarPosition(null)
        }
    }

    const execCommand = (command: string, value: string = '') => {
        // If we are editing, we don't necessarily want to force focus to editorRef
        // document.execCommand works on the currently focused contentEditable element
        document.execCommand(command, false, value)

        // If we were using editorRef for the legacy system, we still sync it
        if (editorRef.current && document.activeElement === editorRef.current) {
            setEditedContent(editorRef.current.innerHTML)
        }
    }

    const applyHighlight = () => {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const span = document.createElement('span')
            span.className = 'accent-text'
            range.surroundContents(span)
            if (editorRef.current) {
                setEditedContent(editorRef.current.innerHTML)
            }
        }
    }

    const handleSaveChapter = async () => {
        if (!selectedChapter || !editorRef.current) return
        setIsSaving(true)
        try {
            // Extract only the inner content part to avoid saving the theme wrapper/style/script
            const bodyEl = editorRef.current.querySelector('.editorial-body')
            const html = bodyEl ? bodyEl.innerHTML : editorRef.current.innerHTML

            await updateChapterContentAction(selectedChapter.id, html)

            // Update local state
            setChapters((chapters || []).map(ch =>
                ch.id === selectedChapter.id ? { ...ch, content_html: html } : ch
            ))
            setSelectedChapter({ ...selectedChapter, content_html: html })
            setEditedContent(html)
            setIsEditing(false)
        } catch (err) {
            console.error(err)
        } finally {
            setIsSaving(false)
        }
    }

    const [isExporting, setIsExporting] = useState(false)

    const handleExportPDF = async () => {
        if (!project) return
        setIsExporting(true)
        try {
            const response = await fetch('/api/export-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: project.id })
            })
            if (!response.ok) throw new Error("Export failed")

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `MassGenix_${project.title.replace(/\s+/g, '_')}.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
        } catch (err) {
            console.error(err)
            alert("Failed to export PDF")
        } finally {
            setIsExporting(false)
        }
    }

    const handleThemeChange = (themeId: string) => {
        setSelectedTheme(themeId)
        // Optionally reset some overrides to theme defaults if they are too weird
        // but for now we keep layout overrides for consistency across themes
    }

    const resetOverrides = () => {
        setOverrides({
            fontSize: 18,
            lineHeight: 1.6,
            accentColor: '#3b82f6',
            backgroundColor: '#ffffff',
            textColor: '#0f172a',
            fontFamily: 'Inter, sans-serif',
            headingFontFamily: 'Inter, sans-serif',
            paragraphSpacing: 1.5,
            pagePadding: 40,
            marginSides: 0,
            letterSpacing: 0,
            columnCount: 1,
            viewport: 'Desktop',
            fontWeight: 400,
            textTransform: 'none',
            textAlign: 'left',
            borderRadius: 0,
            borderWidth: 0,
            borderColor: '#e2e8f0',
            shadowDepth: 'none'
        })
    }

    const handleApplyDesignMood = async () => {
        if (!designMood) return
        setIsApplyingMood(true)
        const result = await generateDesignOverridesAction(designMood)
        if (result.success && result.overrides) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setOverrides(prev => ({ ...prev, ...(result.overrides as any) }))
            setDesignMood('')
        }
        setIsApplyingMood(false)
    }

    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            if (toolbarPosition && !(e.target as HTMLElement).closest('.floating-toolbar')) {
                setToolbarPosition(null)
            }
        }
        document.addEventListener('mousedown', handleGlobalClick)
        return () => document.removeEventListener('mousedown', handleGlobalClick)
    }, [toolbarPosition])

    if (loading) return (
        <div className="h-96 flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest gap-3">
            <Loader2 className="w-5 h-5 animate-spin" /> {t.premium_forge.detail.loading}
        </div>
    )

    if (!project) return <div className="p-20 text-center text-red-400 font-black">{t.premium_forge.detail.not_found}</div>

    return (
        <div className="flex flex-col gap-6 pb-20 min-h-screen relative bg-[#0b0b0b] overflow-y-auto custom-scrollbar">
            {/* Floating Toolbar */}
            {toolbarPosition && (
                <div
                    className="floating-toolbar fixed z-[100] flex items-center gap-0.5 p-1 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                    style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
                >
                    <div className="flex items-center gap-0.5 px-1 border-r border-white/10">
                        <button onClick={() => execCommand('bold')} className="p-2 hover:bg-white/10 rounded-lg text-white transition-all"><Bold className="w-4 h-4" /></button>
                        <button onClick={() => execCommand('italic')} className="p-2 hover:bg-white/10 rounded-lg text-white transition-all"><Italic className="w-4 h-4" /></button>
                        <button onClick={() => execCommand('underline')} className="p-2 hover:bg-white/10 rounded-lg text-white transition-all"><Underline className="w-4 h-4" /></button>
                    </div>
                    <div className="flex items-center gap-0.5 px-1 border-r border-white/10">
                        <button onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-white/10 rounded-lg text-white transition-all"><List className="w-4 h-4" /></button>
                        <button onClick={() => execCommand('insertOrderedList')} className="p-2 hover:bg-white/10 rounded-lg text-white transition-all"><ListOrdered className="w-4 h-4" /></button>
                    </div>
                    <div className="flex items-center gap-1 px-2 border-r border-white/10">
                        <button onClick={() => execCommand('formatBlock', '<h2>')} className="text-[10px] font-black text-white hover:bg-white/10 px-2 py-1 rounded">H2</button>
                        <button onClick={() => execCommand('formatBlock', '<h3>')} className="text-[10px] font-black text-white hover:bg-white/10 px-2 py-1 rounded">H3</button>
                    </div>
                    <div className="flex items-center gap-1 px-1">
                        <button onClick={applyHighlight} className="p-2 hover:bg-white/10 rounded-lg text-primary transition-all flex items-center gap-1">
                            <Palette className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase">Highlight</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Top Navigation & Project Info */}
            <div className="w-full flex flex-col gap-4 px-8 pt-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/premium-forge" className="p-3 hover:bg-white/5 rounded-2xl text-gray-400 hover:text-white transition-all border border-white/5">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em] bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 shadow-lg shadow-primary/5">
                                    {project.type === 'ebook' ? 'E-BOOK EDITION' : project.type === 'blog' ? 'PREMIUM BLOG' : 'STRATEGIC WHITEPAPER'}
                                </span>
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{project.project_master?.app_name}</span>
                            </div>
                            <h1 className="text-lg font-black text-white tracking-widest uppercase italic">
                                Artículo de Investigación <span className="text-gray-500 mx-2 not-italic font-light">/</span> <span className="text-white/40 not-italic uppercase tracking-tight">{project.title}</span>
                            </h1>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerateAll}
                        disabled={isGeneratingAll}
                        className="bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all disabled:opacity-50 shadow-2xl shadow-primary/30 border border-white/10"
                    >
                        {isGeneratingAll ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {isGeneratingAll ? 'Weaving Content...' : 'Generate Full Draft'}
                    </button>
                </div>

                {/* Chapter Navigator Carousel */}
                <div className="relative group/carousel">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-20 opacity-0 group-hover/carousel:opacity-100 transition-all">
                        <button
                            onClick={() => scrollChapters('left')}
                            className="p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-white shadow-2xl hover:bg-primary transition-all active:scale-90"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    </div>

                    <div
                        ref={chapterScrollRef}
                        className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2 mask-linear-right scroll-smooth"
                    >
                        {Array.isArray(chapters) && chapters.map((ch) => (
                            <button
                                key={ch.id}
                                onClick={() => setSelectedChapter(ch)}
                                className={`flex items-center gap-4 px-8 py-4 rounded-[1.5rem] border transition-all whitespace-nowrap group ${selectedChapter?.id === ch.id
                                    ? 'bg-white/10 border-white/20 shadow-2xl ring-1 ring-white/10 scale-105 z-10'
                                    : 'bg-secondary/10 border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${ch.status === 'Completed' ? 'bg-green-500/20 text-green-400 group-hover:bg-green-500/30' :
                                    ch.status === 'Generating' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                                        'bg-white/5 text-gray-600'
                                    }`}>
                                    {ch.status === 'Completed' ? <CheckCircle2 className="w-4 h-4" /> : ch.chapter_index}
                                </div>
                                <span className={`text-[11px] font-black uppercase tracking-widest ${selectedChapter?.id === ch.id ? 'text-white' : 'text-gray-400'}`}>{ch.title}</span>
                            </button>
                        ))}
                    </div>

                    <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-20 opacity-0 group-hover/carousel:opacity-100 transition-all">
                        <button
                            onClick={() => scrollChapters('right')}
                            className="p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-white shadow-2xl hover:bg-primary transition-all active:scale-90"
                        >
                            <ChevronLeft className="w-5 h-5 rotate-180" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Central Action Bar */}
            <div className="mx-8 bg-secondary/10 border border-white/5 p-2 rounded-[2.5rem] flex items-center justify-between shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowStudio(!showStudio)}
                        className={`flex items-center gap-3 px-8 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${showStudio
                            ? 'bg-primary text-white border-primary/50 shadow-lg shadow-primary/20'
                            : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:border-white/10'
                            }`}
                    >
                        <Settings className={`w-4 h-4 ${showStudio ? 'rotate-90' : ''} transition-transform duration-500`} />
                        {showStudio ? 'Close Studio' : 'Open Visual Studio'}
                    </button>

                    <div className="w-px h-6 bg-white/10 mx-2" />

                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-3 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                        >
                            <Edit3 className="w-4 h-4" /> Editorial Mode
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSaveChapter}
                                disabled={isSaving}
                                className="flex items-center gap-3 px-10 py-3 bg-green-500 hover:bg-green-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-green-500/20 disabled:opacity-50 border border-green-400/20"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Commit Changes
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-red-500/20 border border-white/5 text-gray-400 hover:text-red-400 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                            >
                                <X className="w-4 h-4" /> Cancel
                            </button>
                        </div>
                    )}

                    {selectedChapter && !isEditing && (
                        <button
                            onClick={() => handleGenerateChapter(selectedChapter.id)}
                            disabled={isGeneratingAll || selectedChapter.status === 'Generating'}
                            className={`flex items-center gap-3 px-8 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${selectedChapter.status === 'Completed'
                                ? 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                                : 'bg-primary text-white border-primary/50 shadow-lg shadow-primary/20 hover:bg-blue-600'
                                }`}
                        >
                            {selectedChapter.status === 'Generating' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {selectedChapter.status === 'Completed' ? 'Regenerate Section' : 'Generate Section'}
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 mr-2">
                    <button
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="flex items-center gap-3 px-10 py-3 bg-white text-black rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all shadow-2xl border border-white/10 disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {isExporting ? 'Exporting...' : 'Download PDF'}
                    </button>
                </div>
            </div>

            {/* Studio Top Toolbar (Consolidated Design Controls) */}
            <div className={`border-b border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-500 overflow-hidden ${showStudio ? 'max-h-[300px] opacity-100 py-6' : 'max-h-0 opacity-0 py-0'}`}>
                <div className="max-w-[1600px] mx-auto px-8 grid grid-cols-3 gap-8">
                    {/* Typography Engine */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <FontIcon className="w-3 h-3" />
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em]">Typography</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                            <select
                                value={overrides.headingFontFamily}
                                onChange={(e) => setOverrides({ ...overrides, headingFontFamily: e.target.value })}
                                className="bg-black border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-white outline-none focus:border-primary transition-all"
                            >
                                <option value="Inter, sans-serif">Headings: Inter</option>
                                <option value="'Playfair Display', serif">Headings: Playfair</option>
                                <option value="'Montserrat', sans-serif">Headings: Montserrat</option>
                            </select>
                            <select
                                value={overrides.fontFamily}
                                onChange={(e) => setOverrides({ ...overrides, fontFamily: e.target.value })}
                                className="bg-black border border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-white outline-none focus:border-primary transition-all"
                            >
                                <option value="Inter, sans-serif">Body: Inter</option>
                                <option value="'Merriweather', serif">Body: Merriweather</option>
                                <option value="'Roboto', sans-serif">Body: Roboto</option>
                            </select>
                            <div className="flex items-center gap-4">
                                <span className="text-[8px] font-bold text-gray-500 w-8">Size</span>
                                <input type="range" min="14" max="32" value={overrides.fontSize} onChange={(e) => setOverrides({ ...overrides, fontSize: parseInt(e.target.value) })} className="flex-1 accent-primary" />
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[8px] font-bold text-gray-500 w-8">Spacing</span>
                                <input type="range" min="1.2" max="2.4" step="0.1" value={overrides.lineHeight} onChange={(e) => setOverrides({ ...overrides, lineHeight: parseFloat(e.target.value) })} className="flex-1 accent-primary" />
                            </div>
                        </div>
                    </div>

                    {/* Layout & Box Model */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <Layout className="w-3 h-3" />
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em]">Layout & Viewport</h4>
                        </div>
                        <div className="space-y-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                            <div className="grid grid-cols-4 gap-1.5">
                                <button onClick={() => setOverrides({ ...overrides, viewport: 'Desktop' })} className={`p-1.5 rounded-lg flex flex-col items-center gap-1 border transition-all ${overrides.viewport === 'Desktop' ? 'bg-primary border-primary text-white' : 'bg-black border-white/5 text-gray-500 hover:border-white/20'}`}>
                                    <Monitor className="w-3 h-3" />
                                    <span className="text-[6px] font-black uppercase">Desk</span>
                                </button>
                                <button onClick={() => setOverrides({ ...overrides, viewport: 'Smartphone' })} className={`p-1.5 rounded-lg flex flex-col items-center gap-1 border transition-all ${overrides.viewport === 'Smartphone' ? 'bg-primary border-primary text-white' : 'bg-black border-white/5 text-gray-500 hover:border-white/20'}`}>
                                    <Smartphone className="w-3 h-3" />
                                    <span className="text-[6px] font-black uppercase">Mobile</span>
                                </button>
                                <button onClick={() => setOverrides({ ...overrides, viewport: 'A4' })} className={`p-1.5 rounded-lg flex flex-col items-center gap-1 border transition-all ${overrides.viewport === 'A4' ? 'bg-primary border-primary text-white' : 'bg-black border-white/5 text-gray-500 hover:border-white/20'}`}>
                                    <FileText className="w-3 h-3" />
                                    <span className="text-[6px] font-black uppercase">A4</span>
                                </button>
                                <button onClick={() => setOverrides({ ...overrides, viewport: 'Full' })} className={`p-1.5 rounded-lg flex flex-col items-center gap-1 border transition-all ${overrides.viewport === 'Full' ? 'bg-primary border-primary text-white' : 'bg-black border-white/5 text-gray-500 hover:border-white/20'}`}>
                                    <Maximize2 className="w-3 h-3" />
                                    <span className="text-[6px] font-black uppercase">Full</span>
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-[8px] font-bold text-gray-500 w-8">Pad</span>
                                    <input type="range" min="0" max="100" value={overrides.pagePadding} onChange={(e) => setOverrides({ ...overrides, pagePadding: parseInt(e.target.value) })} className="flex-1 accent-primary" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[8px] font-bold text-gray-500 w-8">Radius</span>
                                    <input type="range" min="0" max="60" value={overrides.borderRadius} onChange={(e) => setOverrides({ ...overrides, borderRadius: parseInt(e.target.value) })} className="flex-1 accent-primary" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[8px] font-bold text-gray-500 w-8 uppercase">Img Gap</span>
                                    <input type="range" min="0" max="200" value={overrides.imageSpacing} onChange={(e) => setOverrides({ ...overrides, imageSpacing: parseInt(e.target.value) })} className="flex-1 accent-primary" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual Effects (Colors & Shadows) */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                            <Droplets className="w-3 h-3" />
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em]">Visual Effects</h4>
                        </div>
                        <div className="space-y-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <input type="color" value={overrides.backgroundColor} onChange={(e) => setOverrides({ ...overrides, backgroundColor: e.target.value })} className="w-6 h-6 rounded-md bg-transparent border-none cursor-pointer" />
                                    <span className="text-[8px] font-bold text-gray-500 uppercase">Background</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={overrides.textColor} onChange={(e) => setOverrides({ ...overrides, textColor: e.target.value })} className="w-6 h-6 rounded-md bg-transparent border-none cursor-pointer" />
                                    <span className="text-[8px] font-bold text-gray-500 uppercase">Text Color</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[8px] font-bold text-gray-500 w-12 text-right">Shadow</span>
                                <div className="flex bg-black rounded-lg p-0.5 border border-white/5 flex-1">
                                    {['none', 'soft', 'medium', 'hard'].map(s => (
                                        <button key={s} onClick={() => setOverrides({ ...overrides, shadowDepth: s as any })} className={`flex-1 py-1 rounded-md text-[7px] font-black uppercase transition-all ${overrides.shadowDepth === s ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Layout: Content + Sidebar */}
            <div className="flex flex-1 overflow-hidden">
                {/* Horizontal Scroll Area for Content */}
                <div className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-500 ease-in-out px-8 py-10 ${showStudio ? 'pr-4' : ''}`}>
                    <div className={`mx-auto transition-all duration-700 shadow-2xl relative min-h-[1000px] border border-black/5
                        ${overrides.viewport === 'Smartphone' ? 'max-w-[375px] rounded-[3rem]' :
                            overrides.viewport === 'A4' ? 'max-w-[794px]' :
                                overrides.viewport === 'US_Letter' ? 'max-w-[816px]' : 'max-w-5xl rounded-3xl'}`}
                        style={{
                            backgroundColor: 'var(--atomic-bg)',
                            color: 'var(--atomic-text)',
                            fontFamily: 'var(--atomic-font-body)',
                        }}
                    >
                        <style>{getDynamicStyles(overrides)}</style>

                        {blocks.length > 0 ? (
                            <div className="p-12 space-y-8">
                                {Array.isArray(blocks) && blocks.map((block) => (
                                    <BlockRenderer
                                        key={block.id}
                                        id={block.id}
                                        type={block.type}
                                        content={block.content_json}
                                        status={block.status}
                                        htmlOverride={block.html_override}
                                        isEditing={isEditing}
                                        onSelection={handleSelection}
                                        onUpdate={(updates: any) => handleUpdateBlock(block.id, updates)}
                                        onMove={(dir: 'up' | 'down') => handleMoveBlock(block.id, dir)}
                                        onDelete={() => handleDeleteBlock(block.id)}
                                    />
                                ))}
                                {blocks.some(b => b.status === 'Pending') && (
                                    <button
                                        onClick={() => handleGenerateBlocks()}
                                        className="w-full py-12 border-2 border-dashed border-primary/20 rounded-[2.5rem] text-primary font-black uppercase tracking-widest hover:bg-primary/5 transition-all flex flex-col items-center gap-4"
                                    >
                                        <Sparkles className="w-8 h-8" />
                                        Generate Atomic Content for this Blueprint
                                    </button>
                                )}
                            </div>
                        ) : selectedChapter?.status === 'Completed' ? (
                            <div className="relative">
                                {/* MassGenix OS Promotion / Transition */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
                                    <button
                                        onClick={handleCreateBlueprint}
                                        disabled={isBlueprinting}
                                        className="bg-black text-[10px] font-black text-primary border border-primary/30 px-6 py-2 rounded-full uppercase tracking-[0.2em] shadow-xl hover:bg-primary hover:text-white transition-all"
                                    >
                                        {isBlueprinting ? 'Synthesizing...' : '⚡ Upgrade to Atomic MassGenix OS'}
                                    </button>
                                </div>
                                <div
                                    ref={editorRef}
                                    contentEditable={isEditing}
                                    onMouseUp={handleSelection}
                                    onKeyUp={handleSelection}
                                    className={`outline-none transition-all prose prose-invert max-w-none ${isEditing ? 'cursor-text ring-1 ring-primary/20' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: applyTheme(editedContent, selectedTheme, overrides) }}
                                />
                            </div>
                        ) : selectedChapter?.status === 'Generating' ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-black/5">
                                <div className="w-32 h-32 rounded-full border-t-2 border-primary animate-spin shadow-2xl shadow-primary/20" />
                                <div className="text-center space-y-4">
                                    <h3 className="text-3xl font-black text-gray-900 uppercase tracking-[0.4em] italic animate-pulse">Synthesizing...</h3>
                                </div>
                            </div>
                        ) : selectedChapter ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 text-gray-400">
                                <Layers className="w-24 h-24 opacity-10" />
                                <div className="text-center">
                                    <h3 className="text-xl font-black uppercase tracking-widest mb-4">No content found</h3>
                                    <button
                                        onClick={handleCreateBlueprint}
                                        disabled={isBlueprinting}
                                        className="bg-primary text-white px-8 py-3 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
                                    >
                                        {isBlueprinting ? 'Blueprinting...' : 'Generate Block Blueprint'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 text-gray-300">
                                <BookOpen className="w-32 h-32 opacity-10" />
                                <p className="font-black text-lg uppercase tracking-[0.5em] text-gray-400">Selecciona un capítulo</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Studio Sidebar (Magic Presets) */}
                <div className={`h-full border-l border-white/5 bg-[#111] transition-all duration-500 overflow-hidden flex flex-col ${showStudio ? 'w-[320px]' : 'w-0'}`}>
                    <div className="w-[320px] h-full flex flex-col">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Magic Presets</h3>
                            </div>
                            <button onClick={() => setShowStudio(false)} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar bg-black/10">
                            {/* AI Design Soul */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Wand2 className="w-4 h-4" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">AI Design Soul</h4>
                                </div>
                                <div className="p-5 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-[2rem] space-y-4">
                                    <div className="relative">
                                        <textarea
                                            value={designMood}
                                            onChange={(e) => setDesignMood(e.target.value)}
                                            placeholder="Describe el mood..."
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[11px] text-white outline-none focus:border-primary/50 transition-all resize-none h-24 placeholder:text-gray-600"
                                        />
                                        <button
                                            onClick={handleApplyDesignMood}
                                            disabled={isApplyingMood || !designMood}
                                            className="absolute bottom-3 right-3 p-3 bg-primary hover:bg-primary-focus text-white rounded-xl transition-all disabled:opacity-50 shadow-xl"
                                        >
                                            {isApplyingMood ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Magic Presets List */}
                            <div className="space-y-4 pb-12">
                                <div className="flex items-center gap-3 text-primary">
                                    <Layers className="w-4 h-4" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Themes</h4>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {Object.values(THEMES).map(theme => (
                                        <button
                                            key={theme.id}
                                            onClick={() => handleThemeChange(theme.id)}
                                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${selectedTheme === theme.id ? 'bg-primary/20 border-primary ring-1 ring-primary/50' : 'bg-black border-white/5 hover:border-white/10'}`}
                                        >
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{theme.name}</span>
                                            <div className="flex gap-1.5">
                                                {(theme.previewColors || []).map((c: any, i: number) => (
                                                    <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                                                ))}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
