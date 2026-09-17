import { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import type { Settings } from '../types'

const DEFAULT_SETTINGS: Settings = {
    screenTimeTracking: 'true',
    githubIntegration: 'false',
    leetcodeIntegration: 'false',
    gmailIntegration: 'false',
    calendarIntegration: 'false',
    aiAnalysis: 'false',
    theme: 'dark',
    widgetMode: 'normal',
    alwaysOnTop: 'false',
    startWithWindows: 'false',
    dailyCodingGoalMinutes: '120',
    dailyFocusTarget: '4',
    entertainmentLimitMinutes: '60',
    focusDuration: '25',
    username: 'Developer',
    notificationsEnabled: 'true',
}

export function SettingsPage() {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
    const [saved, setSaved] = useState(false)
    const [username, setUsername] = useState('')
    const [chatgptInput, setChatgptInput] = useState('')
    const [apiKeyInput, setApiKeyInput] = useState('')

    useEffect(() => {
        window.electronAPI.settings.getAll().then((s) => {
            if (s) {
                setSettings({ ...DEFAULT_SETTINGS, ...s })
                setUsername(s.username || 'Developer')
                setChatgptInput(s.chatgpt_account_id || '')
                setApiKeyInput(s.openai_api_key || '')
            }
        })
    }, [])

    const setSetting = async (key: string, value: string) => {
        setSettings((prev) => ({ ...prev, [key]: value }))
        await window.electronAPI.settings.set(key, value)
        setSaved(true)
        setTimeout(() => setSaved(false), 1500)
    }

    const Toggle = ({ settingKey, label, description }: { settingKey: string; label: string; description?: string }) => {
        const on = settings[settingKey] === 'true'
        return (
            <div className="flex items-center justify-between py-2">
                <div>
                    <div className="text-xs text-text-primary">{label}</div>
                    {description && <div className="text-[10px] text-text-muted">{description}</div>}
                </div>
                <button
                    onClick={() => setSetting(settingKey, on ? 'false' : 'true')}
                    className={`relative w-9 h-5 rounded-full transition-colors ${on ? 'bg-accent' : 'bg-surface-border'}`}
                >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow ${on ? 'left-4' : 'left-0.5'}`} />
                </button>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide animate-fade-in">
            {/* Save status */}
            {saved && (
                <div className="text-[10px] text-accent-green text-center animate-fade-in">✓ Settings saved</div>
            )}

            {/* Profile */}
            <Card>
                <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-sm">👤</span>
                    <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Profile</span>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onBlur={() => setSetting('username', username)}
                        placeholder="Your name"
                        className="flex-1 bg-surface-hover border border-surface-border rounded-lg px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent transition-colors"
                    />
                </div>
            </Card>

            {/* Privacy */}
            <Card>
                <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">🔒</span>
                    <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Privacy</span>
                </div>
                <div className="divide-y divide-surface-border">
                    <Toggle settingKey="screenTimeTracking" label="Screen Time Tracking" description="Monitor app usage locally" />
                    <Toggle settingKey="notificationsEnabled" label="Notifications" description="Desktop alerts for focus, goals" />
                </div>
            </Card>

            {/* Desktop Widget & Windows Startup */}
            <Card>
                <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-sm">💻</span>
                    <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Desktop Widget & Windows Setup</span>
                </div>
                <div className="divide-y divide-surface-border">
                    <Toggle
                        settingKey="startWithWindows"
                        label="Start with Windows"
                        description="Auto-launch DevPulse when your laptop turns on"
                    />
                    <Toggle
                        settingKey="alwaysOnTop"
                        label="Always on Top"
                        description="Keep widget floating above other windows (VS Code, Chrome)"
                    />
                </div>

                <div className="mt-3 pt-2.5 border-t border-surface-border">
                    <div className="text-xs text-text-primary mb-1.5">Default Window Mode</div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {[
                            { id: 'canvas', name: 'Desktop Canvas', desc: 'macOS Wallpaper & Widgets' },
                            { id: 'normal', name: 'Sidebar Widget', desc: '440×700 Sleek Dock' },
                            { id: 'compact', name: '2×2 Small Widget', desc: '340×240 Mini Tile' },
                            { id: 'expanded', name: 'Dual Cockpit', desc: '960×720 Full Board' },
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => {
                                    setSetting('widgetMode', m.id)
                                    window.electronAPI.window.setMode(m.id as any)
                                }}
                                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                                    settings.widgetMode === m.id
                                        ? 'bg-accent/15 border-accent text-white shadow-sm'
                                        : 'bg-surface-hover border-surface-border text-text-secondary hover:text-white hover:border-white/20'
                                }`}
                            >
                                <div className="font-semibold">{m.name}</div>
                                <div className="text-[9px] text-text-muted">{m.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-3 pt-2 border-t border-surface-border text-[10px] text-text-muted flex items-start gap-1.5">
                    <span className="text-amber-400">💡</span>
                    <span>
                        DevPulse runs quietly in your <strong>Windows System Tray</strong> (bottom-right taskbar).
                        Closing the window minimizes to tray without losing your focus session. Right-click the tray icon to quit.
                    </span>
                </div>
            </Card>

            {/* Integrations */}
            <Card>
                <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-sm">🔌</span>
                    <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Connected Accounts</span>
                    <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">Active</span>
                </div>

                {/* LeetCode Connection */}
                <div className="p-2.5 rounded-xl bg-surface-base border border-surface-border mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                            <span className="text-amber-400 font-bold text-xs">⚡</span>
                            <span className="text-xs font-semibold text-text-primary">LeetCode Profile</span>
                        </div>
                        {settings.leetcode_username ? (
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                @{settings.leetcode_username}
                            </span>
                        ) : (
                            <span className="text-[10px] text-text-muted">Not connected</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="text"
                            defaultValue={settings.leetcode_username || ''}
                            placeholder="Enter LeetCode username (e.g. swethab01)"
                            onBlur={(e) => setSetting('leetcode_username', e.target.value.trim())}
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-surface-card border border-surface-border text-xs text-text-primary placeholder-text-muted/40 font-mono focus:outline-none focus:border-amber-400"
                        />
                        <button
                            type="button"
                            onClick={async () => {
                                const input = settings.leetcode_username
                                if (input && window.electronAPI?.leetcode?.getProfile) {
                                    const res = await window.electronAPI.leetcode.getProfile(input)
                                    if (res.success) {
                                        alert(`✓ Connected to LeetCode @${res.data?.username} (Solved: ${res.data?.solved.all}, Streak: ${res.data?.streak}d)`)
                                    } else {
                                        alert(`Error: ${res.message || 'User not found'}`)
                                    }
                                }
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors cursor-pointer"
                        >
                            Sync
                        </button>
                    </div>
                </div>

                {/* ChatGPT Connection */}
                <div className="p-3 rounded-xl bg-surface-base border border-surface-border mb-2">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <span className="text-emerald-400 font-bold text-xs">✦</span>
                            <span className="text-xs font-semibold text-text-primary">ChatGPT & OpenAI</span>
                        </div>
                        {settings.chatgpt_account_id ? (
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                                ✓ Connected: @{settings.chatgpt_account_id}
                            </span>
                        ) : (
                            <span className="text-[10px] text-text-muted">Not connected</span>
                        )}
                    </div>
                    <div className="space-y-3 mt-2">
                        {/* Main Account Email */}
                        <div>
                            <label className="block text-[10px] text-text-muted mb-1">ChatGPT Main Account ID / Email:</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={chatgptInput}
                                    onChange={(e) => setChatgptInput(e.target.value)}
                                    placeholder="e.g. sanjaynathiya81@gmail.com"
                                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-surface-card border border-surface-border text-xs text-text-primary placeholder-text-muted/40 font-mono focus:outline-none focus:border-emerald-400"
                                />
                                <button
                                    type="button"
                                    onClick={async () => {
                                        const cleanEmail = chatgptInput.trim()
                                        if (!cleanEmail) {
                                            alert('Please enter your ChatGPT account email.')
                                            return
                                        }
                                        await setSetting('chatgpt_account_id', cleanEmail)
                                        await setSetting('chatgptIntegration', 'true')
                                        alert(`✓ Connected! Linked main account: ${cleanEmail}`)
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors cursor-pointer shrink-0 shadow-sm"
                                >
                                    Connect
                                </button>
                            </div>
                        </div>

                        {/* Direct Session Launch Buttons */}
                        <div className="flex items-center gap-2 pt-0.5">
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.electronAPI?.chatgpt?.openDesktopWeb) {
                                        window.electronAPI.chatgpt.openDesktopWeb()
                                    } else {
                                        window.open('https://chatgpt.com', '_blank')
                                    }
                                }}
                                className="flex-1 py-1.5 px-3 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                                title="Open persistent ChatGPT session window to log into your account"
                            >
                                <span>🌐</span>
                                <span>Log In to ChatGPT Session</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.electronAPI?.chatgpt?.openApp) {
                                        window.electronAPI.chatgpt.openApp()
                                    } else {
                                        window.open('https://chatgpt.com', '_blank')
                                    }
                                }}
                                className="py-1.5 px-3 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                                title="Launch the Windows ChatGPT Desktop App"
                            >
                                <span>🖥️</span>
                                <span>Open Desktop App</span>
                            </button>
                        </div>

                        {/* Optional OpenAI API Key */}
                        <div className="pt-2 border-t border-surface-border/50">
                            <label className="block text-[10px] text-text-muted mb-1">OpenAI API Key (Optional, for in-widget instant AI):</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="password"
                                    value={apiKeyInput}
                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                    placeholder="sk-..."
                                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-surface-card border border-surface-border text-xs text-text-primary placeholder-text-muted/40 font-mono focus:outline-none focus:border-emerald-400"
                                />
                                <button
                                    type="button"
                                    onClick={async () => {
                                        const key = apiKeyInput.trim()
                                        if (!key) {
                                            await setSetting('openai_api_key', '')
                                            alert('API Key cleared.')
                                            return
                                        }
                                        if (window.electronAPI?.chatgpt?.verifyKey) {
                                            const res = await window.electronAPI.chatgpt.verifyKey(key)
                                            if (res.valid) {
                                                await setSetting('openai_api_key', key)
                                                alert('✓ OpenAI API Key verified and saved successfully!')
                                            } else {
                                                alert(`API Key check: ${res.error || 'Invalid key'}`)
                                            }
                                        } else {
                                            await setSetting('openai_api_key', key)
                                            alert('✓ API Key saved!')
                                        }
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer shrink-0"
                                >
                                    Save Key
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Productivity */}
            <Card>
                <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-sm">⚡</span>
                    <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Productivity</span>
                </div>

                <NumberSetting
                    label="Daily Coding Goal"
                    unit="min"
                    value={settings.dailyCodingGoalMinutes}
                    onChange={(v) => setSetting('dailyCodingGoalMinutes', v)}
                />
                <NumberSetting
                    label="Daily Focus Target"
                    unit="sessions"
                    value={settings.dailyFocusTarget}
                    onChange={(v) => setSetting('dailyFocusTarget', v)}
                />
                <NumberSetting
                    label="Entertainment Limit"
                    unit="min/day"
                    value={settings.entertainmentLimitMinutes}
                    onChange={(v) => setSetting('entertainmentLimitMinutes', v)}
                />
                <NumberSetting
                    label="Default Focus Duration"
                    unit="min"
                    value={settings.focusDuration}
                    onChange={(v) => setSetting('focusDuration', v)}
                />
            </Card>

            {/* Privacy transparency */}
            <div className="px-3 py-2 bg-surface-card border border-surface-border rounded-xl">
                <div className="text-[10px] text-text-muted leading-relaxed">
                    🔒 <strong className="text-text-secondary">Privacy First</strong> — DevPulse stores all data locally on your device.
                    No passwords, no screenshots, no keylogging, no external uploads.
                    Only app names and usage durations are tracked.
                </div>
            </div>
        </div>
    )
}

function NumberSetting({
    label,
    unit,
    value,
    onChange,
}: {
    label: string
    unit: string
    value: string
    onChange: (v: string) => void
}) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
            <span className="text-xs text-text-secondary">{label}</span>
            <div className="flex items-center gap-1.5">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-14 bg-surface-hover border border-surface-border rounded px-1.5 py-0.5 text-xs text-text-primary outline-none font-mono text-right"
                />
                <span className="text-[10px] text-text-muted">{unit}</span>
            </div>
        </div>
    )
}
