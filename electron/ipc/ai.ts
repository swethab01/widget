import { ipcMain, clipboard, shell, BrowserWindow } from 'electron'
import { exec, execSync } from 'child_process'
import { getSetting, saveSetting } from './settings'

let cachedAppInstalled: boolean | null = null
let chatgptWebWindow: BrowserWindow | null = null

function isChatGPTAppInstalled(): boolean {
    if (cachedAppInstalled !== null) return cachedAppInstalled
    if (process.platform !== 'win32') {
        cachedAppInstalled = false
        return false
    }
    try {
        const out = execSync(
            'powershell.exe -NoProfile -NonInteractive -Command "if (Get-AppxPackage *chatgpt* -ErrorAction SilentlyContinue) { Write-Output \'FOUND\' }"',
            { timeout: 3000, encoding: 'utf-8' }
        )
        if (out.includes('FOUND')) {
            cachedAppInstalled = true
            return true
        }
    } catch {}

    try {
        execSync('where chatgpt.exe || where chatgpt-classic.exe', { stdio: 'ignore' })
        cachedAppInstalled = true
        return true
    } catch {
        cachedAppInstalled = false
        return false
    }
}

export function registerAIIPC() {
    // Check if the native ChatGPT Windows Desktop app is installed
    ipcMain.handle('chatgpt:isAppInstalled', () => isChatGPTAppInstalled())

    // Check configuration and account status
    ipcMain.handle('chatgpt:getConfig', () => {
        const apiKey = getSetting('openai_api_key', '')
        const accountId = getSetting('chatgpt_account_id', '')
        const model = getSetting('openai_model', 'gpt-4o-mini')
        const isAppInstalled = isChatGPTAppInstalled()

        return {
            accountId: accountId || (isAppInstalled ? 'ChatGPT Desktop App' : null),
            hasKey: Boolean(apiKey && apiKey.startsWith('sk-')),
            maskedKey: apiKey ? `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}` : '',
            model,
            isAppInstalled,
        }
    })

    // Launch the official native ChatGPT Desktop App on Windows with optional prompt copied
    ipcMain.handle('chatgpt:openApp', async (_e, prompt?: string) => {
        if (prompt && prompt.trim()) {
            clipboard.writeText(prompt.trim())
        }

        try {
            // Launch registered Windows protocol or modern UWP app for ChatGPT
            exec(
                'start chatgpt: || explorer.exe shell:AppsFolder\\OpenAI.ChatGPT-Desktop_2p2nqsd0c76g0!App || start "" "%LOCALAPPDATA%\\Programs\\OpenAI\\ChatGPT\\ChatGPT.exe"',
                (err) => {
                    if (err) {
                        shell.openExternal('https://chatgpt.com')
                    }
                }
            )
            return { success: true, copied: Boolean(prompt) }
        } catch {
            shell.openExternal('https://chatgpt.com')
            return { success: true, copied: Boolean(prompt) }
        }
    })

    // Open a dedicated, connected ChatGPT session window right on the desktop with persistent login
    ipcMain.handle('chatgpt:openDesktopWeb', (_e, prompt?: string) => {
        if (chatgptWebWindow && !chatgptWebWindow.isDestroyed()) {
            chatgptWebWindow.show()
            chatgptWebWindow.focus()
            if (prompt && prompt.trim()) {
                chatgptWebWindow.loadURL(`https://chatgpt.com/?q=${encodeURIComponent(prompt.trim())}`)
            }
            return { success: true }
        }

        chatgptWebWindow = new BrowserWindow({
            width: 600,
            height: 750,
            minWidth: 420,
            minHeight: 500,
            title: 'ChatGPT — DevPulse Connected Session',
            autoHideMenuBar: true,
            backgroundColor: '#212121',
            webPreferences: {
                partition: 'persist:chatgpt_desktop_session',
                nodeIntegration: false,
                contextIsolation: true,
            },
        })

        // Standard Chrome Desktop user agent to ensure seamless authentication and Cloudflare compatibility
        chatgptWebWindow.webContents.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        )

        const targetUrl = prompt && prompt.trim()
            ? `https://chatgpt.com/?q=${encodeURIComponent(prompt.trim())}`
            : 'https://chatgpt.com/'

        chatgptWebWindow.loadURL(targetUrl)

        chatgptWebWindow.on('closed', () => {
            chatgptWebWindow = null
        })

        return { success: true }
    })

    // Save account ID and API key
    ipcMain.handle('chatgpt:saveConfig', (_e, config: { apiKey?: string; accountId?: string; model?: string }) => {
        if (config.apiKey !== undefined) {
            saveSetting('openai_api_key', config.apiKey.trim())
        }
        if (config.accountId !== undefined) {
            saveSetting('chatgpt_account_id', config.accountId.trim())
        }
        if (config.model !== undefined) {
            saveSetting('openai_model', config.model.trim())
        }
        return { success: true }
    })

    // Verify an OpenAI API key
    ipcMain.handle('chatgpt:verifyKey', async (_e, apiKey: string) => {
        const keyToTest = (apiKey || getSetting('openai_api_key', '')).trim()
        if (!keyToTest) {
            return { valid: false, error: 'API key is empty' }
        }

        try {
            const res = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    Authorization: `Bearer ${keyToTest}`,
                },
            })

            if (res.status === 401) {
                return { valid: false, error: 'Invalid API Key. Please check your OpenAI credentials.' }
            }
            if (res.status === 429) {
                return { valid: false, error: 'Rate limit or quota exceeded on this OpenAI account.' }
            }
            if (!res.ok) {
                return { valid: false, error: `OpenAI returned status ${res.status}` }
            }

            return { valid: true }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            return { valid: false, error: `Network error: ${message}` }
        }
    })

    // Query ChatGPT / OpenAI API
    ipcMain.handle('chatgpt:ask', async (_e, { prompt, model }: { prompt: string; model?: string }) => {
        const apiKey = getSetting('openai_api_key', '').trim()
        if (!apiKey) {
            return {
                success: false,
                error: 'NO_API_KEY',
                message: 'No OpenAI API Key connected. Click "Open ChatGPT App" to ask with your logged-in app.',
            }
        }

        const chosenModel = model || getSetting('openai_model', 'gpt-4o-mini')

        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: chosenModel,
                    messages: [
                        {
                            role: 'system',
                            content:
                                'You are DevPulse AI, a concise and high-precision developer assistant in a desktop widget. Be direct, clear, and include short code snippets where useful. Keep answers focused.',
                        },
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    max_tokens: 800,
                    temperature: 0.7,
                }),
            })

            if (!res.ok) {
                const errBody = await res.text()
                let parsedError = `HTTP ${res.status}`
                try {
                    const parsed = JSON.parse(errBody)
                    if (parsed?.error?.message) {
                        parsedError = parsed.error.message
                    }
                } catch {}

                return {
                    success: false,
                    error: 'API_ERROR',
                    message: parsedError,
                }
            }

            const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
            const text = data?.choices?.[0]?.message?.content || 'No response received from OpenAI.'

            return {
                success: true,
                text,
                model: chosenModel,
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            return {
                success: false,
                error: 'FETCH_ERROR',
                message: `Network error reaching OpenAI: ${message}`,
            }
        }
    })
}
