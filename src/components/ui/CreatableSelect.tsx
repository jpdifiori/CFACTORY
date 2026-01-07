'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreatableSelectProps {
    options: string[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function CreatableSelect({
    options,
    value,
    onChange,
    placeholder = "Select or type...",
    className
}: CreatableSelectProps) {
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Sync input when value changes externally
    useEffect(() => {
        if (!open) {
            // When closed, if value exists, ensure input isn't showing a stale partial type
            // But we actually want the input to reflect the current value?
            // For a creatable select, the input *is* the value display often.
        }
    }, [value, open])

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(inputValue.toLowerCase())
    )

    const handleSelect = (option: string) => {
        onChange(option)
        setInputValue('') // Clear input or set to option? usually clear for "search", set for "combobox"
        setOpen(false)
    }

    const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setInputValue(val)
        setOpen(true)
        // For "Creatable", we treat the text itself as a value if they blur or specific action? 
        // Or we pass it up immediately? 
        // Let's pass it up immediately so it acts like a controlled input that has suggestions
        onChange(val)
    }

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <div className="relative">
                <input
                    type="text"
                    className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none pr-10"
                    placeholder={placeholder}
                    value={open ? inputValue : (value || inputValue)} // Use generic input value when typing, otherwise value
                    onChange={handleCustomInput}
                    onClick={() => {
                        setOpen(true)
                        setInputValue(value) // Prime input with current value for editing
                    }}
                    onFocus={() => {
                        setOpen(true)
                        setInputValue(value)
                    }}
                />
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                    <ChevronsUpDown className="w-4 h-4" />
                </button>
            </div>

            {open && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl max-h-60 overflow-auto">
                    {filteredOptions.length === 0 && inputValue && (
                        <div
                            className="px-4 py-2 text-sm text-gray-400 cursor-pointer hover:bg-primary/10 hover:text-primary flex items-center gap-2"
                            onClick={() => {
                                handleSelect(inputValue)
                            }}
                        >
                            <Plus className="w-3 h-3" />
                            Create "{inputValue}"
                        </div>
                    )}

                    <div className="p-8 text-center space-y-2">
                        <p className="text-gray-400 text-sm italic">&quot;No results found. Type and press enter to create a new option.&quot;</p>
                    </div>

                    {filteredOptions.map((option) => (
                        <div
                            key={option}
                            className={cn(
                                "px-4 py-2 text-sm cursor-pointer hover:bg-secondary transition-colors flex items-center justify-between",
                                value === option ? "text-primary font-medium" : "text-gray-300"
                            )}
                            onClick={() => handleSelect(option)}
                        >
                            {option}
                            {value === option && <Check className="w-4 h-4" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
