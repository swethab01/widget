import { ipcMain } from 'electron'
import { getDB } from '../database'

export function registerScratchpadIPC() {
    const db = getDB()

    ipcMain.handle('scratchpad:get', () => {
        const row = db.prepare('SELECT content, updated_at FROM scratchpad WHERE id = 1').get() as
            | { content: string; updated_at: string }
            | undefined
        return row || { content: '', updated_at: new Date().toISOString() }
    })

    ipcMain.handle('scratchpad:save', (_e, content: string) => {
        db.prepare(`
            INSERT INTO scratchpad (id, content, updated_at)
            VALUES (1, @content, datetime('now', 'localtime'))
            ON CONFLICT(id) DO UPDATE SET content = excluded.content, updated_at = datetime('now', 'localtime')
        `).run({ content })
        return { success: true }
    })
}
