import { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, shell } from 'electron'
import path from 'path'
import { initDatabase } from './database'
import { registerTaskIPC } from './ipc/tasks'
import { registerFocusIPC } from './ipc/focus'
import { registerScreenTimeIPC, setScreenTimeServiceRef } from './ipc/screenTime'
import { registerSettingsIPC } from './ipc/settings'
import { ScreenTimeService } from './services/ScreenTimeService'

const isDev = process.env.NODE_ENV === 'development'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let screenTimeService: ScreenTimeService | null = null

const WINDOW_SIZES = {
    compact: { width: 340, height: 240 },
    normal: { width: 440, height: 700 },
    expanded: { width: 960, height: 720 },
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: WINDOW_SIZES.normal.width,
        height: WINDOW_SIZES.normal.height,
        minWidth: 320,
        minHeight: 200,
        frame: false,
        transparent: false,
        backgroundColor: '#0f1117',
        resizable: true,
        alwaysOnTop: false,
        skipTaskbar: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
        titleBarStyle: 'hidden',
        show: false,
    })

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173')
        mainWindow.webContents.openDevTools({ mode: 'detach' })
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow?.show()
    })

    mainWindow.on('close', (e) => {
        e.preventDefault()
        mainWindow?.hide()
    })
}

function createTray() {
    // Use a simple colored icon or fallback
    const iconPath = path.join(__dirname, '../public/icon.png')
    let trayIcon: ReturnType<typeof nativeImage.createEmpty>
    try {
        trayIcon = nativeImage.createFromPath(iconPath)
        if (trayIcon.isEmpty()) {
            trayIcon = nativeImage.createFromDataURL(
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmDAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFVSURBVDiNpZMxSgNBFIa/2d1kk02yiYiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIkFJSUoqUlJSUlJSUlJSUlPQPLGRhd+bNzJuZN7OzC4iIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIjIf+YBQAAAAAAAAAAJAAAACgAAAAoAAAAKAAAACgAAAA=='
            )
        }
    } catch {
        trayIcon = nativeImage.createEmpty()
    }

    tray = new Tray(trayIcon)
    tray.setToolTip('DevPulse — Developer Productivity')

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open Dashboard',
            click: () => {
                mainWindow?.show()
                mainWindow?.focus()
            },
        },
        {
            label: 'Start Focus Session',
            click: () => {
                mainWindow?.show()
                mainWindow?.focus()
                mainWindow?.webContents.send('tray:startFocus')
            },
        },
        {
            label: 'Add Task',
            click: () => {
                mainWindow?.show()
                mainWindow?.focus()
                mainWindow?.webContents.send('tray:addTask')
            },
        },
        { type: 'separator' },
        {
            label: 'Settings',
            click: () => {
                mainWindow?.show()
                mainWindow?.focus()
                mainWindow?.webContents.send('tray:settings')
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
    tray.on('click', () => {
        if (mainWindow?.isVisible()) {
            mainWindow.hide()
        } else {
            mainWindow?.show()
            mainWindow?.focus()
        }
    })
}

// IPC: window controls
ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:hide', () => mainWindow?.hide())
ipcMain.on('window:close', () => mainWindow?.hide())
ipcMain.on('window:setMode', (_e, mode: keyof typeof WINDOW_SIZES) => {
    const size = WINDOW_SIZES[mode] || WINDOW_SIZES.normal
    mainWindow?.setSize(size.width, size.height, true)
})
ipcMain.on('window:setAlwaysOnTop', (_e, flag: boolean) => {
    mainWindow?.setAlwaysOnTop(flag)
})
ipcMain.handle('window:getMode', () => {
    if (!mainWindow) return 'normal'
    const [w] = mainWindow.getSize()
    if (w <= 360) return 'compact'
    if (w >= 800) return 'expanded'
    return 'normal'
})
ipcMain.on('shell:openExternal', (_e, url: string) => shell.openExternal(url))

app.whenReady().then(() => {
    initDatabase()
    createWindow()
    createTray()

    // Register all IPC handlers
    registerTaskIPC()
    registerFocusIPC(mainWindow!)
    registerScreenTimeIPC()
    registerSettingsIPC()

    // Start screen time background service
    screenTimeService = new ScreenTimeService((data) => {
        mainWindow?.webContents.send('screenTime:update', data)
    })
    setScreenTimeServiceRef(screenTimeService)
    screenTimeService.start()
})

app.on('window-all-closed', () => {
    // On Windows, keep running in tray
    if (process.platform !== 'darwin') {
        // Don't quit — let tray handle it
    }
})

app.on('activate', () => {
    if (!mainWindow) createWindow()
})

app.on('before-quit', () => {
    screenTimeService?.stop()
})
