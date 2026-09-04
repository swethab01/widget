import { contextBridge, ipcRenderer } from 'electron'

// Typed API exposed to renderer via window.electronAPI
const electronAPI = {
    // Window controls
    window: {
        minimize: () => ipcRenderer.send('window:minimize'),
        hide: () => ipcRenderer.send('window:hide'),
        close: () => ipcRenderer.send('window:close'),
        setMode: (mode: 'compact' | 'normal' | 'expanded') =>
            ipcRenderer.send('window:setMode', mode),
        setAlwaysOnTop: (flag: boolean) =>
            ipcRenderer.send('window:setAlwaysOnTop', flag),
        getMode: () => ipcRenderer.invoke('window:getMode'),
    },

    // Tasks
    tasks: {
        getAll: () => ipcRenderer.invoke('tasks:getAll'),
        getToday: () => ipcRenderer.invoke('tasks:getToday'),
        add: (task: unknown) => ipcRenderer.invoke('tasks:add', task),
        update: (id: number, patch: unknown) =>
            ipcRenderer.invoke('tasks:update', id, patch),
        delete: (id: number) => ipcRenderer.invoke('tasks:delete', id),
        complete: (id: number) => ipcRenderer.invoke('tasks:complete', id),
    },

    // Focus timer
    focus: {
        start: (taskId: number | null, minutes: number) =>
            ipcRenderer.invoke('focus:start', taskId, minutes),
        pause: () => ipcRenderer.invoke('focus:pause'),
        resume: () => ipcRenderer.invoke('focus:resume'),
        stop: () => ipcRenderer.invoke('focus:stop'),
        getActive: () => ipcRenderer.invoke('focus:getActive'),
        getHistory: () => ipcRenderer.invoke('focus:getHistory'),
    },

    // Screen time
    screenTime: {
        getToday: () => ipcRenderer.invoke('screenTime:getToday'),
        getSummary: () => ipcRenderer.invoke('screenTime:getSummary'),
    },

    // Productivity score
    score: {
        getToday: () => ipcRenderer.invoke('score:getToday'),
        getHistory: (days: number) => ipcRenderer.invoke('score:getHistory', days),
    },

    // Settings
    settings: {
        get: (key: string) => ipcRenderer.invoke('settings:get', key),
        getAll: () => ipcRenderer.invoke('settings:getAll'),
        set: (key: string, value: string) =>
            ipcRenderer.invoke('settings:set', key, value),
    },

    // Goals
    goals: {
        getAll: () => ipcRenderer.invoke('goals:getAll'),
        set: (type: string, target: number) =>
            ipcRenderer.invoke('goals:set', type, target),
    },

    // Shell
    openExternal: (url: string) => ipcRenderer.send('shell:openExternal', url),

    // Event listeners (main → renderer)
    on: (
        channel: string,
        callback: (...args: unknown[]) => void
    ) => {
        const validChannels = [
            'focus:tick',
            'screenTime:update',
            'tray:startFocus',
            'tray:addTask',
            'tray:settings',
        ]
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (_event, ...args) => callback(...args))
        }
    },
    off: (channel: string, callback: (...args: unknown[]) => void) => {
        ipcRenderer.removeListener(channel, callback)
    },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
