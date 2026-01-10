'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, Play, ScrollText,
    Layers, ChevronDown, CheckCircle2,
    ArrowRight, Loader2, Sparkles, Zap, Filter
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { SafeSelectBuilder } from '@/utils/supabaseSafe'
import { useTitle } from '@/context/TitleContext'
import Link from 'next/link'
import { Database } from '@/types/database.types'

type Project = Database['public']['Tables']['project_master']['Row']
type SocialConnection = Database['public']['Tables']['social_connections']['Row']
type ContentItem = Database['public']['Tables']['content_queue']['Row'] & {
    campaigns: { name: string | null } | null
}

export default function HubPage() {
    const params = useParams()
    const projectId = params.id as string
    const supabase = createClient()
    const router = useRouter()
    const { setTitle } = useTitle()

    const [loading, setLoading] = useState(true)
    const [project, setProject] = useState<Project | null>(null)
    const [projects, setProjects] = useState<Pick<Project, 'id' | 'app_name'>[]>([])
    const [connections, setConnections] = useState<SocialConnection[]>([])
    const [recentContent, setRecentContent] = useState<ContentItem[]>([])
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)

    useEffect(() => {
        const fetchAllProjects = async () => {
            const { data } = await supabase.from('project_master').select('id, app_name').order('app_name')
            if (data) setProjects(data)
        }

        const fetchHubData = async () => {
            setLoading(true)
            try {
                const projPromise = (supabase.from('project_master') as unknown as SafeSelectBuilder<'project_master'>).select('*').eq('id', projectId).single()
                const connPromise = (supabase.from('social_connections') as unknown as SafeSelectBuilder<'social_connections'>).select('*').eq('project_id', projectId)
                const contPromise = (supabase.from('content_queue') as unknown as SafeSelectBuilder<'content_queue'>)
                    .select('*, campaigns(name)')
                    .eq('project_id', projectId)
                    .order('created_at', { ascending: false })
                    .limit(5)

                const [projRes, connRes, contRes] = await Promise.all([projPromise, connPromise, contPromise])

                if (projRes.error) throw projRes.error
                if (projRes.data) setProject(projRes.data as Project)

                if (connRes.data) setConnections(connRes.data as SocialConnection[])

                // For the join query, we need to be careful with the type
                if (contRes.data) {
                    setRecentContent(contRes.data as unknown as ContentItem[])
                }
            } catch (error) {
                console.error('Error fetching hub data:', error)
            } finally {
                setLoading(false)
            }
        }

        setTitle('Smart Dashboard')
        fetchAllProjects()
        if (projectId) {
            fetchHubData()
        }
    }, [projectId, setTitle, supabase])

    const handleProjectSwitch = (id: string) => {
        setIsSwitcherOpen(false)
        router.push(`/hub/${id}`)
    }

    if (loading && !project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="font-black text-gray-500 uppercase tracking-widest text-xs">Synchronizing Hub...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto py-12 px-6">
            {/* Top Bar: Project Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="relative">
                    <button
                        onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                        className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 py-3 px-6 rounded-2xl transition-all group"
                    >
                        <div className="p-2 bg-blue-600/10 rounded-xl">
                            <Layers className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Active Project</p>
                            <h2 className="text-lg font-black text-white leading-none flex items-center gap-2">
                                {project?.app_name}
                                <ChevronDown className={`w-4 h-4 text-gray-600 group-hover:text-white transition-transform ${isSwitcherOpen ? 'rotate-180' : ''}`} />
                            </h2>
                        </div>
                    </button>

                    <AnimatePresence>
                        {isSwitcherOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsSwitcherOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute left-0 mt-3 w-72 bg-[#121212] border border-white/10 rounded-3xl shadow-2xl z-50 p-2 overflow-hidden max-h-[400px] overflow-y-auto"
                                >
                                    <div className="p-3 mb-2 border-b border-white/5">
                                        <div className="relative">
                                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
                                            <input
                                                className="w-full bg-white/5 border-none rounded-xl py-2 pl-8 pr-4 text-xs text-white placeholder:text-gray-700 outline-none"
                                                placeholder="Search projects..."
                                            />
                                        </div>
                                    </div>
                                    {projects.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleProjectSwitch(p.id)}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between group ${p.id === projectId ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            <span className="truncate">{p.app_name}</span>
                                            {p.id === projectId && <CheckCircle2 className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={`/projects/${projectId}/campaigns/new`}
                        className="bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                        Project Settings
                    </Link>
                    <Link
                        href={`/projects/${projectId}/connections`}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                    >
                        Vault & API
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Traffic Light Card */}
                <div className="lg:col-span-1 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass p-8 rounded-[2.5rem] border-white/5 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl" />
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-8 px-1">Infrastructure Health</h3>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-white leading-none">{connections.length}</p>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Connected Services</p>
                                    </div>
                                </div>
                                <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-pulse" />
                            </div>

                            <div className="space-y-4">
                                {connections.map(conn => (
                                    <div key={conn.id} className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${conn.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span className="text-xs font-bold text-gray-400 capitalize">{conn.platform}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-600 truncate max-w-[100px]">{conn.account_name}</span>
                                    </div>
                                ))}
                                {connections.length === 0 && (
                                    <p className="text-[10px] text-gray-700 italic text-center py-4">No active connections found</p>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    <div className="glass p-8 rounded-[2.5rem] border-white/5 shadow-2xl">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 px-1">Quick Actions</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <Link href={`/projects/${projectId}/campaigns/new`} className="group flex items-center justify-between p-5 bg-white/5 hover:bg-blue-600 transition-all rounded-3xl">
                                <span className="font-bold text-sm text-gray-300 group-hover:text-white">New Strategy Campaign</span>
                                <Plus className="w-4 h-4 text-gray-600 group-hover:text-white" />
                            </Link>
                            <button className="group flex items-center justify-between p-5 bg-white/5 hover:bg-purple-600 transition-all rounded-3xl">
                                <span className="font-bold text-sm text-gray-300 group-hover:text-white">Generate High-Impact Reel</span>
                                <Play className="w-4 h-4 text-gray-600 group-hover:text-white" />
                            </button>
                            <button className="group flex items-center justify-between p-5 bg-white/5 hover:bg-indigo-600 transition-all rounded-3xl">
                                <span className="font-bold text-sm text-gray-300 group-hover:text-white">Create Blog Carousel</span>
                                <ScrollText className="w-4 h-4 text-gray-600 group-hover:text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area: Recent Activity */}
                <div className="lg:col-span-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-[2.5rem] border-white/5 shadow-2xl overflow-hidden min-h-[500px] flex flex-col"
                    >
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                            <div>
                                <h3 className="text-xl font-black text-white italic">Recent Content Activity</h3>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Global Pipeline Status</p>
                            </div>
                            <Sparkles className="w-6 h-6 text-blue-500/50" />
                        </div>

                        <div className="flex-1">
                            {recentContent.length > 0 ? (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="text-left px-8 py-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">Asset / Campaign</th>
                                            <th className="text-left px-8 py-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">Type</th>
                                            <th className="text-left px-8 py-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">Status</th>
                                            <th className="text-right px-8 py-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {recentContent.map(item => (
                                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div>
                                                        <p className="font-bold text-white mb-0.5 line-clamp-1">{(item.gemini_output as { title?: string })?.title || 'Untitled Post'}</p>
                                                        <p className="text-[10px] font-medium text-gray-600 truncate">{item.campaigns?.name || 'Quick Direct'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-tight">{item.content_type}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Published' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' :
                                                            item.status === 'Draft' ? 'bg-gray-600' : 'bg-blue-500'
                                                            }`} />
                                                        <span className="text-xs font-bold text-gray-300">{item.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <p className="text-[10px] font-black text-gray-600 uppercase">{new Date(item.created_at).toLocaleDateString()}</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-20 text-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Zap className="w-8 h-8 text-gray-800" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-400 mb-2">The pipeline is waiting.</h4>
                                    <p className="text-xs text-gray-600 max-w-xs mx-auto">Start a new campaign to see your real-time content activity here.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-blue-600/5 group hover:bg-blue-600 transition-all cursor-pointer">
                            <Link href={`/projects/${projectId}`} className="flex items-center justify-center gap-3">
                                <span className="font-black text-[10px] uppercase tracking-[0.3em] text-blue-500 group-hover:text-white">Access Full Queue Strategy</span>
                                <ArrowRight className="w-4 h-4 text-blue-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Floating Quick Action Bar (Bottom Mobile) */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 md:hidden z-50">
                <div className="glass px-6 py-4 rounded-full border-white/20 shadow-2xl flex items-center gap-6">
                    <button className="text-gray-400 hover:text-white"><Play className="w-6 h-6" /></button>
                    <button className="p-4 bg-blue-600 rounded-full text-white shadow-xl -mt-10 border-4 border-black"><Plus className="w-6 h-6" /></button>
                    <button className="text-gray-400 hover:text-white"><ScrollText className="w-6 h-6" /></button>
                </div>
            </div>
        </div>
    )
}
