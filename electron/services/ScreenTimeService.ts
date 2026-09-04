import { exec } from 'child_process'
import { promisify } from 'util'
import { getDB } from '../database'

const execAsync = promisify(exec)

// App category mapping
const APP_CATEGORIES: Record<string, string> = {
    // Development
    code: 'Development',
    cursor: 'Development',
    'webstorm64': 'Development',
    'idea64': 'Development',
    rider64: 'Development',
    pycharm64: 'Development',
    'android studio': 'Development',
    devenv: 'Development',
    notepad: 'Development',
    sublime_text: 'Development',
    atom: 'Development',
    vim: 'Development',
    nvim: 'Development',

    // Terminal
    windowsterminal: 'Development',
    powershell: 'Development',
    cmd: 'Development',
    'git bash': 'Development',
    wt: 'Development',
    'ubuntu': 'Development',

    // Browser (neutral — categorized by title later)
    chrome: 'Browser',
    msedge: 'Browser',
    firefox: 'Browser',
    brave: 'Browser',
    opera: 'Browser',

    // Communication
    slack: 'Communication',
    teams: 'Communication',
    discord: 'Communication',
    zoom: 'Communication',
    skype: 'Communication',
    outlook: 'Communication',
    thunderbird: 'Communication',

    // Entertainment
    spotify: 'Entertainment',
    vlc: 'Entertainment',
    netflix: 'Entertainment',

    // Productivity
    notion: 'Productivity',
    obsidian: 'Productivity',
    onenote: 'Productivity',
    excel: 'Productivity',
    word: 'Productivity',
    powerpoint: 'Productivity',
    acrobat: 'Productivity',

    // System
    explorer: 'System',
    taskmgr: 'System',
    systemsettings: 'System',
}

// Window titles that indicate certain categories for browser usage
const ENTERTAINMENT_URLS = ['youtube', 'netflix', 'twitch', 'reddit', 'instagram', 'facebook', 'twitter', 'tiktok']
const CODING_URLS = ['github', 'stackoverflow', 'leetcode', 'hackerrank', 'codepen', 'codesandbox', 'replit', 'kaggle']

function categorizeApp(appName: string, windowTitle: string): string {
    const nameLower = appName.toLowerCase()
    const titleLower = windowTitle.toLowerCase()

    for (const [key, cat] of Object.entries(APP_CATEGORIES)) {
        if (nameLower.includes(key)) {
            // For browsers, use window title to refine category
            if (cat === 'Browser') {
                if (ENTERTAINMENT_URLS.some((u) => titleLower.includes(u))) return 'Entertainment'
                if (CODING_URLS.some((u) => titleLower.includes(u))) return 'Development'
                return 'Browser'
            }
            return cat
        }
    }
    return 'Other'
}

interface AppUsageRecord {
    appName: string
    windowTitle: string
    category: string
    durationSeconds: number
}

export class ScreenTimeService {
    private intervalId: ReturnType<typeof setInterval> | null = null
    private sessionData: Map<string, AppUsageRecord> = new Map()
    private lastFlush = Date.now()
    private onUpdate: (summary: unknown) => void
    private isTracking = true
    private readonly POLL_INTERVAL_MS = 5000
    private readonly FLUSH_INTERVAL_MS = 30000
    private currentApp = ''
    private currentTitle = ''
    private currentStart = Date.now()

    constructor(onUpdate: (summary: unknown) => void) {
        this.onUpdate = onUpdate
    }

    start() {
        this.poll()
        this.intervalId = setInterval(() => this.poll(), this.POLL_INTERVAL_MS)
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
        this.flushToDatabase()
    }

    setTracking(enabled: boolean) {
        this.isTracking = enabled
        if (!enabled) {
            this.sessionData.clear()
        }
    }

    private async poll() {
        if (!this.isTracking) return
        try {
            const result = await this.getForegroundApp()
            if (result) {
                this.accumulate(result.appName, result.windowTitle)
            }

            // Flush every 30s
            if (Date.now() - this.lastFlush > this.FLUSH_INTERVAL_MS) {
                this.flushToDatabase()
                this.lastFlush = Date.now()
                this.onUpdate(this.getSummary())
            }
        } catch {
            // silently skip on error
        }
    }

    private async getForegroundApp(): Promise<{ appName: string; windowTitle: string } | null> {
        try {
            const ps = `
        Add-Type @"
          using System;
          using System.Runtime.InteropServices;
          using System.Text;
          public class FG {
            [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
            [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
            [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint p);
          }
"@
        $hw = [FG]::GetForegroundWindow()
        $sb = New-Object System.Text.StringBuilder 256
        [FG]::GetWindowText($hw, $sb, 256) | Out-Null
        $pid = 0
        [FG]::GetWindowThreadProcessId($hw, [ref]$pid) | Out-Null
        $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($proc) {
          Write-Output "$($proc.ProcessName)|$($sb.ToString())"
        }
      `
            const { stdout } = await execAsync(`powershell -NoProfile -NonInteractive -Command "${ps.replace(/\n/g, ' ')}"`, { timeout: 4000 })
            const line = stdout.trim()
            if (!line.includes('|')) return null
            const [appName, ...titleParts] = line.split('|')
            return { appName: appName.trim(), windowTitle: titleParts.join('|').trim() }
        } catch {
            // Fallback: get running windows
            try {
                const { stdout } = await execAsync(
                    'powershell -NoProfile -NonInteractive -Command "Get-Process | Where-Object {$_.MainWindowTitle -ne \'\'} | Select-Object -First 1 | ForEach-Object { $_.ProcessName + \'|\' + $_.MainWindowTitle }"',
                    { timeout: 3000 }
                )
                const line = stdout.trim()
                if (!line.includes('|')) return null
                const [appName, ...titleParts] = line.split('|')
                return { appName: appName.trim(), windowTitle: titleParts.join('|').trim() }
            } catch {
                return null
            }
        }
    }

    private accumulate(appName: string, windowTitle: string) {
        const key = appName.toLowerCase()
        const category = categorizeApp(appName, windowTitle)
        const existing = this.sessionData.get(key)
        if (existing) {
            existing.durationSeconds += this.POLL_INTERVAL_MS / 1000
            existing.windowTitle = windowTitle
        } else {
            this.sessionData.set(key, {
                appName,
                windowTitle,
                category,
                durationSeconds: this.POLL_INTERVAL_MS / 1000,
            })
        }
    }

    private flushToDatabase() {
        if (this.sessionData.size === 0) return
        const db = getDB()
        const today = new Date().toISOString().split('T')[0]

        const upsert = db.prepare(`
      INSERT INTO app_usage (app_name, window_title, category, date, duration_seconds, last_seen)
      VALUES (@appName, @windowTitle, @category, @date, @durationSeconds, datetime('now','localtime'))
      ON CONFLICT DO NOTHING
    `)

        const update = db.prepare(`
      UPDATE app_usage
      SET duration_seconds = duration_seconds + @durationSeconds,
          window_title = @windowTitle,
          last_seen = datetime('now','localtime')
      WHERE app_name = @appName AND date = @date
    `)

        const flush = db.transaction(() => {
            for (const [, record] of this.sessionData) {
                const existing = db.prepare(
                    'SELECT id FROM app_usage WHERE app_name = ? AND date = ?'
                ).get(record.appName, today)

                if (existing) {
                    update.run({ appName: record.appName, windowTitle: record.windowTitle, durationSeconds: record.durationSeconds, date: today })
                } else {
                    upsert.run({ appName: record.appName, windowTitle: record.windowTitle, category: record.category, durationSeconds: record.durationSeconds, date: today })
                }
            }
        })

        flush()
        // Reset session accumulator after flush
        this.sessionData.clear()
    }

    getSummary() {
        const db = getDB()
        const today = new Date().toISOString().split('T')[0]
        const rows = db.prepare(
            'SELECT app_name, window_title, category, duration_seconds FROM app_usage WHERE date = ? ORDER BY duration_seconds DESC'
        ).all(today) as { app_name: string; window_title: string; category: string; duration_seconds: number }[]

        // Add in-memory unsaved data
        const merged = new Map<string, { appName: string; windowTitle: string; category: string; durationSeconds: number }>()
        for (const row of rows) {
            merged.set(row.app_name.toLowerCase(), {
                appName: row.app_name,
                windowTitle: row.window_title,
                category: row.category,
                durationSeconds: row.duration_seconds,
            })
        }
        for (const [key, record] of this.sessionData) {
            const ex = merged.get(key)
            if (ex) {
                ex.durationSeconds += record.durationSeconds
            } else {
                merged.set(key, { ...record })
            }
        }

        const apps = Array.from(merged.values()).sort((a, b) => b.durationSeconds - a.durationSeconds)
        const totalSeconds = apps.reduce((s, a) => s + a.durationSeconds, 0)
        const codingSeconds = apps.filter((a) => a.category === 'Development').reduce((s, a) => s + a.durationSeconds, 0)
        const entertainmentSeconds = apps.filter((a) => a.category === 'Entertainment').reduce((s, a) => s + a.durationSeconds, 0)
        const communicationSeconds = apps.filter((a) => a.category === 'Communication').reduce((s, a) => s + a.durationSeconds, 0)
        const productiveSeconds = codingSeconds + apps.filter((a) => a.category === 'Productivity').reduce((s, a) => s + a.durationSeconds, 0)

        return {
            totalSeconds,
            codingSeconds,
            entertainmentSeconds,
            communicationSeconds,
            productiveSeconds,
            apps: apps.slice(0, 8),
        }
    }
}
