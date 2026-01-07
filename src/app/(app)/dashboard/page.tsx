'use client'

import React, { useEffect, useState } from "react";
import { ArrowUpRight, Plus, Rocket, Zap, Clock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/database.types";
import { useLanguage } from "@/context/LanguageContext";

type Project = Database['public']['Tables']['project_master']['Row']

export default function Home() {
  const supabase = createClient()
  const { lang, t } = useLanguage()
  console.log('[Dashboard] Current lang:', lang, 'Title:', t.dashboard.title)
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState({
    projectsCount: 0,
    contentCount: 0,
    engagement: "0%"
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch projects
      const { data: projectsData } = await supabase
        .from('project_master')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Fetch content count
      const { count: contentCount } = await supabase
        .from('content_queue')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (projectsData) setProjects(projectsData)
      setStats({
        projectsCount: projectsData?.length || 0,
        contentCount: contentCount || 0,
        engagement: "4.8%" // Placeholder for now or calculate if possible
      })
    } catch (err) {
      console.error("Dashboard error:", err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: t.dashboard.stats.active_projects, value: stats.projectsCount.toString(), change: "+0", icon: Rocket },
    { label: t.dashboard.stats.content_pieces, value: stats.contentCount.toLocaleString(), change: "+0", icon: Zap },
    { label: t.dashboard.stats.avg_engagement, value: stats.engagement, change: "+0%", icon: ArrowUpRight },
  ];

  if (loading) {
    return <div className="p-8 animate-pulse text-gray-500">{t.common.loading}</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{t.dashboard.title}</h1>
          <p className="text-muted-foreground">{t.dashboard.subtitle}</p>
        </div>
        <Link href="/projects/new">
          <button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-colors">
            <Plus className="w-4 h-4" />
            {t.dashboard.new_project}
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-6 rounded-xl flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <span className="text-green-500 text-xs font-semibold">{t.dashboard.stats.live_data}</span>
            </div>
            <div className="bg-primary/20 p-2 rounded-lg">
              <stat.icon className="w-5 h-5 text-primary" />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4">
        <h2 className="text-xl font-semibold mb-4 text-white">{t.dashboard.recent_activity}</h2>
        {projects.length === 0 ? (
          <div className="bg-card/50 border border-border border-dashed p-10 rounded-xl text-center">
            <p className="text-gray-500 mb-4">{t.dashboard.no_projects}</p>
            <Link href="/projects/new" className="text-primary font-bold">+ {t.dashboard.create_first}</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map(project => (
              <Link key={project.id} href={`/projects/${project.id}`} className="group block">
                <div className="bg-card border border-border p-5 rounded-lg hover:border-primary transition-colors cursor-pointer group-hover:bg-accent/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {project.app_name[0]}
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-full text-secondary-foreground">
                      {t.dashboard.active}
                    </span>
                  </div>
                  <h3 className="font-bold text-white mb-1">{project.app_name}</h3>
                  <p className="text-sm text-muted-foreground">{project.niche_vertical}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
