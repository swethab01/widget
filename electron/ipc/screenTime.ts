import { ipcMain } from 'electron'
import { getDB } from '../database'
import type { ScreenTimeService } from '../services/ScreenTimeService'

// We'll import to get the singleton instance from main via a module-level ref
let serviceRef: ScreenTimeService | null = null

export function setScreenTimeServiceRef(s: ScreenTimeService) {
    serviceRef = s
}

export function registerScreenTimeIPC() {
    const db = getDB()

    ipcMain.handle('screenTime:getToday', () => {
        if (serviceRef) return serviceRef.getSummary()
        // Fallback: read from DB only
        const today = new Date().toISOString().split('T')[0]
        const rows = db.prepare(
            'SELECT app_name, category, duration_seconds FROM app_usage WHERE date = ? ORDER BY duration_seconds DESC'
        ).all(today) as { app_name: string; category: string; duration_seconds: number }[]

        const totalSeconds = rows.reduce((s, r) => s + r.duration_seconds, 0)
        const codingSeconds = rows.filter((r) => r.category === 'Development').reduce((s, r) => s + r.duration_seconds, 0)
        const entertainmentSeconds = rows.filter((r) => r.category === 'Entertainment').reduce((s, r) => s + r.duration_seconds, 0)
        const productiveSeconds = rows.filter((r) => ['Development', 'Productivity'].includes(r.category)).reduce((s, r) => s + r.duration_seconds, 0)

        return { totalSeconds, codingSeconds, entertainmentSeconds, productiveSeconds, apps: rows.slice(0, 8) }
    })

    ipcMain.handle('screenTime:getSummary', () => {
        const days = 7
        const results = []
        for (let i = 0; i < days; i++) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const date = d.toISOString().split('T')[0]
            const row = db.prepare(`
        SELECT COALESCE(SUM(duration_seconds), 0) as total,
               COALESCE(SUM(CASE WHEN category='Development' THEN duration_seconds ELSE 0 END), 0) as coding
        FROM app_usage WHERE date = ?
      `).get(date) as { total: number; coding: number }
            results.push({ date, totalSeconds: row.total, codingSeconds: row.coding })
        }
        return results.reverse()
    })

    ipcMain.handle('score:getToday', () => {
        const today = new Date().toISOString().split('T')[0]
        const row = db.prepare('SELECT * FROM daily_scores WHERE date = ?').get(today) as Record<string, number | string> | undefined
        if (!row) return { date: today, score: 0, tasks_pts: 0, focus_pts: 0, coding_pts: 0, distraction_pts: 0 }
        return row
    })

    ipcMain.handle('score:getHistory', (_e, days: number) => {
        const results = []
        for (let i = 0; i < days; i++) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const date = d.toISOString().split('T')[0]
            const row = db.prepare('SELECT * FROM daily_scores WHERE date = ?').get(date) as Record<string, number | string> | undefined
            results.push(row || { date, score: 0, tasks_pts: 0, focus_pts: 0, coding_pts: 0, distraction_pts: 0 })
        }
        return results.reverse()
    })
}
