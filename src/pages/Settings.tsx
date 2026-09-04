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

    useEffect(() => {
        window.electronAPI.settings.getAll().then((s) => {
            if (s) {
                setSettings({ ...DEFAULT_SETTINGS, ...s })
                setUsername(s.username || 'Developer')
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

            {/* Integrations (Phase 2 — coming soon) */}
            <Card>
                <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">🔌</span>
                    <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Integrations</span>
                    <span className="text-[9px] text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">Phase 2</span>
                </div>
                <div className="divide-y divide-surface-border opacity-60 pointer-events-none">
                    <Toggle settingKey="githubIntegration" label="GitHub" description="Commit and PR tracking" />
                    <Toggle settingKey="leetcodeIntegration" label="LeetCode" description="Problem solving tracker" />
                    <Toggle settingKey="gmailIntegration" label="Gmail" description="Unread mail count" />
                    <Toggle settingKey="calendarIntegration" label="Google Calendar" description="Upcoming events" />
                    <Toggle settingKey="aiAnalysis" label="AI Analysis" description="Daily brief and insights" />
                </div>
                <div className="mt-2 text-[10px] text-text-muted text-center">
                    Integrations coming in Phase 2
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
