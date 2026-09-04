import { ipcMain } from 'electron'
import { getDB } from '../database'

type SettingsChangeHandler = (key: string, value: string) => void
let onSettingChange: SettingsChangeHandler | null = null

export function setSettingsChangeHandler(fn: SettingsChangeHandler) {
    onSettingChange = fn
}

export function getSetting(key: string, fallback = ''): string {
    const row = getDB()
        .prepare('SELECT value FROM settings WHERE key = ?')
        .get(key) as { value: string } | undefined
    return row?.value ?? fallback
}

export function registerSettingsIPC() {
    const db = getDB()

    ipcMain.handle('settings:get', (_e, key: string) => {
        const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined
        return row?.value ?? null
    })

    ipcMain.handle('settings:getAll', () => {
        const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]
        const result: Record<string, string> = {}
        for (const row of rows) result[row.key] = row.value
        return result
    })

    ipcMain.handle('settings:set', (_e, key: string, value: string) => {
        db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value)
        onSettingChange?.(key, value)
        return { success: true }
    })
}
