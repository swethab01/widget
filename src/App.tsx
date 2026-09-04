import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Dashboard } from './pages/Dashboard'
import { Analytics } from './pages/Analytics'
import { SettingsPage } from './pages/Settings'
import type { WidgetMode } from './types'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [mode, setMode] = useState<WidgetMode>('normal')
  const [username, setUsername] = useState('Developer')
  const [score, setScore] = useState(0)
  const [addTaskTrigger, setAddTaskTrigger] = useState(false)

  useEffect(() => {
    // Load initial settings
    window.electronAPI.settings.getAll().then((s) => {
      if (s?.username) setUsername(s.username)
    })
    // Load today's score
    window.electronAPI.score.getToday().then((s) => {
      if (s) setScore(s.score)
    })
    // Detect window mode
    window.electronAPI.window.getMode().then((m) => setMode(m))

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
      window.electronAPI.score.getToday().then((s) => { if (s) setScore(s.score) })
    }, 60000)

    return () => {
      clearInterval(scoreInterval)
    }
  }, [])

  const handleModeChange = (m: WidgetMode) => {
    setMode(m)
    window.electronAPI.window.setMode(m)
  }

  // In compact mode, show minimal dashboard
  if (mode === 'compact') {
    return (
      <CompactView score={score} username={username} onExpand={() => handleModeChange('normal')} />
    )
  }

  return (
    <div className="flex flex-col h-screen bg-surface text-text-primary overflow-hidden">
      <Header
        username={username}
        score={score}
        mode={mode}
        onModeChange={handleModeChange}
        onNav={setPage}
        currentPage={page}
      />
      <div className="flex-1 overflow-hidden">
        {page === 'dashboard' && <Dashboard onTriggerAddTask={addTaskTrigger} />}
        {page === 'analytics' && <Analytics />}
        {page === 'settings' && <SettingsPage />}
      </div>
    </div>
  )
}

function CompactView({ score, username, onExpand }: { score: number; username: string; onExpand: () => void }) {
  const scoreColor = score >= 80 ? 'text-accent-green' : score >= 60 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div
      className="h-screen bg-surface text-text-primary flex flex-col items-center justify-center gap-2 cursor-pointer select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      onClick={onExpand}
    >
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center">
          <span className="text-white text-xs font-bold">D</span>
        </div>
        <span className="text-xs font-semibold text-text-primary">DevPulse</span>
      </div>
      <div className={`text-4xl font-mono font-bold ${scoreColor}`}>{score}</div>
      <div className="text-[10px] text-text-muted">Click to expand</div>
      <div className="text-[10px] text-text-secondary">{username}</div>
    </div>
  )
}
