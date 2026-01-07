'use client'

import React, { useState } from 'react'
import { Calendar, Clock, Plus, Trash2, Save, Sparkles } from 'lucide-react'

interface ScheduleConfigProps {
    config: any
    onSave: (config: any) => void
    loading?: boolean
}

export function SchedulerSettings({ config, onSave, loading }: ScheduleConfigProps) {
    const [localConfig, setLocalConfig] = useState(config || {
        workdays: { count: 1, hours: ['09:00'] },
        weekends: { count: 1, hours: ['12:00'] }
    })

    const addHour = (type: 'workdays' | 'weekends') => {
        setLocalConfig((prev: any) => ({
            ...prev,
            [type]: {
                ...prev[type],
                hours: [...prev[type].hours, '12:00'],
                count: prev[type].hours.length + 1
            }
        }))
    }

    const removeHour = (type: 'workdays' | 'weekends', index: number) => {
        const newHours = localConfig[type].hours.filter((_: any, i: number) => i !== index)
        setLocalConfig((prev: any) => ({
            ...prev,
            [type]: {
                ...prev[type],
                hours: newHours,
                count: newHours.length
            }
        }))
    }

    const updateHour = (type: 'workdays' | 'weekends', index: number, value: string) => {
        const newHours = [...localConfig[type].hours]
        newHours[index] = value
        setLocalConfig((prev: any) => ({
            ...prev,
            [type]: {
                ...prev[type],
                hours: newHours
            }
        }))
    }

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-secondary/20 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Posting Schedule
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Define your weekly content rhythm</p>
                </div>
                <button
                    onClick={() => onSave(localConfig)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                >
                    {loading ? 'Saving...' : (
                        <>
                            <Save className="w-3.5 h-3.5" />
                            Save Config
                        </>
                    )}
                </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Workdays */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-widest text-blue-400">Monday to Friday</label>
                        <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">
                            {localConfig.workdays.count} posts / day
                        </span>
                    </div>
                    <div className="space-y-2">
                        {localConfig.workdays.hours.map((hour: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                                <div className="flex-1 relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                                    <input
                                        type="time"
                                        value={hour}
                                        onChange={(e) => updateHour('workdays', i, e.target.value)}
                                        className="w-full bg-secondary/50 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                                <button
                                    onClick={() => removeHour('workdays', i)}
                                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => addHour('workdays')}
                            className="w-full py-2 border border-dashed border-white/10 rounded-lg text-[10px] font-bold text-gray-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-3 h-3" />
                            Add Slot
                        </button>
                    </div>
                </div>

                {/* Weekends */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-widest text-purple-400">Saturday & Sunday</label>
                        <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
                            {localConfig.weekends.count} posts / day
                        </span>
                    </div>
                    <div className="space-y-2">
                        {localConfig.weekends.hours.map((hour: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                                <div className="flex-1 relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                                    <input
                                        type="time"
                                        value={hour}
                                        onChange={(e) => updateHour('weekends', i, e.target.value)}
                                        className="w-full bg-secondary/50 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
                                    />
                                </div>
                                <button
                                    onClick={() => removeHour('weekends', i)}
                                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => addHour('weekends')}
                            className="w-full py-2 border border-dashed border-white/10 rounded-lg text-[10px] font-bold text-gray-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-3 h-3" />
                            Add Slot
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 bg-primary/5 flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <p className="text-[10px] text-gray-400">
                    The system will automatically assign these times when you use the <span className="text-white font-bold">Auto-Fill</span> function.
                </p>
            </div>
        </div>
    )
}
