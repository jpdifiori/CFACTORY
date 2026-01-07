'use client'

import React, { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Briefcase,
    User,
    Mail,
    Lock,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Building2,
    Sparkles,
    Loader2
} from 'lucide-react'

type AccountType = 'Person' | 'Company'

export default function SignupPage() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    // Form State
    const [accountType, setAccountType] = useState<AccountType>('Company')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')

    // Role-specific state
    const [companyName, setCompanyName] = useState('')
    const [industry, setIndustry] = useState('')
    const [jobTitle, setJobTitle] = useState('')

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // 1. Create Auth User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error('Failed to create account')

            // 2. Create Profile - Only send relevant fields
            const profileData: any = {
                id: authData.user.id,
                account_type: accountType,
                full_name: fullName,
                updated_at: new Date().toISOString(),
            }

            if (accountType === 'Company') {
                profileData.company_name = companyName
                profileData.industry = industry
            } else {
                profileData.job_title = jobTitle
            }

            const { error: profileError } = await (supabase
                .from('profiles')
                .insert([profileData]) as any)

            if (profileError) throw profileError

            setStep(4) // Success step
        } catch (err: any) {
            setError(err.message || 'Error creating account')
        } finally {
            setLoading(false)
        }
    }

    const nextStep = () => setStep(prev => prev + 1)
    const prevStep = () => setStep(prev => prev - 1)

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-xl">
                {/* Progress Bar */}
                {step < 4 && (
                    <div className="flex gap-2 mb-8">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-white/10'
                                    }`}
                            />
                        ))}
                    </div>
                )}

                <div className="bg-card/40 backdrop-blur-2xl border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* STEP 1: Account Type */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-bold text-white mb-2">Welcome!</h2>
                            <p className="text-gray-400 mb-8">How will you be using the factory?</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => { setAccountType('Company'); nextStep(); }}
                                    className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 group ${accountType === 'Company'
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-white/5 bg-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${accountType === 'Company' ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 group-hover:bg-white/10'
                                        }`}>
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Company</h3>
                                        <p className="text-sm text-gray-500">Managing multi-brand content strategies.</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => { setAccountType('Person'); nextStep(); }}
                                    className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 group ${accountType === 'Person'
                                        ? 'border-purple-500 bg-purple-500/10'
                                        : 'border-white/5 bg-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${accountType === 'Person' ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 group-hover:bg-white/10'
                                        }`}>
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Individual</h3>
                                        <p className="text-sm text-gray-500">Working on solo projects or personal brand.</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Credentials */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <button
                                onClick={prevStep}
                                className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                            <p className="text-gray-400 mb-8">Enter your access credentials.</p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input
                                            required
                                            type="email"
                                            className="w-full bg-secondary/30 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-600"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                        <input
                                            required
                                            type="password"
                                            className="w-full bg-secondary/30 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-gray-600"
                                            placeholder="Min. 8 characters"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={nextStep}
                                    disabled={!email || password.length < 8}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    Continue
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Profile Data */}
                    {step === 3 && (
                        <form onSubmit={handleSignup} className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-4">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <h2 className="text-3xl font-bold text-white mb-2">Final Details</h2>
                            <p className="text-gray-400 mb-8">Tell us a bit more about you.</p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-secondary/30 border border-white/5 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>

                                {accountType === 'Company' ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Company Name</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-secondary/30 border border-white/5 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                                                placeholder="Acme Corp"
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Industry</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-secondary/30 border border-white/5 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                                                placeholder="Technology, Real Estate, etc."
                                                value={industry}
                                                onChange={(e) => setIndustry(e.target.value)}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Job Title</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-secondary/30 border border-white/5 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                                            placeholder="Content Creator, Marketing Manager"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            Finish Setup
                                            <Sparkles className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* STEP 4: Success */}
                    {step === 4 && (
                        <div className="text-center animate-in zoom-in duration-500">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 text-green-400 mb-6 border border-green-500/20">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Account Created!</h2>
                            <p className="text-gray-400 mb-8">
                                Welcome to the AI Content Factory. Your workspace is ready.
                            </p>
                            <Link
                                href="/projects"
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-2xl transition-all inline-block"
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    )}

                    {step < 4 && (
                        <div className="mt-8 pt-6 border-t border-white/5 text-center">
                            <p className="text-gray-400 text-sm">
                                Already have an account?{' '}
                                <Link href="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                                    Log In
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
