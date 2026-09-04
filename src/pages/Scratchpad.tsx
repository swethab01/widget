import { useState, useEffect, useRef } from 'react'
import { Card } from '../components/ui/Card'

const TEMPLATES = [
    { label: '✓ Checklist', text: '- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n' },
    { label: '{ } JSON', text: '{\n  "endpoint": "/api/v1/resource",\n  "status": "active"\n}\n' },
    { label: '$ Git', text: 'git status\ngit add -A\ngit commit -m "feat: update"\ngit push\n' },
    { label: '# Notes', text: '## Meeting Notes\n- Key decision:\n- Next steps:\n' },
]

export function Scratchpad() {
    const [content, setContent] = useState('')
    const [savedStatus, setSavedStatus] = useState<string>('Loaded')
    const [copied, setCopied] = useState(false)
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (window.electronAPI?.scratchpad) {
            window.electronAPI.scratchpad.get().then((res) => {
                if (res?.content !== undefined) {
                    setContent(res.content)
                    setSavedStatus('Synced')
                }
            })
        }
    }, [])

    const handleChange = (newVal: string) => {
        setContent(newVal)
        setSavedStatus('Saving…')

        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(async () => {
            if (window.electronAPI?.scratchpad) {
                await window.electronAPI.scratchpad.save(newVal)
                setSavedStatus('Saved')
            }
        }, 600)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Tab key indents with 2 spaces
        if (e.key === 'Tab') {
            e.preventDefault()
            const target = e.currentTarget
            const start = target.selectionStart
            const end = target.selectionEnd
            const updated = content.substring(0, start) + '  ' + content.substring(end)
            setContent(updated)
            handleChange(updated)
            setTimeout(() => {
                target.selectionStart = target.selectionEnd = start + 2
            }, 0)
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const insertTemplate = (templateText: string) => {
        const updated = content ? content + '\n\n' + templateText : templateText
        setContent(updated)
        handleChange(updated)
    }

    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
    const lineCount = content ? content.split('\n').length : 0

    return (
        <div className="flex-1 h-full flex flex-col p-3 gap-2 overflow-hidden animate-fade-in">
            {/* Top Toolbar */}
            <Card className="!p-2.5">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm">📝</span>
                        <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Scratchpad</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-muted font-mono">{savedStatus}</span>
                        <button
                            onClick={handleCopy}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                copied ? 'bg-accent-green text-white' : 'bg-surface-hover text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            {copied ? '✓ Copied' : 'Copy All'}
                        </button>
                    </div>
                </div>

                {/* Quick Templates */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] text-text-muted uppercase">Templates:</span>
                    {TEMPLATES.map((t) => (
                        <button
                            key={t.label}
                            onClick={() => insertTemplate(t.text)}
                            className="text-[10px] bg-surface-hover hover:bg-surface-border text-text-secondary hover:text-text-primary px-1.5 py-0.5 rounded transition-colors font-mono"
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Editor Area */}
            <div className="flex-1 relative rounded-xl border border-surface-border bg-surface-card overflow-hidden flex flex-col">
                <textarea
                    value={content}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type scratch thoughts, API JSON, regex, or code snippets here (auto-saved locally)..."
                    className="flex-1 w-full p-3 bg-transparent text-xs font-mono text-text-primary placeholder-text-muted outline-none resize-none leading-relaxed selection:bg-accent/30"
                    spellCheck={false}
                />

                {/* Footer status */}
                <div className="flex items-center justify-between px-3 py-1 bg-surface-hover/50 border-t border-surface-border text-[9px] text-text-muted font-mono">
                    <div>
                        {lineCount} lines • {wordCount} words • {content.length} chars
                    </div>
                    <div>Local SQLite Buffer</div>
                </div>
            </div>
        </div>
    )
}
