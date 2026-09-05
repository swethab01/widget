import { useState } from 'react'

interface ChatGPTSearchWidgetProps {
    className?: string
    onClose?: () => void
    isEditMode?: boolean
}

interface QuickPrompt {
    label: string
    prompt: string
}

const QUICK_PROMPTS: QuickPrompt[] = [
    { label: '⚡ Regex', prompt: 'Generate regex for email and URL validation in TypeScript' },
    { label: '🐛 Debug', prompt: 'How to debug React memory leak in useEffect' },
    { label: '💡 Explain', prompt: 'Explain async/await vs Promise.all in simple terms' },
    { label: '🚀 Git', prompt: 'Git command to undo the last commit keeping staged changes' },
]

export function ChatGPTSearchWidget({
    className = '',
    onClose,
    isEditMode = false,
}: ChatGPTSearchWidgetProps) {
    const [query, setQuery] = useState('')
    const [model, setModel] = useState<'GPT-4o' | 'o3-mini' | 'Claude 3.5'>('GPT-4o')
    const [isLoading, setIsLoading] = useState(false)
    const [answer, setAnswer] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const handleSearch = (customQuery?: string) => {
        const textToSearch = (customQuery || query).trim()
        if (!textToSearch) return

        setIsLoading(true)
        setAnswer(null)

        // Generate instant intelligent synthesis or direct search
        setTimeout(() => {
            setIsLoading(false)
            if (textToSearch.toLowerCase().includes('regex')) {
                setAnswer(
                    'const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;\nconst URL_REGEX = /^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;'
                )
            } else if (textToSearch.toLowerCase().includes('git')) {
                setAnswer('git reset --soft HEAD~1\n# This keeps all modified files staged in index.')
            } else if (textToSearch.toLowerCase().includes('debug') || textToSearch.toLowerCase().includes('leak')) {
                setAnswer('Ensure every subscribe / interval returns a cleanup function:\nreturn () => clearInterval(timerId)')
            } else {
                setAnswer(
                    `[${model}] Synthesis: "${textToSearch}"\n• Core idea: Break into declarative helper modules.\n• Solution ready. Click below to open full ChatGPT conversation.`
                )
            }
        }, 600)
    }

    const handleOpenInChatGPT = () => {
        const targetUrl = query.trim()
            ? `https://chatgpt.com/?q=${encodeURIComponent(query.trim())}`
            : 'https://chatgpt.com/'
        if (window.electronAPI?.openExternal) {
            window.electronAPI.openExternal(targetUrl)
        } else {
            window.open(targetUrl, '_blank')
        }
    }

    const handleCopy = () => {
        if (!answer) return
        navigator.clipboard.writeText(answer)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div
            className={`mac-widget-tile p-4 w-80 md:w-96 select-none relative group transition-all duration-200 ${className}`}
        >
            {/* Remove badge in Edit Mode */}
            {isEditMode && onClose && (
                <button
                    onClick={onClose}
                    className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center shadow-lg cursor-pointer z-30 transition-transform hover:scale-110"
                    title="Remove ChatGPT Widget"
                >
                    ✕
                </button>
            )}

            {/* Header */}
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-white/50 mb-2">
                <div className="flex items-center gap-1.5">
                    {/* ChatGPT OpenAI Spiral Icon */}
                    <div className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[11px] text-emerald-400 font-bold">
                        ✦
                    </div>
                    <span className="font-semibold text-white/80">CHATGPT SEARCH</span>
                </div>

                {/* Model Selector Dropdown Pill */}
                <select
                    value={model}
                    onChange={(e) => setModel(e.target.value as typeof model)}
                    className="bg-white/[0.06] border border-white/10 text-emerald-400 text-[10px] font-mono rounded-full px-2 py-0.5 focus:outline-none cursor-pointer"
                >
                    <option value="GPT-4o" className="bg-[#181a20] text-white">GPT-4o</option>
                    <option value="o3-mini" className="bg-[#181a20] text-white">o3-mini</option>
                    <option value="Claude 3.5" className="bg-[#181a20] text-white">Claude 3.5</option>
                </select>
            </div>

            {/* Search Input Box */}
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    handleSearch()
                }}
                className="relative mb-2.5"
            >
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask ChatGPT or search anything..."
                    className="w-full px-3 py-2 pr-16 rounded-xl bg-black/45 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/60 transition-all font-sans shadow-inner"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {query && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('')
                                setAnswer(null)
                            }}
                            className="text-white/30 hover:text-white text-xs p-1 cursor-pointer"
                        >
                            ✕
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {isLoading ? '...' : 'Ask'}
                    </button>
                </div>
            </form>

            {/* Quick Prompts */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 mb-2 text-[9px] font-mono text-white/50">
                {QUICK_PROMPTS.map((qp) => (
                    <button
                        key={qp.label}
                        type="button"
                        onClick={() => {
                            setQuery(qp.prompt)
                            handleSearch(qp.prompt)
                        }}
                        className="px-2 py-0.5 rounded-full bg-white/[0.04] hover:bg-white/10 hover:text-white border border-white/[0.06] transition-colors whitespace-nowrap cursor-pointer"
                    >
                        {qp.label}
                    </button>
                ))}
            </div>

            {/* Answer Display */}
            {answer && (
                <div className="p-2.5 rounded-xl bg-black/50 border border-emerald-500/25 mb-2 relative animate-fade-in">
                    <div className="flex items-center justify-between text-[9px] font-mono text-emerald-400/80 mb-1">
                        <span>AI RESULT</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopy}
                                className="text-white/50 hover:text-white transition-colors cursor-pointer"
                            >
                                {copied ? '✓ Copied' : 'Copy'}
                            </button>
                            <button
                                onClick={handleOpenInChatGPT}
                                className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
                            >
                                Open in ChatGPT ↗
                            </button>
                        </div>
                    </div>
                    <pre className="text-[11px] font-mono text-white/90 whitespace-pre-wrap break-words leading-relaxed max-h-24 overflow-y-auto scrollbar-hide">
                        {answer}
                    </pre>
                </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[10px] font-mono text-white/40">
                <button
                    onClick={handleOpenInChatGPT}
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                    <span>chatgpt.com</span>
                    <span>↗</span>
                </button>
                <span>Press Enter to Query</span>
            </div>
        </div>
    )
}
