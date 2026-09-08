import { useState, useEffect } from 'react'
import type { ChatGPTConfig } from '../../types'

interface ChatGPTSearchWidgetProps {
    className?: string
    onClose?: () => void
    isEditMode?: boolean
}

export function ChatGPTSearchWidget({
    className = '',
    onClose,
}: ChatGPTSearchWidgetProps) {
    const [query, setQuery] = useState('')
    const [model, setModel] = useState<string>('gpt-4o')
    const [isLoading, setIsLoading] = useState(false)
    const [answer, setAnswer] = useState<string | null>(null)
    const [toast, setToast] = useState<string | null>(null)
    const [isListening, setIsListening] = useState(false)

    const [config, setConfig] = useState<ChatGPTConfig>({
        accountId: null,
        hasKey: false,
        maskedKey: '',
        model: 'gpt-4o',
        isAppInstalled: true,
    })
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    useEffect(() => {
        loadConfig()
    }, [])

    const loadConfig = async () => {
        try {
            if (window.electronAPI?.chatgpt?.getConfig) {
                const cfg = await window.electronAPI.chatgpt.getConfig()
                setConfig(cfg)
                if (cfg.model) setModel(cfg.model)
            }
        } catch (err) {
            console.error('Failed to load ChatGPT config:', err)
        }
    }

    const showToast = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(null), 3000)
    }

    // Launch native Windows ChatGPT Desktop App or Web
    const handleSendPrompt = async (promptToSend?: string) => {
        const text = (promptToSend || query).trim()
        if (!text) {
            handleOpenApp()
            return
        }

        try {
            if (window.electronAPI?.chatgpt?.openApp) {
                await window.electronAPI.chatgpt.openApp(text)
                showToast('✦ Copied prompt! Switched to ChatGPT App — Press Ctrl+V')
            } else if (window.electronAPI?.openExternal) {
                window.electronAPI.openExternal(`https://chatgpt.com/?q=${encodeURIComponent(text)}`)
                showToast('✦ Opened in ChatGPT')
            }
            setQuery('')
        } catch {
            window.open(`https://chatgpt.com/?q=${encodeURIComponent(text)}`, '_blank')
        }
    }

    const handleOpenApp = async () => {
        try {
            if (window.electronAPI?.chatgpt?.openApp) {
                await window.electronAPI.chatgpt.openApp()
                showToast('✦ Focused ChatGPT Desktop App')
            } else if (window.electronAPI?.openExternal) {
                window.electronAPI.openExternal('https://chatgpt.com')
            }
        } catch {
            window.open('https://chatgpt.com', '_blank')
        }
    }

    const handleOpenFloatingSession = async () => {
        if (window.electronAPI?.chatgpt?.openDesktopWeb) {
            await window.electronAPI.chatgpt.openDesktopWeb(query.trim())
            showToast('✦ Opened logged-in ChatGPT window')
        } else if (window.electronAPI?.openExternal) {
            window.electronAPI.openExternal('https://chatgpt.com')
        }
    }

    // Bottom Action 1: Camera / Screenshot
    const handleCameraAction = async () => {
        showToast('📸 Screenshot mode: Ready to paste into ChatGPT')
        handleSendPrompt(query ? `${query} (Analyzing screenshot)` : 'Please analyze this desktop screenshot:')
    }

    // Bottom Action 2: Image / Attach
    const handleImageAction = () => {
        showToast('🖼 Opening image prompt in ChatGPT')
        handleSendPrompt(query || 'Describe and analyze this image:')
    }

    // Bottom Action 3: Waveform / Voice Mode
    const handleVoiceModeAction = () => {
        showToast('〰 Opening ChatGPT Voice Mode')
        handleOpenApp()
    }

    // Bottom Action 4: Microphone / Dictation
    const handleMicAction = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            showToast('🎙 Dictate: Focusing ChatGPT voice')
            handleOpenApp()
            return
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            const recognition = new SpeechRec()
            recognition.continuous = false
            recognition.interimResults = false
            recognition.lang = 'en-US'

            recognition.onstart = () => {
                setIsListening(true)
                showToast('🎙 Listening... speak now')
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript
                setQuery(transcript)
                setIsListening(false)
                showToast(`🎙 Captured: "${transcript.slice(0, 30)}..."`)
            }
            recognition.onerror = () => {
                setIsListening(false)
                showToast('🎙 Microphone ready in ChatGPT App')
                handleOpenApp()
            }
            recognition.onend = () => {
                setIsListening(false)
            }
            recognition.start()
        } catch {
            handleOpenApp()
        }
    }

    return (
        <div
            className={`w-[320px] h-[140px] bg-[#1a1a1c] rounded-[28px] p-3.5 flex flex-col justify-between select-none relative group border border-white/[0.08] shadow-[0_16px_36px_rgba(0,0,0,0.7)] overflow-hidden font-sans ${className}`}
            style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif',
                WebkitAppRegion: 'drag',
            } as React.CSSProperties}
        >
            {/* Red Close Button on Hover */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#ff453a] hover:bg-[#ff3b30] text-white font-bold text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 cursor-pointer shadow"
                    title="Close ChatGPT"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                >
                    ✕
                </button>
            )}

            {/* Toast Notification */}
            {toast && (
                <div
                    className="absolute top-2 left-4 right-4 z-40 p-1.5 rounded-xl bg-[#10a37f] text-white text-[11px] font-medium text-center shadow-lg animate-fade-in truncate"
                    style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                >
                    {toast}
                </div>
            )}

            {/* EXACT MATCH TO USER REFERENCE IMAGE:
                Top Pill: Rounded full pill with OpenAI flower icon + "Ask anything" placeholder
            */}
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    handleSendPrompt()
                }}
                className="w-full"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
                <div className="w-full h-12 flex items-center rounded-full bg-[#38383a] hover:bg-[#404044] focus-within:bg-[#404044] border border-white/[0.08] focus-within:border-white/20 px-3.5 transition-all shadow-md">
                    {/* OpenAI Rosette Logo SVG */}
                    <div className="mr-3 flex-shrink-0 text-white cursor-pointer hover:opacity-80 transition-opacity" onClick={handleOpenApp} title="Open ChatGPT App">
                        <svg className="w-[22px] h-[22px] text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21.578 9.07a5.955 5.955 0 0 0-.48-3.666 6.046 6.046 0 0 0-4.04-3.11 6.033 6.033 0 0 0-5.32 1.258 6.038 6.038 0 0 0-4.498.053 6.048 6.048 0 0 0-3.37 3.824 6.03 6.03 0 0 0 .546 5.437 5.958 5.958 0 0 0-.48 3.667 6.047 6.047 0 0 0 4.04 3.11 6.033 6.033 0 0 0 5.32-1.258 6.04 6.04 0 0 0 4.498-.053 6.048 6.048 0 0 0 3.37-3.824 6.03 6.03 0 0 0-.546-5.438zm-8.318 11.23a4.57 4.57 0 0 1-2.91-1.042l.142-.08 3.498-2.02a.76.76 0 0 0 .383-.664v-4.94l1.488.86v4.067a4.58 4.58 0 0 1-2.6 3.82zm-7.697-3.32a4.568 4.568 0 0 1-.546-3.05l.143.085 3.497 2.02a.768.768 0 0 0 .767 0l4.278-2.47v1.72l-3.52 2.032a4.58 4.58 0 0 1-4.619-.337zm-1.12-8.37a4.569 4.569 0 0 1 2.365-2.008V9.1a.76.76 0 0 0 .383.663l4.28 2.47-1.488.86-3.52-2.033a4.583 4.583 0 0 1-2.02-4.46zm14.493 3.61l-4.278-2.47 1.488-.86 3.52 2.033a4.58 4.58 0 0 1 2.02 4.46 4.57 4.57 0 0 1-2.365 2.008v-2.498a.76.76 0 0 0-.385-.663zm2.502-3.23l-.143-.085-3.498-2.02a.768.768 0 0 0-.767 0l-4.278 2.47V7.635l3.52-2.032a4.58 4.58 0 0 1 5.165 3.385v.002zm-9.84-2.54a4.57 4.57 0 0 1 2.91 1.042l-.142.08-3.498 2.02a.76.76 0 0 0-.383.664v4.94l-1.488-.86V7.27a4.58 4.58 0 0 1 2.6-3.82z" />
                        </svg>
                    </div>

                    {/* Text input with "Ask anything" */}
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask anything"
                        className="flex-1 bg-transparent text-[15px] text-white placeholder-[#9a9a9e] focus:outline-none font-sans"
                    />

                    {/* Send button */}
                    <button
                        type="submit"
                        className={`ml-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            query.trim()
                                ? 'bg-white text-black hover:scale-110 shadow-md font-bold text-xs'
                                : 'text-white/25 hover:text-white/50 text-xs'
                        }`}
                        title="Send to ChatGPT"
                    >
                        ↑
                    </button>
                </div>
            </form>

            {/* EXACT MATCH TO USER REFERENCE IMAGE:
                Bottom Row of 4 Circular Action Buttons:
                1. Camera 📷
                2. Photo/Image 🖼
                3. Audio Waveform 〰
                4. Microphone 🎙
            */}
            <div
                className="grid grid-cols-4 gap-3.5 w-full"
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
                {/* 1. Camera Button */}
                <button
                    type="button"
                    onClick={handleCameraAction}
                    className="h-12 rounded-full bg-[#38383a] hover:bg-[#404044] active:scale-95 border border-white/[0.08] flex items-center justify-center text-white transition-all cursor-pointer shadow-md group/btn"
                    title="Camera & Screenshot Analysis"
                >
                    <svg className="w-[22px] h-[22px] text-white group-hover/btn:scale-105 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                        <circle cx="12" cy="13" r="3.2"/>
                    </svg>
                </button>

                {/* 2. Photo / Gallery Button */}
                <button
                    type="button"
                    onClick={handleImageAction}
                    className="h-12 rounded-full bg-[#38383a] hover:bg-[#404044] active:scale-95 border border-white/[0.08] flex items-center justify-center text-white transition-all cursor-pointer shadow-md group/btn"
                    title="Photo & Image Analysis"
                >
                    <svg className="w-[22px] h-[22px] text-white group-hover/btn:scale-105 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="4"/>
                        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                        <path d="m21 15-5-5L5 21"/>
                    </svg>
                </button>

                {/* 3. Audio Waveform Button */}
                <button
                    type="button"
                    onClick={handleVoiceModeAction}
                    className="h-12 rounded-full bg-[#38383a] hover:bg-[#404044] active:scale-95 border border-white/[0.08] flex items-center justify-center text-white transition-all cursor-pointer shadow-md group/btn"
                    title="Voice Conversation Mode"
                >
                    <div className="flex items-center gap-[3.5px] group-hover/btn:scale-105 transition-transform">
                        <span className="w-[3px] h-[8px] bg-white rounded-full" />
                        <span className="w-[3px] h-[18px] bg-white rounded-full animate-pulse" />
                        <span className="w-[3px] h-[14px] bg-white rounded-full" />
                        <span className="w-[3px] h-[8px] bg-white rounded-full" />
                    </div>
                </button>

                {/* 4. Microphone Button */}
                <button
                    type="button"
                    onClick={handleMicAction}
                    className={`h-12 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-md group/btn ${
                        isListening
                            ? 'bg-[#ff453a] border-[#ff453a] text-white animate-pulse'
                            : 'bg-[#38383a] hover:bg-[#404044] border-white/[0.08] text-white active:scale-95'
                    }`}
                    title="Microphone Voice Dictation"
                >
                    <svg className="w-[22px] h-[22px] text-white group-hover/btn:scale-105 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="22"/>
                    </svg>
                </button>
            </div>
        </div>
    )
}
