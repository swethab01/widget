import { useState } from 'react'

interface AIPromptWidgetProps {
    className?: string
    onSendPrompt?: (prompt: string) => void
}

export function AIPromptWidget({ className = '', onSendPrompt }: AIPromptWidgetProps) {
    const [prompt, setPrompt] = useState('')
    const [statusMessage, setStatusMessage] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!prompt.trim()) return

        if (onSendPrompt) {
            onSendPrompt(prompt.trim())
        } else {
            // Save prompt directly to scratchpad as quick capture
            try {
                const current = await window.electronAPI.scratchpad.get()
                const updated = `${current?.content || ''}\n\n// AI Prompt (${new Date().toLocaleTimeString()}):\n${prompt.trim()}`
                await window.electronAPI.scratchpad.save(updated)
                setStatusMessage('Saved to Scratchpad ✓')
            } catch {
                navigator.clipboard.writeText(prompt.trim())
                setStatusMessage('Copied to Clipboard ✓')
            }
        }

        setPrompt('')
        setTimeout(() => setStatusMessage(null), 2500)
    }

    const handleQuickAction = (actionText: string) => {
        setPrompt((prev) => `${actionText}: ${prev}`.trim())
    }

    return (
        <div className={`mac-widget-tile p-3.5 flex flex-col justify-between select-none ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-white/50 mb-2">
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mac-pulse-dot" />
                    <span className="font-semibold text-white/70">INTELLIGENCE</span>
                </div>
                {statusMessage ? (
                    <span className="text-[10px] text-emerald-400 font-bold transition-all">
                        {statusMessage}
                    </span>
                ) : (
                    <span className="text-[10px] text-white/40">DEV PILOT</span>
                )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSubmit} className="relative flex items-center">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask anything or capture idea..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all font-sans"
                />
                <button
                    type="submit"
                    className="absolute right-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-[11px] text-white font-medium transition-all hover:scale-105 active:scale-95"
                >
                    ↵
                </button>
            </form>

            {/* Quick Action Badges */}
            <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-white/[0.08] overflow-x-auto scrollbar-hide">
                <button
                    onClick={() => handleQuickAction('Explain code')}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/15 text-white/70 hover:text-white transition-all whitespace-nowrap"
                >
                    💡 Explain
                </button>
                <button
                    onClick={() => handleQuickAction('Debug error')}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/15 text-white/70 hover:text-white transition-all whitespace-nowrap"
                >
                    🐛 Debug
                </button>
                <button
                    onClick={() => handleQuickAction('Generate regex for')}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/15 text-white/70 hover:text-white transition-all whitespace-nowrap"
                >
                    ⚡ Regex
                </button>
                <button
                    onClick={() => handleQuickAction('Refactor')}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] hover:bg-white/15 text-white/70 hover:text-white transition-all whitespace-nowrap"
                >
                    🔄 Refactor
                </button>
            </div>
        </div>
    )
}
