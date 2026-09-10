import { BrowserWindow, app } from 'electron'
import path from 'path'
import fs from 'fs'
import { spawn, ChildProcess } from 'child_process'

let daemonProcess: ChildProcess | null = null
let executablePath: string | null = null

function resolveExecutable(): string | null {
    if (executablePath && fs.existsSync(executablePath)) {
        return executablePath
    }

    const candidates = [
        path.join(process.resourcesPath, 'desktop-pin.exe'),
        path.join(__dirname, '../bin/desktop-pin.exe'),
        path.join(__dirname, 'desktop-pin.exe'),
        path.join(app.getAppPath(), 'electron/bin/desktop-pin.exe'),
        path.join(app.getAppPath(), 'dist-electron/desktop-pin.exe'),
    ]

    for (const c of candidates) {
        if (fs.existsSync(c)) {
            executablePath = c
            return c
        }
    }
    return null
}

function startDaemon(): ChildProcess | null {
    if (process.platform !== 'win32') return null
    if (daemonProcess && !daemonProcess.killed) {
        return daemonProcess
    }

    const exe = resolveExecutable()
    if (!exe) {
        console.warn('[DesktopPin] desktop-pin.exe not found. Desktop pinning will fallback to electron methods.')
        return null
    }

    try {
        daemonProcess = spawn(exe, [], {
            stdio: ['pipe', 'pipe', 'ignore'],
            windowsHide: true,
        })

        daemonProcess.on('error', (err) => {
            console.error('[DesktopPin] Daemon error:', err)
            daemonProcess = null
        })

        daemonProcess.on('exit', () => {
            daemonProcess = null
        })

        return daemonProcess
    } catch (err) {
        console.error('[DesktopPin] Failed to spawn daemon:', err)
        return null
    }
}

function sendCommand(cmd: string, hwnd: string): void {
    if (process.platform !== 'win32') return

    const daemon = startDaemon()
    if (daemon && daemon.stdin && daemon.stdin.writable) {
        try {
            daemon.stdin.write(`${cmd} ${hwnd}\n`)
            return
        } catch (e) {
            console.error('[DesktopPin] Failed to write to stdin:', e)
        }
    }

    // Fallback: spawn one-off command if daemon is unavailable
    const exe = resolveExecutable()
    if (exe) {
        try {
            spawn(exe, [cmd, hwnd], { windowsHide: true, stdio: 'ignore' }).unref()
        } catch {}
    }
}

export function getWindowHwnd(win: BrowserWindow): string | null {
    try {
        if (win.isDestroyed()) return null
        const handle = win.getNativeWindowHandle()
        if (handle.length >= 8) {
            return handle.readBigUInt64LE(0).toString()
        }
        return handle.readUInt32LE(0).toString()
    } catch {
        return null
    }
}

/**
 * Pins an Electron BrowserWindow directly to the desktop wallpaper level:
 * - Clears WS_EX_TOPMOST
 * - Clears WS_EX_TOOLWINDOW (prevents floating above active apps)
 * - Sends to HWND_BOTTOM (behind all application windows, sits directly on desktop)
 */
export function pinWindowToDesktopBottom(win: BrowserWindow): void {
    if (process.platform !== 'win32') return
    if (!win || win.isDestroyed()) return

    const hwnd = getWindowHwnd(win)
    if (!hwnd) return

    sendCommand('bottom', hwnd)
}

/**
 * Sets a window to always on top (float) or pins back to desktop wallpaper
 */
export function setWindowDesktopMode(win: BrowserWindow, alwaysOnTop: boolean): void {
    if (!win || win.isDestroyed()) return

    if (alwaysOnTop) {
        win.setAlwaysOnTop(true, 'floating')
        const hwnd = getWindowHwnd(win)
        if (hwnd) sendCommand('topmost', hwnd)
    } else {
        win.setAlwaysOnTop(false)
        pinWindowToDesktopBottom(win)
    }
}

export function stopDesktopPinDaemon(): void {
    if (daemonProcess) {
        try {
            daemonProcess.kill()
        } catch {}
        daemonProcess = null
    }
}
