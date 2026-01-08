'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Instagram, Facebook, Linkedin, Twitter, Music,
    ExternalLink, Lock, Settings, CheckCircle2,
    AlertCircle, Loader2, X, Plus, ShieldCheck, Zap
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useLanguage } from '@/context/LanguageContext'
import { useTitle } from '@/context/TitleContext'
import {
    saveSocialConnectionAction,
    testSocialConnectionAction,
    updateSafetyZonesAction
} from '@/app/actions/socialActions'

const PLATFORMS = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-600/10' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-700/10' },
    { id: 'twitter', name: 'Twitter / X', icon: Twitter, color: 'text-gray-400', bg: 'bg-gray-400/10' },
    { id: 'tiktok', name: 'TikTok', icon: Music, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
]

export default function ConnectionsPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const projectId = params.id as string
    const supabase = createClient()
    const { t } = useLanguage()
    const { setTitle } = useTitle()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [connections, setConnections] = useState<any[]>([])
    const [project, setProject] = useState<any>(null)
    const [showModal, setShowModal] = useState(false)
    const [selectedPlatform, setSelectedPlatform] = useState<any>(null)

    // Form State
    const [formData, setFormData] = useState({
        accountName: '',
        platformId: '',
        accessToken: ''
    })
    const [submitting, setSubmitting] = useState(false)
    const [testingId, setTestingId] = useState<string | null>(null)

    // Safety Zones State
    const [safetyZones, setSafetyZones] = useState({
        bottom_clearance: 20,
        top_clearance: 10,
        side_clearance: 5
    })
    const [savingZones, setSavingZones] = useState(false)

    useEffect(() => {
        setTitle(t.connections.title)
        if (projectId) {
            fetchData()
        }
    }, [projectId, t])

    // Handle OAuth Redirect params
    useEffect(() => {
        const success = searchParams.get('success')
        const error = searchParams.get('error')

        if (success === 'instagram_connected') {
            alert('Instagram connected successfully!')
            router.replace(`/projects/${projectId}/connections`)
            fetchData()
        } else if (success === 'tiktok_connected') {
            alert('TikTok connected successfully!')
            router.replace(`/projects/${projectId}/connections`)
            fetchData()
        } else if (error) {
            alert(`Connection Error: ${decodeURIComponent(error)}`)
            router.replace(`/projects/${projectId}/connections`)
        }
    }, [searchParams, projectId])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [connRes, projRes] = await Promise.all([
                supabase.from('social_connections').select('*').eq('project_id', projectId) as any,
                supabase.from('project_master').select('*').eq('id', projectId).single() as any
            ])

            if (connRes.data) setConnections(connRes.data)
            if (projRes.data) {
                setProject(projRes.data)
                if (projRes.data.safety_zones) {
                    setSafetyZones({ ...safetyZones, ...projRes.data.safety_zones })
                }
            }
        } catch (error) {
            console.error('Error fetching connections:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleConnectClick = async (platform: any) => {
        if (platform.id === 'instagram') {
            const clientId = process.env.NEXT_PUBLIC_FB_APP_ID
            if (!clientId) {
                alert('System Error: Facebook App ID not configured.')
                return
            }
            const redirectUri = `${window.location.origin}/api/auth/facebook/callback`
            const scope = 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement'
            const state = projectId

            // Redirect to Meta OAuth
            window.location.href = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}&response_type=code`
            return
        }

        if (platform.id === 'tiktok') {
            const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY
            if (!clientKey) {
                alert('System Error: TikTok Client Key not configured.')
                return
            }

            // Generate PKCE
            const generateCodeVerifier = () => {
                const array = new Uint8Array(32);
                window.crypto.getRandomValues(array);
                return btoa(String.fromCharCode.apply(null, Array.from(array)))
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=+$/, '');
            };

            const generateCodeChallenge = async (verifier: string) => {
                const encoder = new TextEncoder();
                const data = encoder.encode(verifier);
                const hash = await window.crypto.subtle.digest('SHA-256', data);
                return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(hash))))
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=+$/, '');
            };

            try {
                const codeVerifier = generateCodeVerifier();
                const codeChallenge = await generateCodeChallenge(codeVerifier);

                // Store verifier in cookie (valid for 5 mins)
                document.cookie = `tiktok_code_verifier=${codeVerifier}; path=/; max-age=300; SameSite=Lax`;

                const redirectUri = `${window.location.origin}/api/auth/tiktok/callback`
                // Scopes: user.info.basic for name/avatar, video.publish for uploading
                const scope = 'user.info.basic,video.publish,video.upload'
                const state = projectId

                // Redirect to TikTok OAuth with PKCE
                window.location.href = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&response_type=code&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`
            } catch (err) {
                console.error('PKCE Error:', err);
                alert('Error initializing TikTok login.');
            }
            return
        }

        setSelectedPlatform(platform)
        setShowModal(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await saveSocialConnectionAction({
                projectId,
                platform: selectedPlatform.id,
                ...formData
            })

            if (res.success) {
                setShowModal(false)
                setFormData({ accountName: '', platformId: '', accessToken: '' })
                fetchData()
            } else {
                alert('Error: ' + res.error)
            }
        } catch (error) {
            alert('An unexpected error occurred.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleTest = async (connectionId: string) => {
        setTestingId(connectionId)
        try {
            const res = await testSocialConnectionAction(connectionId)
            if (res.success) {
                alert('Connection verified successfully!')
            } else {
                alert('Connection test failed: ' + res.error)
            }
            fetchData()
        } catch (error) {
            alert('Test failed.')
        } finally {
            setTestingId(null)
        }
    }

    const handleSaveSafetyZones = async () => {
        setSavingZones(true)
        try {
            const res = await updateSafetyZonesAction(projectId, safetyZones)
            if (res.success) {
                alert(t.settings.success)
            }
        } catch (error) {
            alert(t.settings.error)
        } finally {
            setSavingZones(false)
        }
    }

    // Helper to get platform specific strings
    const getPlatformStrings = (platformId: string) => {
        // @ts-ignore
        return t.connections.platforms[platformId] || {
            id_label: 'Platform ID',
            token_label: 'Access Token',
            id_help: '',
            token_help: ''
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground animate-pulse">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                <p className="font-mono text-xs uppercase tracking-widest">{t.connections.modal.loading}</p>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">{t.connections.title}</h1>
                <p className="text-gray-400">{t.connections.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Connections Grid */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {PLATFORMS.map((platform) => {
                            const connection = connections.find(c => c.platform === platform.id)
                            return (
                                <motion.div
                                    key={platform.id}
                                    whileHover={{ scale: 1.02 }}
                                    className="glass p-6 rounded-[2rem] border-white/5 shadow-xl flex flex-col justify-between"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-4 ${platform.bg} rounded-2xl`}>
                                            <platform.icon className={`w-8 h-8 ${platform.color}`} />
                                        </div>
                                        {connection ? (
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${connection.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                {connection.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                {connection.status}
                                            </div>
                                        ) : (
                                            <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                                {t.connections.disconnected}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">{platform.name}</h3>
                                        <p className="text-sm text-gray-500 mb-6 italic">
                                            {connection ? connection.account_name : t.connections.no_account}
                                        </p>

                                        {connection ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleTest(connection.id)}
                                                    disabled={testingId === connection.id}
                                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                                                >
                                                    {testingId === connection.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 text-yellow-400" />}
                                                    {t.connections.test_bridge}
                                                </button>
                                                <button className="p-3 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-xl transition-all">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleConnectClick(platform)}
                                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                                            >
                                                {t.connections.connect_account}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>

                {/* Right Panel: Safety Zones */}
                <div className="space-y-8">
                    <div className="glass p-8 rounded-[2.5rem] border-white/5 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck className="w-6 h-6 text-green-400" />
                            <h2 className="text-xl font-black text-white italic">{t.connections.safety_zones_title}</h2>
                        </div>
                        <p className="text-xs text-gray-500 mb-8 leading-relaxed">
                            {t.connections.safety_zones_desc}
                        </p>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                    <span>{t.connections.bottom_clearance}</span>
                                    <span className="text-blue-400">{safetyZones.bottom_clearance}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="50" step="1"
                                    className="w-full accent-blue-600"
                                    value={safetyZones.bottom_clearance}
                                    onChange={(e) => setSafetyZones({ ...safetyZones, bottom_clearance: parseInt(e.target.value) })}
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                    <span>{t.connections.top_clearance}</span>
                                    <span className="text-blue-400">{safetyZones.top_clearance}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="40" step="1"
                                    className="w-full accent-blue-600"
                                    value={safetyZones.top_clearance}
                                    onChange={(e) => setSafetyZones({ ...safetyZones, top_clearance: parseInt(e.target.value) })}
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                    <span>{t.connections.side_clearance}</span>
                                    <span className="text-blue-400">{safetyZones.side_clearance}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="20" step="1"
                                    className="w-full accent-blue-600"
                                    value={safetyZones.side_clearance}
                                    onChange={(e) => setSafetyZones({ ...safetyZones, side_clearance: parseInt(e.target.value) })}
                                />
                            </div>

                            <button
                                onClick={handleSaveSafetyZones}
                                disabled={savingZones}
                                className="w-full mt-4 bg-white/5 hover:bg-white/10 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2 border border-white/5"
                            >
                                {savingZones ? <Loader2 className="w-4 h-4 animate-spin" /> : t.connections.apply_context}
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl">
                        <div className="flex gap-4">
                            <Lock className="w-6 h-6 text-yellow-500 shrink-0" />
                            <p className="text-[10px] font-medium text-yellow-500/80 leading-relaxed uppercase tracking-wider">
                                {t.connections.encryption_notice}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && selectedPlatform && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#0f0f0f] border border-white/10 p-10 rounded-[3rem] shadow-2xl relative z-10 max-w-lg w-full"
                        >
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="flex items-center gap-4 mb-8">
                                <div className={`p-4 ${selectedPlatform.bg} rounded-2xl`}>
                                    <selectedPlatform.icon className={`w-8 h-8 ${selectedPlatform.color}`} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">{t.connections.modal.sync} {selectedPlatform.name}</h2>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t.connections.modal.handshake}</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{t.connections.modal.account_label}</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-600/50 outline-none transition-all placeholder:text-gray-700"
                                        placeholder={t.connections.modal.account_placeholder}
                                        value={formData.accountName}
                                        onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between px-1">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{getPlatformStrings(selectedPlatform.id).id_label}</label>
                                        <div className="group relative">
                                            <span className="text-[10px] font-bold text-blue-500 uppercase cursor-help flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> {t.connections.modal.help}
                                            </span>
                                            <div className="absolute right-0 bottom-full mb-2 w-48 p-3 bg-gray-800 border border-white/10 rounded-xl text-[10px] text-gray-300 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                {getPlatformStrings(selectedPlatform.id).id_help}
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-600/50 outline-none transition-all placeholder:text-gray-700"
                                        placeholder={'...'}
                                        value={formData.platformId}
                                        onChange={(e) => setFormData({ ...formData, platformId: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between px-1">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{getPlatformStrings(selectedPlatform.id).token_label}</label>
                                        <div className="group relative">
                                            <span className="text-[10px] font-bold text-blue-500 uppercase cursor-help flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> {t.connections.modal.help}
                                            </span>
                                            <div className="absolute right-0 bottom-full mb-2 w-48 p-3 bg-gray-800 border border-white/10 rounded-xl text-[10px] text-gray-300 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                {getPlatformStrings(selectedPlatform.id).token_help}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-600/50 outline-none transition-all placeholder:text-gray-700 font-mono tracking-widest"
                                            placeholder="********************"
                                            value={formData.accessToken}
                                            onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                                        />
                                        <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : `${t.connections.modal.authorize} ${selectedPlatform.name}`}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
