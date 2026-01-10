'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/database.types'
import { Plus, ArrowRight, Activity, Users } from 'lucide-react'

type Project = Database['public']['Tables']['project_master']['Row']

import { useLanguage } from '@/context/LanguageContext'

export default function AllProjectsPage() {
    const supabase = createClient()
    const { t } = useLanguage()
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)

    const fetchProjects = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('project_master')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            if (data) setProjects(data)
        } catch (error) {
            console.error('Error fetching projects:', error)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        fetchProjects()
    }, [fetchProjects])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{t.projects.title}</h1>
                    <p className="text-muted-foreground">{t.projects.subtitle}</p>
                </div>
                <Link href="/projects/new">
                    <button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-colors">
                        <Plus className="w-4 h-4" />
                        {t.projects.create_new}
                    </button>
                </Link>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-secondary/10">
                    <h3 className="text-xl font-semibold text-white mb-2">{t.projects.no_projects}</h3>
                    <p className="text-muted-foreground mb-6">{t.projects.no_projects_desc}</p>
                    <Link href="/projects/new">
                        <button className="text-primary hover:text-blue-400 font-medium">
                            + {t.projects.create_project}
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link key={project.id} href={`/projects/${project.id}`} className="group block">
                            <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group-hover:-translate-y-1">
                                <div className="p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center border border-white/5 group-hover:border-primary/20">
                                            <span className="text-xl font-bold text-white">
                                                {project.app_name.substring(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${project.brand_voice === 'Educational' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            project.brand_voice === 'Professional' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                project.brand_voice === 'Funny' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
                                                    project.brand_voice === 'Urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                            }`}>
                                            {project.brand_voice}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                                            {project.app_name}
                                        </h3>
                                        <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px]">
                                            {project.description || `Automated content for ${project.niche_vertical}`}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Activity className="w-3.5 h-3.5" />
                                            <span>{project.niche_vertical}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Users className="w-3.5 h-3.5" />
                                            <span className="truncate">{project.target_audience}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-3 bg-secondary/30 flex items-center justify-between text-xs font-medium text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                    <span>{t.projects.manage_content}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
