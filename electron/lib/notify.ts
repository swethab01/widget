import { Notification } from 'electron'
import { getDB } from '../database'

export function notify(title: string, body: string) {
    try {
        const row = getDB()
            .prepare("SELECT value FROM settings WHERE key = 'notificationsEnabled'")
            .get() as { value: string } | undefined
        if (row?.value !== 'true') return
        if (!Notification.isSupported()) return
        new Notification({ title, body }).show()
    } catch {
        // ignore notification failures
    }
}
