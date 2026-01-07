import React from 'react'
import { Check } from 'lucide-react'

interface Step {
    id: number
    name: string
}

interface StepIndicatorProps {
    steps: Step[]
    currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-between w-full mb-12">
            {steps.map((step, idx) => (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center relative group">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 ${step.id < currentStep
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : step.id === currentStep
                                        ? 'bg-black border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                                        : 'bg-black border-white/10 text-gray-600'
                                }`}
                        >
                            {step.id < currentStep ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                <span className="text-sm font-bold">{step.id}</span>
                            )}
                        </div>
                        <span
                            className={`absolute -bottom-6 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors duration-500 ${step.id === currentStep ? 'text-blue-400' : 'text-gray-600'
                                }`}
                        >
                            {step.name}
                        </span>
                    </div>
                    {idx < steps.length - 1 && (
                        <div className="flex-1 h-px bg-white/5 mx-4 relative overflow-hidden">
                            <div
                                className="absolute inset-0 bg-blue-600 transition-all duration-700"
                                style={{
                                    width: step.id < currentStep ? '100%' : '0%',
                                    opacity: step.id < currentStep ? 1 : 0
                                }}
                            />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    )
}
