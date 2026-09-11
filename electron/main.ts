import { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, shell, screen } from 'electron'
import path from 'path'
import fs from 'fs'
import { exec, spawn } from 'child_process'
import { initDatabase } from './database'
import { registerTaskIPC } from './ipc/tasks'
import { isFocusActive, registerFocusIPC } from './ipc/focus'
import { registerScreenTimeIPC, setScreenTimeServiceRef } from './ipc/screenTime'
import { getSetting, saveSetting, registerSettingsIPC, setSettingsChangeHandler } from './ipc/settings'
import { registerPulseIPC } from './ipc/pulse'
import { registerGitIPC } from './ipc/git'
import { registerScratchpadIPC } from './ipc/scratchpad'
import { registerLeetCodeIPC } from './ipc/leetcode'
import { registerAIIPC } from './ipc/ai'
import { ScreenTimeService } from './services/ScreenTimeService'
import { getPulseInsight } from './services/PulseEngine'
import { pinWindowToDesktopBottom, setWindowDesktopMode, stopDesktopPinDaemon } from './lib/desktopPin'

const isDev = process.env.NODE_ENV === 'development'

// Production single-instance lock to prevent SQLite file conflicts and duplicate instances
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.quit()
}

process.on('uncaughtException', (err) => {
    console.error('[DevPulse Main] Uncaught Exception:', err)
})
process.on('unhandledRejection', (reason) => {
    console.error('[DevPulse Main] Unhandled Rejection:', reason)
})

let tray: Tray | null = null
let screenTimeService: ScreenTimeService | null = null
let managerWindow: BrowserWindow | null = null

// Map of currently open desktop widget windows: widgetId -> BrowserWindow
const openWidgetWindows = new Map<string, BrowserWindow>()

// Precise dimensions for each individual desktop widget card
const WIDGET_DIMENSIONS: Record<string, { width: number; height: number }> = {
    'leetcode': { width: 330, height: 320 },
    'tasks': { width: 330, height: 380 },
    'goals': { width: 330, height: 360 },
    'chatgpt': { width: 320, height: 140 },
    'launchpad': { width: 320, height: 164 },
    'screentime': { width: 176, height: 176 },
    'kev-clock': { width: 176, height: 176 },
    'kev-battery': { width: 176, height: 176 },
    'kev-weather': { width: 320, height: 160 },
    'kev-calendar': { width: 320, height: 160 },
    'kev-music': { width: 320, height: 160 },
    'kev-comic': { width: 220, height: 260 },
    'kev-cd': { width: 176, height: 176 },
    'kev-quote': { width: 176, height: 176 },
    'kev-date': { width: 176, height: 176 },
    'kev-photo': { width: 176, height: 176 },
    'kev-appstack': { width: 220, height: 220 },
    'focus': { width: 340, height: 260 },
    'score': { width: 200, height: 200 },
    'clock': { width: 300, height: 200 },
}

const WIDGET_TITLES: Record<string, string> = {
    'leetcode': '⚡ LeetCode Daily Problem',
    'screentime': '⏱ Laptop Screen Time & Apps',
    'chatgpt': '🤖 ChatGPT Search Box',
    'launchpad': '🚀 Developer App Launchpad (8 Apps)',
    'tasks': "📋 Today's Tasks Checklist",
    'goals': '🎯 Habits & Goals Tracker',
    'focus': '⏱ Pomodoro Focus Timer',
    'score': '⭕ Activity Score Rings',
    'kev-clock': '⌚ Apple Minimal Clock',
    'kev-battery': '🔋 Laptop Battery Monitor',
    'kev-weather': '🌦 Weather Forecast (Doha/Tokyo)',
    'kev-calendar': '📅 Monthly Calendar',
    'kev-music': '🎵 Dominic Fike Music Player',
    'kev-cd': '🕷️ Spider-Man CD Player',
    'kev-comic': '🕷️ Spider-Man Comic Art',
    'kev-quote': '💡 Daily Inspiration Quote',
    'kev-date': '📅 Spidey Wednesday Date Tile',
    'kev-photo': '📷 Sweet Recipe Photo Tile',
    'kev-appstack': '📱 App Stack Widget',
}

function getAppIcon(): string | undefined {
    const iconCandidates = [
        path.join(process.resourcesPath, 'icon.png'),
        path.join(__dirname, '../dist/icon.png'),
        path.join(__dirname, '../public/icon.png'),
        path.join(process.resourcesPath, 'icon.ico'),
        path.join(__dirname, '../dist/icon.ico'),
        path.join(__dirname, '../public/icon.ico'),
    ]
    for (const p of iconCandidates) {
        if (fs.existsSync(p)) return p
    }
    return undefined
}

function getStoredActiveWidgets(): string[] {
    try {
        const val = getSetting('active_desktop_widgets', 'NOT_SET')
        if (val !== 'NOT_SET' && val !== '') {
            const parsed = JSON.parse(val)
            if (Array.isArray(parsed)) {
                // If user explicitly saved an empty list, respect it (never force unwanted widgets!)
                return parsed.filter((id: string) => !id.startsWith('kev-'))
            }
        }
    } catch {}
    // First run default only if setting was never saved
    return ['leetcode', 'screentime', 'chatgpt', 'launchpad', 'tasks']
}

function saveStoredActiveWidgets(widgets: string[]) {
    saveSetting('active_desktop_widgets', JSON.stringify(widgets))
    for (const win of openWidgetWindows.values()) {
        if (!win.isDestroyed()) win.webContents.send('widgets:activeChanged', widgets)
    }
    if (managerWindow && !managerWindow.isDestroyed()) {
        managerWindow.webContents.send('widgets:activeChanged', widgets)
    }
    updateTrayMenu()
}

/**
 * Creates an individual, 100% transparent floating desktop widget window directly on the wallpaper
 */
function createWidgetWindow(widgetId: string): BrowserWindow {
    // If already open, focus it
    if (openWidgetWindows.has(widgetId)) {
        const existing = openWidgetWindows.get(widgetId)!
        if (!existing.isDestroyed()) {
            existing.show()
            existing.focus()
            return existing
        }
    }

    const defaultDims = WIDGET_DIMENSIONS[widgetId] || { width: 240, height: 240 }
    let dims = { ...defaultDims }
    try {
        const savedSize = getSetting(`widget_size_${widgetId}`, '')
        if (savedSize) {
            const s = JSON.parse(savedSize)
            if (typeof s.width === 'number' && typeof s.height === 'number') {
                const minAllowedW = Math.min(160, defaultDims.width)
                const minAllowedH = Math.min(100, defaultDims.height)
                dims = { width: Math.max(minAllowedW, s.width), height: Math.max(minAllowedH, s.height) }
            }
        }
    } catch {}

    // Position on desktop: check persisted position or compute smart default placement
    let posX = 100
    let posY = 100
    try {
        const saved = getSetting(`widget_pos_${widgetId}`, '')
        if (saved) {
            const p = JSON.parse(saved)
            if (typeof p.x === 'number' && typeof p.y === 'number') {
                posX = p.x
                posY = p.y
            }
        } else {
            const primary = screen.getPrimaryDisplay()
            const { width: screenW } = primary.workAreaSize

            if (widgetId === 'kev-clock') {
                posX = screenW - dims.width - 30
                posY = 40
            } else if (widgetId === 'kev-battery') {
                posX = screenW - dims.width - 30
                posY = 290
            } else if (widgetId === 'kev-weather') {
                posX = screenW - dims.width * 2 - 50
                posY = 40
            } else if (widgetId === 'kev-calendar') {
                posX = screenW - dims.width * 2 - 50
                posY = 320
            } else {
                posX = screenW - dims.width - 40 - (openWidgetWindows.size * 30)
                posY = 40 + (openWidgetWindows.size * 30)
            }
        }
    } catch {}

    const isAlwaysOnTop = getSetting('alwaysOnTop', 'false') === 'true'

    const minW = Math.min(160, dims.width)
    const minH = Math.min(100, dims.height)

    const win = new BrowserWindow({
        title: `DevPulse — ${widgetId}`,
        width: dims.width,
        height: dims.height,
        minWidth: minW,
        minHeight: minH,
        x: posX,
        y: posY,
        frame: false,
        transparent: true,
        backgroundColor: '#00000000',
        hasShadow: false,
        resizable: true,
        skipTaskbar: true, // Pinned to desktop wallpaper - no taskbar clutter!
        alwaysOnTop: isAlwaysOnTop,
        icon: getAppIcon(),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
        show: false, // Don't steal focus or pop up over active apps!
    })

    win.once('ready-to-show', () => {
        if (!win.isDestroyed()) {
            win.showInactive() // Show without stealing focus or jumping over ChatGPT / browser!
            if (!isAlwaysOnTop) {
                pinWindowToDesktopBottom(win)
            }
        }
    })

    win.on('blur', () => {
        // When user switches away to ChatGPT or browser, immediately sink to desktop wallpaper behind apps
        if (!win.isDestroyed() && getSetting('alwaysOnTop', 'false') !== 'true') {
            win.setAlwaysOnTop(false)
            pinWindowToDesktopBottom(win)
        }
    })

    if (isDev) {
        win.loadURL(`http://localhost:5173?widget=${widgetId}`)
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'), {
            query: { widget: widgetId },
        })
    }

    win.on('moved', () => {
        if (!win.isDestroyed()) {
            const [x, y] = win.getPosition()
            saveSetting(`widget_pos_${widgetId}`, JSON.stringify({ x, y }))
            if (getSetting('alwaysOnTop', 'false') !== 'true') {
                pinWindowToDesktopBottom(win)
            }
        }
    })

    win.on('resized', () => {
        if (!win.isDestroyed()) {
            const [w, h] = win.getSize()
            saveSetting(`widget_size_${widgetId}`, JSON.stringify({ width: w, height: h }))
        }
    })

    win.on('closed', () => {
        openWidgetWindows.delete(widgetId)
        const cur = getStoredActiveWidgets().filter((id) => id !== widgetId)
        saveStoredActiveWidgets(cur)
    })

    openWidgetWindows.set(widgetId, win)
    return win
}

function openWidget(widgetId: string) {
    const win = createWidgetWindow(widgetId)
    const active = getStoredActiveWidgets()
    if (!active.includes(widgetId)) {
        saveStoredActiveWidgets([...active, widgetId])
    }
    if (getSetting('alwaysOnTop', 'false') !== 'true') {
        pinWindowToDesktopBottom(win)
    }
}

function closeWidget(widgetId: string) {
    const win = openWidgetWindows.get(widgetId)
    if (win && !win.isDestroyed()) {
        try {
            win.hide()
            win.destroy()
        } catch (e) {
            console.error('Error destroying window:', e)
        }
    }
    openWidgetWindows.delete(widgetId)
    const active = getStoredActiveWidgets().filter((id) => id !== widgetId)
    saveStoredActiveWidgets(active)
}

function toggleWidget(widgetId: string): boolean {
    if (openWidgetWindows.has(widgetId)) {
        closeWidget(widgetId)
        return false
    } else {
        openWidget(widgetId)
        return true
    }
}

function launchDeveloperFocusSetup() {
    closeAllWidgets()
    const primary = screen.getPrimaryDisplay()
    const { width: W, height: H } = primary.workAreaSize

    const leftX = 30
    const rightX = Math.max(30, W - 390)
    const centerX = Math.max(30, Math.round((W - 380) / 2))

    const focusWidgets = [
        { id: 'leetcode',   x: leftX,    y: 40 },
        { id: 'launchpad',  x: leftX,    y: Math.min(H - 280, 520) },
        { id: 'chatgpt',    x: centerX,  y: 40 },
        { id: 'screentime', x: centerX,  y: Math.min(H - 460, 320) },
        { id: 'tasks',      x: rightX,   y: 40 },
    ]

    for (const w of focusWidgets) {
        saveSetting(`widget_pos_${w.id}`, JSON.stringify({ x: w.x, y: w.y }))
        openWidget(w.id)
    }
}

function launchKevTechSetup() {
    closeAllWidgets()
    const primary = screen.getPrimaryDisplay()
    const { width: W, height: H } = primary.workAreaSize

    // Responsive proportional layout — works on 1366x768, 1920x1080, 1440x900
    // Right column: Clock + Date (W - 200px wide widgets)
    // Center column: Weather + Calendar + Music (W - 540px wide 320px widgets)
    // Left columns: Comic + CD + Photo + Quote
    const rightEdge   = W - 200     // right edge anchor (clock + date)
    const centerRight = W - 210     // center-right (weather/calendar/music)
    const comicX      = Math.max(10, W - 930)
    const leftX       = Math.max(10, W - 1120)

    const kevTechWidgets = [
        { id: 'kev-clock',    x: rightEdge,       y: 40  },
        { id: 'kev-date',     x: rightEdge,       y: 230 },
        { id: 'kev-battery',  x: rightEdge - 200, y: 40  },
        { id: 'kev-weather',  x: centerRight - 530, y: 40  },
        { id: 'kev-calendar', x: centerRight - 530, y: 220 },
        { id: 'kev-music',    x: centerRight - 530, y: 400 },
        { id: 'kev-comic',    x: comicX,          y: 40  },
        { id: 'kev-cd',       x: leftX,           y: 40  },
        { id: 'kev-photo',    x: leftX,           y: 230 },
        { id: 'kev-quote',    x: leftX,           y: 420 },
    ]

    for (const w of kevTechWidgets) {
        saveSetting(`widget_pos_${w.id}`, JSON.stringify({ x: w.x, y: w.y }))
        openWidget(w.id)
    }
}

function launchMacBookLayout() {
    closeAllWidgets()
    const primary = screen.getPrimaryDisplay()
    const { width: W } = primary.workAreaSize

    const macBookWidgets = [
        { id: 'kev-appstack', x: 20,          y: 40  },
        { id: 'kev-clock',    x: Math.round(W / 2) - 88, y: 60  },
        { id: 'kev-weather',  x: 20,          y: 300 },
        { id: 'kev-calendar', x: 20,          y: 480 },
        { id: 'kev-battery',  x: W - 220,     y: 40  },
    ]

    for (const w of macBookWidgets) {
        saveSetting(`widget_pos_${w.id}`, JSON.stringify({ x: w.x, y: w.y }))
        openWidget(w.id)
    }
}

function launchEssentials() {
    const essentials = ['kev-clock', 'kev-battery', 'kev-weather', 'kev-calendar']
    for (const id of essentials) {
        openWidget(id)
    }
}

function closeAllWidgets() {
    for (const win of openWidgetWindows.values()) {
        if (!win.isDestroyed()) {
            try {
                win.hide()
                win.destroy()
            } catch (e) {}
        }
    }
    openWidgetWindows.clear()
    saveStoredActiveWidgets([])
}

/**
 * Creates the Widget Hub control panel window
 */
function openManagerWindow(tab: string = 'widgets'): BrowserWindow {
    if (managerWindow && !managerWindow.isDestroyed()) {
        managerWindow.show()
        managerWindow.focus()
        managerWindow.webContents.send('manager:setTab', tab)
        return managerWindow
    }

    managerWindow = new BrowserWindow({
        title: 'DevPulse — Desktop Widgets Hub',
        width: 1040,
        height: 780,
        minWidth: 480,
        minHeight: 520,
        center: true,
        frame: true,
        backgroundColor: '#0d0f17',
        resizable: true,
        skipTaskbar: false,
        icon: getAppIcon(),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
        show: true,
    })

    if (isDev) {
        managerWindow.loadURL(`http://localhost:5173?manager=true&tab=${encodeURIComponent(tab)}`)
    } else {
        managerWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
            query: { manager: 'true', tab },
        })
    }

    managerWindow.on('closed', () => {
        managerWindow = null
    })

    return managerWindow
}

function updateTrayMenu() {
    if (!tray) return
    const isAlwaysOnTop = getSetting('alwaysOnTop', 'false') === 'true'
    const active = Array.from(openWidgetWindows.keys())

    const widgetSubmenu = Object.entries(WIDGET_TITLES).map(([id, label]) => ({
        label,
        type: 'checkbox' as const,
        checked: active.includes(id),
        click: () => toggleWidget(id),
    }))

    const contextMenu = Menu.buildFromTemplate([
        {
            label: '🎯 Launch Focus Setup (All 4 Core Widgets)',
            click: () => launchDeveloperFocusSetup(),
        },
        { type: 'separator' },
        {
            label: '⚡ LeetCode Daily Problem',
            type: 'checkbox',
            checked: active.includes('leetcode'),
            click: () => toggleWidget('leetcode'),
        },
        {
            label: "📋 Today's Tasks Checklist",
            type: 'checkbox',
            checked: active.includes('tasks'),
            click: () => toggleWidget('tasks'),
        },
        {
            label: '🎯 Habits & Goals Tracker',
            type: 'checkbox',
            checked: active.includes('goals'),
            click: () => toggleWidget('goals'),
        },
        {
            label: '🤖 ChatGPT Search Box',
            type: 'checkbox',
            checked: active.includes('chatgpt'),
            click: () => toggleWidget('chatgpt'),
        },
        { type: 'separator' },
        {
            label: '🧩 Open Widget Picker & Hub',
            click: () => openManagerWindow(),
        },
        {
            label: '🧹 Clear All Desktop Widgets',
            click: () => closeAllWidgets(),
        },
        { type: 'separator' },
        {
            label: 'More Desktop Widgets',
            submenu: widgetSubmenu,
        },
        { type: 'separator' },
        {
            label: isAlwaysOnTop
                ? '✓ Float Above Other Windows (Always on Top)'
                : '📌 Pinned to Desktop Wallpaper (Behind Windows)',
            type: 'checkbox',
            checked: isAlwaysOnTop,
            click: () => {
                const next = !isAlwaysOnTop
                saveSetting('alwaysOnTop', String(next))
                for (const win of openWidgetWindows.values()) {
                    if (!win.isDestroyed()) setWindowDesktopMode(win, next)
                }
                updateTrayMenu()
            },
        },
        { type: 'separator' },
        {
            label: 'Quit DevPulse',
            click: () => {
                screenTimeService?.stop()
                app.exit(0)
            },
        },
    ])

    tray.setContextMenu(contextMenu)
}

function createTray() {
    const candidates = [
        path.join(process.resourcesPath, 'icon.ico'),
        path.join(__dirname, '../public/icon.ico'),
        path.join(__dirname, '../dist/icon.ico'),
        path.join(process.resourcesPath, 'icon.png'),
        path.join(__dirname, '../dist/icon.png'),
        path.join(__dirname, '../public/icon.png'),
    ]

    const validPath = candidates.find(p => fs.existsSync(p))

    try {
        if (validPath) {
            tray = new Tray(validPath)
        } else {
            const width = 16
            const height = 16
            const buffer = Buffer.alloc(width * height * 4)
            for (let i = 0; i < width * height; i++) {
                buffer[i * 4] = 168
                buffer[i * 4 + 1] = 85
                buffer[i * 4 + 2] = 247
                buffer[i * 4 + 3] = 255
            }
            const fallbackIcon = nativeImage.createFromBuffer(buffer, { width, height })
            tray = new Tray(fallbackIcon)
        }

        tray.setToolTip('DevPulse — Desktop Widgets')
        updateTrayMenu()

        tray.on('click', () => {
            openManagerWindow()
        })
    } catch (err) {
        console.error('Tray initialization error:', err)
    }
}

// IPC: Desktop Widgets Management
ipcMain.handle('widgets:getActive', () => Array.from(openWidgetWindows.keys()))
ipcMain.handle('widgets:toggle', (_e, widgetId: string) => ({ active: toggleWidget(widgetId) }))
ipcMain.handle('widgets:open', (_e, widgetId: string) => {
    openWidget(widgetId)
    return { success: true }
})
ipcMain.handle('widgets:close', (_e, widgetId: string) => {
    closeWidget(widgetId)
    return { success: true }
})
ipcMain.handle('widgets:launchFocus', () => {
    launchDeveloperFocusSetup()
    return { success: true }
})
ipcMain.handle('widgets:launchEssentials', () => {
    launchEssentials()
    return { success: true }
})
ipcMain.handle('widgets:launchKevTech', () => {
    launchKevTechSetup()
    return { success: true }
})
ipcMain.handle('widgets:launchMacBook', () => {
    launchMacBookLayout()
    return { success: true }
})
ipcMain.handle('widgets:closeAll', () => {
    closeAllWidgets()
    return { success: true }
})
ipcMain.on('widgets:closeCurrent', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win && !win.isDestroyed()) {
        try {
            win.hide()
        } catch (e) {}
        let foundId: string | null = null
        for (const [id, w] of openWidgetWindows.entries()) {
            if (w === win) {
                foundId = id
                break
            }
        }
        if (foundId) {
            closeWidget(foundId)
        } else {
            try {
                win.destroy()
            } catch (e) {}
        }
    }
})
ipcMain.on('widgets:openManager', (_e, tab?: string) => {
    openManagerWindow(typeof tab === 'string' ? tab : 'widgets')
})
ipcMain.on('widgets:openSettings', () => {
    openManagerWindow('settings')
})

function launchApplication(appKey: string): void {
    const localAppData = process.env.LOCALAPPDATA || ''
    const userProfile = process.env.USERPROFILE || ''
    const programFiles = process.env.ProgramFiles || 'C:\\Program Files'
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)'

    const tryExecutables = (candidates: (string | undefined)[]): boolean => {
        for (const candidate of candidates) {
            if (candidate && fs.existsSync(candidate)) {
                try {
                    spawn(candidate, [], { detached: true, stdio: 'ignore' }).unref()
                    return true
                } catch (e) {
                    console.error(`Failed to launch ${candidate}:`, e)
                }
            }
        }
        return false
    }

    switch (appKey) {
        case 'vscode':
        case 'code': {
            const candidates = [
                path.join(localAppData, 'Programs', 'Microsoft VS Code', 'Code.exe'),
                path.join(programFiles, 'Microsoft VS Code', 'Code.exe'),
                path.join(programFilesX86, 'Microsoft VS Code', 'Code.exe'),
                'D:\\cursor\\Cursor.exe',
            ]
            if (tryExecutables(candidates)) return
            exec('code', (err) => {
                if (err) {
                    shell.openExternal('https://vscode.dev')
                }
            })
            break
        }
        case 'chatgpt': {
            exec('explorer.exe shell:AppsFolder\\OpenAI.ChatGPT-Desktop_2p2nqsd0c76g0!ChatGPT', (err) => {
                if (err) {
                    const candidates = [
                        path.join(localAppData, 'Programs', 'OpenAI', 'ChatGPT', 'ChatGPT.exe'),
                    ]
                    if (!tryExecutables(candidates)) {
                        exec('powershell -NoProfile -Command "Start-Process \\"chatgpt:\\""', (psErr) => {
                            if (psErr) {
                                shell.openExternal('https://chatgpt.com')
                            }
                        })
                    }
                }
            })
            break
        }
        case 'github': {
            const candidates = [
                path.join(localAppData, 'GitHubDesktop', 'GitHubDesktop.exe'),
                path.join(localAppData, 'Programs', 'GitHub Desktop', 'GitHub Desktop.exe'),
            ]
            if (!tryExecutables(candidates)) {
                shell.openExternal('https://github.com')
            }
            break
        }
        case 'antigravity': {
            const candidates = [
                path.join(localAppData, 'Programs', 'Antigravity IDE', 'Antigravity IDE.exe'),
                path.join(localAppData, 'Programs', 'antigravity', 'Antigravity.exe'),
                path.join(userProfile, 'AppData', 'Local', 'Programs', 'Antigravity IDE', 'Antigravity IDE.exe'),
                path.join(userProfile, 'AppData', 'Local', 'Programs', 'antigravity', 'Antigravity.exe'),
                'C:\\Program Files\\Antigravity IDE\\Antigravity IDE.exe',
            ]
            if (tryExecutables(candidates)) return
            exec('antigravity', (err) => {
                if (err) {
                    shell.openExternal('https://antigravity.google')
                }
            })
            break
        }
        case 'edge':
        case 'web': {
            const candidates = [
                path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
                path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
                path.join(localAppData, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
            ]
            if (tryExecutables(candidates)) return
            exec('start msedge', (err) => {
                if (err) {
                    shell.openExternal('https://www.bing.com')
                }
            })
            break
        }
        case 'brave': {
            const candidates = [
                path.join(localAppData, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
                path.join(programFiles, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
                path.join(programFilesX86, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
                path.join(userProfile, 'AppData', 'Local', 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
            ]
            if (tryExecutables(candidates)) return
            exec('brave', (err) => {
                if (err) {
                    shell.openExternal('https://search.brave.com')
                }
            })
            break
        }
        case 'terminal': {
            const candidates = [
                path.join(localAppData, 'Microsoft', 'WindowsApps', 'wt.exe'),
                'C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
                'C:\\WINDOWS\\System32\\cmd.exe',
            ]
            if (tryExecutables(candidates)) return
            exec('start powershell.exe')
            break
        }
        case 'settings': {
            openManagerWindow('settings')
            break
        }
        case 'files':
        case 'explorer': {
            exec('explorer.exe')
            break
        }
        case 'notes': {
            exec('notepad.exe')
            break
        }
        case 'search': {
            launchApplication('brave')
            break
        }
        default:
            break
    }
}

// IPC: Window controls
ipcMain.on('window:minimize', (e) => BrowserWindow.fromWebContents(e.sender)?.minimize())
ipcMain.on('window:hide', (e) => BrowserWindow.fromWebContents(e.sender)?.hide())
ipcMain.on('window:close', (e) => BrowserWindow.fromWebContents(e.sender)?.close())
ipcMain.on('window:setAlwaysOnTop', (_e, flag: boolean) => {
    saveSetting('alwaysOnTop', String(flag))
    for (const win of openWidgetWindows.values()) {
        if (!win.isDestroyed()) setWindowDesktopMode(win, flag)
    }
    updateTrayMenu()
})

ipcMain.on('window:setMode', (event, mode: string) => {
    saveSetting('widgetMode', mode)
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win && !win.isDestroyed()) {
        const primary = screen.getPrimaryDisplay()
        const { height: screenH } = primary.workAreaSize
        if (mode === 'compact') {
            win.setResizable(true)
            win.setSize(340, 240, true)
        } else if (mode === 'normal') {
            win.setResizable(true)
            win.setSize(440, Math.min(screenH - 40, 720), true)
        } else if (mode === 'expanded') {
            win.setResizable(true)
            win.setSize(960, Math.min(screenH - 40, 760), true)
        } else if (mode === 'canvas') {
            win.setResizable(true)
            win.setSize(1200, Math.min(screenH - 40, 800), true)
        }
    }
})
ipcMain.handle('window:getMode', () => getSetting('widgetMode', 'canvas'))
ipcMain.on('shell:openExternal', (_e, url: string) => shell.openExternal(url))
ipcMain.on('shell:openTerminal', () => {
    launchApplication('terminal')
})
ipcMain.on('shell:launchApp', (_e, appKey: string) => {
    launchApplication(appKey)
})

app.whenReady().then(() => {
    initDatabase()
    createTray()

    // Register IPC handlers
    registerTaskIPC()
    registerFocusIPC()
    registerScreenTimeIPC()
    registerSettingsIPC()
    registerPulseIPC(isFocusActive)
    registerGitIPC()
    registerScratchpadIPC()
    registerLeetCodeIPC()
    registerAIIPC()

    screenTimeService = new ScreenTimeService((data) => {
        for (const win of openWidgetWindows.values()) {
            if (!win.isDestroyed()) win.webContents.send('screenTime:update', data)
        }
    })
    setScreenTimeServiceRef(screenTimeService)

    // Apply auto-start setting
    const startWithWindows = getSetting('startWithWindows', 'false') === 'true'
    app.setLoginItemSettings({ openAtLogin: startWithWindows })

    if (getSetting('screenTimeTracking', 'true') === 'true') {
        screenTimeService.start()
    }

    // Launch saved active desktop widgets directly onto user's Windows wallpaper!
    const active = getStoredActiveWidgets()
    saveStoredActiveWidgets(active)
    if (active.length > 0) {
        for (const id of active) {
            createWidgetWindow(id)
        }
    } else {
        // If first time with no setting ever saved, open the Manager Hub so the user can pick
        const settingExists = getSetting('active_desktop_widgets', 'NOT_SET') !== 'NOT_SET'
        if (!settingExists) {
            openManagerWindow()
        }
    }

    app.on('second-instance', () => {
        if (managerWindow && !managerWindow.isDestroyed()) {
            if (managerWindow.isMinimized()) managerWindow.restore()
            managerWindow.show()
            managerWindow.focus()
        } else if (openWidgetWindows.size > 0) {
            const firstWin = openWidgetWindows.values().next().value
            if (firstWin && !firstWin.isDestroyed()) {
                firstWin.focus()
            }
        } else {
            openManagerWindow()
        }
    })
})

app.on('window-all-closed', () => {
    // Keep running in Windows system tray even when all widget windows are closed
})

app.on('activate', () => {
    if (openWidgetWindows.size === 0 && !managerWindow) {
        openManagerWindow()
    }
})

app.on('before-quit', () => {
    stopDesktopPinDaemon()
    screenTimeService?.stop()
})
