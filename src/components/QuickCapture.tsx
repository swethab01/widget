import { useState } from 'react'
import type { NewTask } from '../types'

interface QuickCaptureProps {
    onAdd: (task: NewTask) => Promise<unknown>
}

export function QuickCapture({ onAdd }: QuickCaptureProps) {
    const [value, setValue] = useState('')
    const [focused, setFocused] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!value.trim()) return
        // Smart parse: detect priority keywords
        let priority: 'high' | 'medium' | 'low' = 'medium'
        let title = value.trim()

        if (/\!{3}|urgent|critical/i.test(title)) priority = 'high'
        else if (/\!{2}|important/i.test(title)) priority = 'medium'
        else if (/\!{1}$/i.test(title)) priority = 'low'

        // Strip priority markers from title
        title = title.replace(/!{1,3}$/, '').trim()

        await onAdd({ title, priority })
        setValue('')
    }

    return (
        <form onSubmit={handleSubmit} className="mb-3">
            <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${focused
                        ? 'border-accent bg-surface-card'
                        : 'border-surface-border bg-surface-card hover:border-surface-hover'
                    }`}
            >
                <span className="text-text-muted text-sm">+</span>
                <input
                    type="text"
                    placeholder='Add a task… (use ! for priority)'
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="flex-1 bg-transparent text-xs text-text-primary placeholder-text-muted outline-none"
                />
                {value && (
                    <button
                        type="submit"
                        className="text-[10px] bg-accent text-white px-2 py-0.5 rounded-md hover:bg-blue-500 transition-colors"
                    >
                        Add
                    </button>
                )}
            </div>
            {focused && (
                <div className="mt-1 text-[10px] text-text-muted px-1">
                    Tip: End with ! for low, !! medium, !!! for high priority
                </div>
            )}
        </form>
    )
}
