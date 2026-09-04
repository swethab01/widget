import { ipcMain } from 'electron'
import { getPulseInsight } from '../services/PulseEngine'

export function registerPulseIPC(isFocusActive: () => boolean) {
    ipcMain.handle('pulse:insight', () => getPulseInsight({ focusActive: isFocusActive() }))
}
