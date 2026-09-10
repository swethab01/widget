import { useState, useEffect, useCallback } from 'react'
import { Header } from './components/Header'
import { Dashboard } from './pages/Dashboard'
import { Analytics } from './pages/Analytics'
import { SettingsPage } from './pages/Settings'
import { Scratchpad } from './pages/Scratchpad'
import { CommandPalette } from './components/CommandPalette'
import { MacDesktopCanvas } from './components/desktop/MacDesktopCanvas'
import { DesktopWidgetRenderer } from './components/desktop/DesktopWidgetRenderer'
import { DesktopWidgetDeck } from './components/desktop/DesktopWidgetDeck'
import { WidgetHub } from './components/desktop/WidgetHub'
import type { Task, WidgetMode, DesktopWallpaper } from './types'

export default function App() {
  // If window was spawned as an individual floating desktop widget
  const urlParams = new URLSearchParams(window.location.search)
  const widgetId = urlParams.get('widget')
  if (widgetId) {
    return <DesktopWidgetRenderer widgetId={widgetId} />
  }

  // If opened as Widget Hub Manager
  const isManager = urlParams.get('manager') === 'true'
  if (isManager) {
    return <WidgetHub />
  }

  // Pure Desktop Widget Deck (compact authentic widgets, no giant fake OS website)
  const viewParam = urlParams.get('view')
  if (!viewParam || viewParam === 'widgets' || viewParam === 'deck') {
    return <DesktopWidgetDeck />
  }
  const [page, setPage] = useState('dashboard')
  const [mode, setMode] = useState<WidgetMode>('canvas')
  const [wallpaper, setWallpaper] = useState<DesktopWallpaper>('spiderman')
  const [username, setUsername] = useState('Developer')
  const [score, setScore] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  const [addTaskTrigger, setAddTaskTrigger] = useState(false)
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false)

  const loadInitialData = useCallback(() => {
    window.electronAPI.settings.getAll().then((s) => {
      if (s?.username) setUsername(s.username)
    })
    window.electronAPI.score.getToday().then((s) => {
      if (s) setScore(s.score)
    })
    window.electronAPI.tasks.getToday().then((t) => {
      if (t) setTasks(t)
    })
    window.electronAPI.window.getMode().then((m) => setMode(m))
  }, [])

  useEffect(() => {
    loadInitialData()

    // Global keyboard listener for macOS Spotlight (Cmd+K / Ctrl+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsSpotlightOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    // Tray events
    const handleStartFocus = () => setPage('dashboard')
    const handleAddTask = () => {
      setPage('dashboard')
      setAddTaskTrigger(true)
      setTimeout(() => setAddTaskTrigger(false), 100)
    }
    const handleSettings = () => setPage('settings')

    window.electronAPI.on('tray:startFocus', handleStartFocus)
    window.electronAPI.on('tray:addTask', handleAddTask)
    window.electronAPI.on('tray:settings', handleSettings)

    // Refresh score every 60s
    const scoreInterval = setInterval(() => {
      window.electronAPI.score.getToday().then((s) => {
        if (s) setScore(s.score)
      })
    }, 60000)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearInterval(scoreInterval)
    }
  }, [loadInitialData])

  const handleModeChange = (m: WidgetMode) => {
    setMode(m)
    window.electronAPI.window.setMode(m)
  }

  const handleStartFocusFromPalette = (taskId: number | null, minutes: number) => {
    window.electronAPI.focus.start(taskId, minutes)
  }

  // In canvas mode, show the full macOS Desktop Canvas experience
  if (mode === 'canvas') {
    return (
      <div className="h-screen w-screen overflow-hidden">
        <MacDesktopCanvas
          currentWallpaper={wallpaper}
          onSelectWallpaper={setWallpaper}
          currentMode={mode}
          onModeChange={handleModeChange}
          currentPage={page}
          onNav={setPage}
          onOpenSpotlight={() => setIsSpotlightOpen(true)}
          onStartFocus={handleStartFocusFromPalette}
        />

        {/* macOS Spotlight Command Palette Modal */}
        <CommandPalette
          isOpen={isSpotlightOpen}
          onClose={() => setIsSpotlightOpen(false)}
          tasks={tasks}
          onNav={(p) => {
            setPage(p)
            setIsSpotlightOpen(false)
          }}
          onModeChange={(m) => {
            handleModeChange(m)
            setIsSpotlightOpen(false)
          }}
          onStartFocus={handleStartFocusFromPalette}
        />
      </div>
    )
  }

  // In compact mode, show macOS 2x2 Small Widget
  if (mode === 'compact') {
    return (
      <MacCompactWidget
        score={score}
        username={username}
        onExpand={() => handleModeChange('normal')}
      />
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#0b0d13] text-white select-none overflow-hidden relative font-sans">
      {/* Subtle ambient light glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <Header
        username={username}
        score={score}
        mode={mode}
        onModeChange={handleModeChange}
        onNav={setPage}
        currentPage={page}
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
      />

      <div className="flex-1 overflow-hidden z-10">
        {page === 'dashboard' && (
          <Dashboard
            onTriggerAddTask={addTaskTrigger}
            mode={mode}
            onSwitchToCanvas={() => handleModeChange('canvas')}
          />
        )}
        {page === 'scratchpad' && <Scratchpad />}
        {page === 'analytics' && <Analytics />}
        {page === 'settings' && <SettingsPage />}
      </div>

      {/* macOS Spotlight Command Palette Modal */}
      <CommandPalette
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        tasks={tasks}
        onNav={(p) => {
          setPage(p)
          setIsSpotlightOpen(false)
        }}
        onModeChange={(m) => {
          handleModeChange(m)
          setIsSpotlightOpen(false)
        }}
        onStartFocus={handleStartFocusFromPalette}
      />
    </div>
  )
}

// macOS 2x2 Small Widget Tile
function MacCompactWidget({
  score,
  username,
  onExpand,
}: {
  score: number
  username: string
  onExpand: () => void
}) {
  const scoreColor =
    score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-rose-400'

  // Activity ring percentage
  const circumference = 201.06 // 2 * pi * 32
  const strokeOffset = circumference - (Math.min(score, 100) / 100) * circumference

  return (
    <div
      className="h-screen bg-[#10121a]/95 text-white flex flex-col items-center justify-between p-4 cursor-pointer select-none relative overflow-hidden font-sans border border-white/10 rounded-[28px]"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      onClick={onExpand}
    >
      {/* Top light reflection */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

      {/* Header bar */}
      <div className="w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 mac-pulse-dot" />
          <span className="text-[11px] font-semibold tracking-tight text-white/80">DevPulse</span>
        </div>
        <span className="text-[9px] font-mono text-white/40 bg-white/[0.06] px-1.5 py-0.2 rounded-full">
          2×2
        </span>
      </div>

      {/* Activity Ring Center */}
      <div className="relative flex items-center justify-center my-auto">
        <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="6" />
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke="#30d158"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={`text-2xl font-mono font-bold leading-none ${scoreColor}`}>
            {score}
          </span>
          <span className="text-[8px] text-white/40 font-mono mt-0.5">SCORE</span>
        </div>
      </div>

      {/* Footer bar */}
      <div className="w-full flex items-center justify-between z-10 text-[10px] text-white/40 font-mono pt-1 border-t border-white/[0.06]">
        <span className="truncate max-w-[90px]">{username}</span>
        <span className="text-blue-400">Click to expand</span>
      </div>
    </div>
  )
}
