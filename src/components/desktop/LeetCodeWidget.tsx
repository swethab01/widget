import { useState, useEffect, useMemo } from 'react'
import type { LeetCodeProfileData, LeetCodeDailyQuestion } from '../../types'

interface LeetCodeWidgetProps {
    className?: string
    onClose?: () => void
    isEditMode?: boolean
}

// Generate realistic sample calendar for Sanjay's 196 active days
const SAMPLE_CALENDAR: Record<string, number> = (() => {
    const cal: Record<string, number> = {}
    const refNow = Math.floor(Date.now() / 1000)
    for (let i = 0; i < 365; i++) {
        // Creates ~196 active days across the year
        if ((i * 7 + 3) % 11 > 3) {
            cal[String(refNow - i * 86400)] = ((i % 4) + 1)
        }
    }
    return cal
})()

// Fallback sample data if network is disconnected initially
const FALLBACK_PROFILE: LeetCodeProfileData = {
    username: 's4njay',
    realName: 'Sanjay',
    ranking: 477036,
    streak: 46,
    maxStreak: 46,
    totalActiveDays: 196,
    solved: {
        all: 310,
        easy: 244,
        medium: 64,
        hard: 2,
    },
    allQuestionsCount: {
        all: 4046,
        easy: 963,
        medium: 2111,
        hard: 972,
    },
    submissionCalendar: SAMPLE_CALENDAR,
}

export function LeetCodeWidget({
    className = '',
    onClose,
}: LeetCodeWidgetProps) {
    const [profile, setProfile] = useState<LeetCodeProfileData | null>(FALLBACK_PROFILE)
    const [dailyQuestion, setDailyQuestion] = useState<LeetCodeDailyQuestion | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'gauge' | 'graph'>('gauge')
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [usernameInput, setUsernameInput] = useState('s4njay')
    const [isSaving, setIsSaving] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSolvedToday, setIsSolvedToday] = useState(false)

    useEffect(() => {
        loadData()
        checkTodaySolved()
    }, [])

    const checkTodaySolved = () => {
        const todayStr = new Date().toISOString().slice(0, 10)
        const saved = localStorage.getItem(`devpulse_leetcode_solved_${todayStr}`)
        if (saved === 'true') {
            setIsSolvedToday(true)
        }
    }

    const loadData = async (usernameToFetch?: string) => {
        setIsLoading(true)
        setError(null)
        try {
            if (window.electronAPI?.leetcode?.getProfile) {
                const targetUser = usernameToFetch || 's4njay'
                const res = await window.electronAPI.leetcode.getProfile(targetUser)
                if (res.success && res.data) {
                    setProfile(res.data)
                    if (res.data.daily) {
                        setDailyQuestion(res.data.daily)
                    }
                    setUsernameInput(res.data.username)
                } else if (res.message) {
                    setError(res.message)
                }
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err)
            setError(msg)
        } finally {
            setIsLoading(false)
        }
    }

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault()
        const cleanUser = usernameInput.trim()
        if (!cleanUser) return
        setIsSaving(true)
        setError(null)
        try {
            if (window.electronAPI?.leetcode?.getProfile) {
                const res = await window.electronAPI.leetcode.getProfile(cleanUser)
                if (res.success && res.data) {
                    setProfile(res.data)
                    if (res.data.daily) setDailyQuestion(res.data.daily)
                    setIsSettingsOpen(false)
                } else {
                    setError(res.message || `User "${cleanUser}" not found.`)
                }
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setIsSaving(false)
        }
    }

    const openExternal = (url: string) => {
        if (window.electronAPI?.openExternal) {
            window.electronAPI.openExternal(url)
        } else {
            window.open(url, '_blank')
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return
        openExternal(`https://leetcode.com/problemset/all/?search=${encodeURIComponent(searchQuery.trim())}`)
    }

    const handleToggleSolved = () => {
        const todayStr = new Date().toISOString().slice(0, 10)
        const next = !isSolvedToday
        setIsSolvedToday(next)
        localStorage.setItem(`devpulse_leetcode_solved_${todayStr}`, String(next))
    }

    const totalSolved = profile?.solved?.all || 310
    const totalQuestions = profile?.allQuestionsCount?.all || 4046
    const easySolved = profile?.solved?.easy || 244
    const easyTotal = profile?.allQuestionsCount?.easy || 963
    const medSolved = profile?.solved?.medium || 64
    const medTotal = profile?.allQuestionsCount?.medium || 2111
    const hardSolved = profile?.solved?.hard || 2
    const hardTotal = profile?.allQuestionsCount?.hard || 972

    // Compute 250-degree arc gauge SVG math
    const gaugeMath = useMemo(() => {
        const radius = 64
        const strokeWidth = 9
        // Arc spans 260 degrees (from 140deg to 400deg, leaving 100deg open at bottom)
        const arcDegrees = 260
        const totalCircumference = 2 * Math.PI * radius
        const totalArcLength = (arcDegrees / 360) * totalCircumference
        const gapLength = totalCircumference - totalArcLength

        // Fractions of total questions (or of total solved for colored sections)
        const solvedFraction = Math.min(1, totalSolved / (totalQuestions || 1))
        const solvedArc = solvedFraction * totalArcLength

        const easyFraction = totalSolved > 0 ? (easySolved / totalSolved) : 0
        const medFraction = totalSolved > 0 ? (medSolved / totalSolved) : 0
        const hardFraction = totalSolved > 0 ? (hardSolved / totalSolved) : 0

        const easyArc = solvedArc * easyFraction
        const medArc = solvedArc * medFraction
        const hardArc = solvedArc * hardFraction

        return {
            radius,
            strokeWidth,
            totalCircumference,
            totalArcLength,
            gapLength,
            easyArc,
            medArc,
            hardArc,
            solvedArc,
        }
    }, [totalSolved, totalQuestions, easySolved, medSolved, hardSolved])

    // Generate real 1-year contribution heatmap cells
    const heatmapData = useMemo(() => {
        const weeks = 36 // show last 36 weeks for crisp compact desktop fit
        const now = new Date()
        const calendar = profile?.submissionCalendar || {}

        // Month labels accumulator
        const months: { label: string; col: number }[] = []
        let lastMonth = -1

        const grid: { timestamp: number; count: number; dateStr: string }[][] = []

        // Calculate start date: (weeks * 7) days ago, aligned to Sunday
        const startDate = new Date(now)
        startDate.setDate(now.getDate() - (weeks * 7) + (7 - now.getDay()))

        const iter = new Date(startDate)

        for (let w = 0; w < weeks; w++) {
            const weekCol: { timestamp: number; count: number; dateStr: string }[] = []
            for (let d = 0; d < 7; d++) {
                const year = iter.getFullYear()
                const month = iter.getMonth()
                const day = iter.getDate()

                if (d === 0 && month !== lastMonth) {
                    months.push({
                        label: iter.toLocaleString('default', { month: 'short' }),
                        col: w,
                    })
                    lastMonth = month
                }

                // Midnight UTC timestamp for LeetCode match
                const utcMidnight = Date.UTC(year, month, day) / 1000
                // Match exact timestamp or approximate day (+/- 86400)
                let count = calendar[utcMidnight] || 0
                if (!count) {
                    for (const [tsStr, c] of Object.entries(calendar)) {
                        const ts = Number(tsStr)
                        if (Math.abs(ts - utcMidnight) < 43200) {
                            count = c
                            break
                        }
                    }
                }

                weekCol.push({
                    timestamp: utcMidnight,
                    count,
                    dateStr: iter.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                })

                iter.setDate(iter.getDate() + 1)
            }
            grid.push(weekCol)
        }

        return { grid, months }
    }, [profile?.submissionCalendar])

    const getHeatmapColor = (count: number) => {
        if (count === 0) return 'bg-[#222228]'
        if (count <= 2) return 'bg-[#0e4429]'
        if (count <= 5) return 'bg-[#006d32]'
        if (count <= 9) return 'bg-[#26a641]'
        return 'bg-[#39d353]'
    }

    return (
        <div
            className={`mac-widget-tile p-4 w-full select-none relative group transition-all duration-200 flex flex-col justify-between overflow-hidden ${className}`}
            style={{ minHeight: '430px' }}
        >
            {/* ✕ Close button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#ff453a]/90 hover:bg-[#ff453a] text-white font-bold text-[11px] flex items-center justify-center shadow-lg cursor-pointer z-30 transition-transform hover:scale-110 active:scale-95"
                    title="Close LeetCode Widget"
                >
                    ✕
                </button>
            )}

            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3 pr-8">
                    <div className="flex items-center gap-2">
                        {/* LeetCode Icon */}
                        <div className="w-6 h-6 rounded-lg bg-[#ffa116]/20 border border-[#ffa116]/40 flex items-center justify-center text-xs font-bold text-[#ffa116] shadow-sm">
                            ⚡
                        </div>
                        <span className="font-bold text-sm tracking-wide text-white">LEETCODE</span>

                        {/* Connected User Pill */}
                        <button
                            onClick={() => openExternal(`https://leetcode.com/u/${profile?.username || 's4njay'}/`)}
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#ffa116] bg-[#ffa116]/15 hover:bg-[#ffa116]/25 px-2.5 py-0.5 rounded-full border border-[#ffa116]/30 transition-colors cursor-pointer"
                            title="Open Profile on LeetCode"
                        >
                            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                            <span>@{profile?.username || 's4njay'}</span>
                        </button>
                    </div>

                    {/* Streak Badge */}
                    <div className="flex items-center gap-1">
                        <span className="flex items-center gap-1 text-xs font-bold text-[#ffa116] bg-[#ffa116]/15 px-2.5 py-0.5 rounded-full border border-[#ffa116]/30">
                            <span>🔥</span>
                            <span>{profile?.streak ?? 46}d</span>
                        </span>

                        <button
                            onClick={() => loadData(profile?.username)}
                            disabled={isLoading}
                            className="text-white/40 hover:text-white text-sm p-1 cursor-pointer transition-colors"
                            title="Refresh LeetCode Data"
                        >
                            {isLoading ? '⋯' : '↻'}
                        </button>

                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className={`text-sm p-1 rounded cursor-pointer transition-colors ${
                                isSettingsOpen ? 'text-[#ffa116] bg-[#ffa116]/20' : 'text-white/40 hover:text-white'
                            }`}
                            title="Connect LeetCode ID"
                        >
                            ⚙
                        </button>
                    </div>
                </div>

                {/* Inline Connect Popover */}
                {isSettingsOpen && (
                    <div className="mb-3 p-3 rounded-2xl bg-[#141418] border border-[#ffa116]/30 shadow-2xl text-xs z-20 animate-fade-in">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-white flex items-center gap-1.5">
                                <span>⚡</span>
                                <span>Connect LeetCode Account</span>
                            </span>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-white/40 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleConnect} className="flex gap-2">
                            <input
                                type="text"
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                placeholder="LeetCode username"
                                className="flex-1 px-3 py-1.5 rounded-xl bg-[#202026] border border-white/15 text-white text-xs placeholder-white/30 focus:outline-none focus:border-[#ffa116] font-mono"
                            />
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="py-1.5 px-3 rounded-xl bg-[#ffa116] hover:bg-[#ffb034] text-black font-bold text-xs cursor-pointer disabled:opacity-50"
                            >
                                {isSaving ? '...' : 'Sync'}
                            </button>
                        </form>
                        {error && <div className="text-[10px] text-rose-400 mt-1.5">{error}</div>}
                    </div>
                )}

                {/* View Switcher: [Progress Gauge] [Year Heatmap] */}
                <div className="flex items-center gap-1 p-1 bg-[#18181e] border border-white/10 rounded-xl mb-3">
                    <button
                        onClick={() => setActiveTab('gauge')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            activeTab === 'gauge'
                                ? 'bg-[#2c2c34] text-white shadow-sm border border-white/10'
                                : 'text-white/50 hover:text-white'
                        }`}
                    >
                        <span>⭕</span>
                        <span>Solved Gauge</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('graph')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            activeTab === 'graph'
                                ? 'bg-[#2c2c34] text-white shadow-sm border border-white/10'
                                : 'text-white/50 hover:text-white'
                        }`}
                    >
                        <span>🟩</span>
                        <span>Year Graph ({profile?.totalActiveDays ?? 196})</span>
                    </button>
                </div>

                {/* TAB 1: EXACT LEETCODE CIRCULAR ARC GAUGE (Screenshot 2) */}
                {activeTab === 'gauge' && (
                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#16161c] border border-white/10 mb-3 relative">
                        <div className="relative w-44 h-40 flex items-center justify-center">
                            <svg className="w-44 h-40 transform rotate-[140deg]" viewBox="0 0 160 160">
                                {/* Dark background track */}
                                <circle
                                    cx="80"
                                    cy="80"
                                    r={gaugeMath.radius}
                                    fill="none"
                                    stroke="#26262e"
                                    strokeWidth={gaugeMath.strokeWidth}
                                    strokeDasharray={`${gaugeMath.totalArcLength} ${gaugeMath.gapLength}`}
                                    strokeLinecap="round"
                                />

                                {/* Easy (Cyan/Teal) Segment */}
                                <circle
                                    cx="80"
                                    cy="80"
                                    r={gaugeMath.radius}
                                    fill="none"
                                    stroke="#00b8a3"
                                    strokeWidth={gaugeMath.strokeWidth}
                                    strokeDasharray={`${gaugeMath.easyArc} ${gaugeMath.totalCircumference}`}
                                    strokeDashoffset="0"
                                    strokeLinecap="round"
                                />

                                {/* Medium (Amber/Yellow) Segment */}
                                <circle
                                    cx="80"
                                    cy="80"
                                    r={gaugeMath.radius}
                                    fill="none"
                                    stroke="#ffc01e"
                                    strokeWidth={gaugeMath.strokeWidth}
                                    strokeDasharray={`${gaugeMath.medArc} ${gaugeMath.totalCircumference}`}
                                    strokeDashoffset={-gaugeMath.easyArc}
                                    strokeLinecap="round"
                                />

                                {/* Hard (Red) Segment */}
                                <circle
                                    cx="80"
                                    cy="80"
                                    r={gaugeMath.radius}
                                    fill="none"
                                    stroke="#ff375f"
                                    strokeWidth={gaugeMath.strokeWidth}
                                    strokeDasharray={`${gaugeMath.hardArc} ${gaugeMath.totalCircumference}`}
                                    strokeDashoffset={-(gaugeMath.easyArc + gaugeMath.medArc)}
                                    strokeLinecap="round"
                                />
                            </svg>

                            {/* Gauge Center Text (Exact match to Screenshot 2) */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none pb-3">
                                <div className="flex items-baseline gap-0.5">
                                    <span className="text-3xl font-extrabold text-white tracking-tight leading-none font-mono">
                                        {totalSolved}
                                    </span>
                                    <span className="text-sm font-medium text-white/40 font-mono">
                                        /{totalQuestions}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1 text-xs font-semibold text-[#22c55e] mt-1">
                                    <span>✓</span>
                                    <span>Solved</span>
                                </div>

                                <div className="text-[10px] text-white/50 font-medium mt-1">
                                    {profile?.ranking ? `Rank #${profile.ranking.toLocaleString()}` : '40 Attempting'}
                                </div>
                            </div>
                        </div>

                        {/* Breakdown Pills: Easy, Medium, Hard (Exact match) */}
                        <div className="grid grid-cols-3 gap-2 w-full mt-1">
                            <div className="p-2 rounded-xl bg-[#00b8a3]/10 border border-[#00b8a3]/25 text-center">
                                <div className="text-[10px] font-bold text-[#00b8a3] uppercase tracking-wider">Easy</div>
                                <div className="text-sm font-extrabold text-white font-mono">{easySolved}</div>
                                <div className="text-[9px] text-white/40 font-mono">/{easyTotal}</div>
                            </div>

                            <div className="p-2 rounded-xl bg-[#ffc01e]/10 border border-[#ffc01e]/25 text-center">
                                <div className="text-[10px] font-bold text-[#ffc01e] uppercase tracking-wider">Med</div>
                                <div className="text-sm font-extrabold text-white font-mono">{medSolved}</div>
                                <div className="text-[9px] text-white/40 font-mono">/{medTotal}</div>
                            </div>

                            <div className="p-2 rounded-xl bg-[#ff375f]/10 border border-[#ff375f]/25 text-center">
                                <div className="text-[10px] font-bold text-[#ff375f] uppercase tracking-wider">Hard</div>
                                <div className="text-sm font-extrabold text-white font-mono">{hardSolved}</div>
                                <div className="text-[9px] text-white/40 font-mono">/{hardTotal}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: EXACT LEETCODE 1-YEAR CONTRIBUTION HEATMAP (Screenshot 3) */}
                {activeTab === 'graph' && (
                    <div className="p-3.5 rounded-2xl bg-[#16161c] border border-white/10 mb-3">
                        {/* Heatmap Header */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-semibold text-white/90">
                                <span className="text-white font-bold">{profile?.totalActiveDays || 196}</span>{' '}
                                <span className="text-white/60">submissions in past year</span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] font-mono text-white/60">
                                <span>Max streak: <strong className="text-[#ffa116]">{profile?.streak || 46}</strong></span>
                                <span className="px-2 py-0.5 bg-[#26262e] border border-white/10 rounded-md text-[10px] text-white">
                                    Current ▾
                                </span>
                            </div>
                        </div>

                        {/* Heatmap Grid (Weeks x 7 Days) */}
                        <div className="overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
                            <div className="inline-block min-w-full">
                                {/* Aligned Month Labels */}
                                <div className="relative h-3.5 mb-1.5 text-[9px] font-mono text-white/50 select-none">
                                    {heatmapData.months.map((m, idx) => (
                                        <span
                                            key={idx}
                                            className="absolute truncate"
                                            style={{ left: `${m.col * 10}px` }}
                                        >
                                            {m.label}
                                        </span>
                                    ))}
                                </div>

                                {/* Heatmap Grid */}
                                <div className="flex gap-[3px] items-center">
                                    {heatmapData.grid.map((week, wIdx) => (
                                        <div key={wIdx} className="flex flex-col gap-[3px]">
                                            {week.map((day, dIdx) => (
                                                <div
                                                    key={dIdx}
                                                    title={`${day.dateStr}: ${day.count} submissions`}
                                                    className={`w-[7px] h-[7px] rounded-[2px] ${getHeatmapColor(day.count)} transition-transform hover:scale-125 hover:ring-1 hover:ring-white cursor-pointer`}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Intensity Legend */}
                        <div className="flex items-center justify-end gap-1 text-[9px] font-mono text-white/40 mt-2">
                            <span>Less</span>
                            <span className="w-2 h-2 rounded-[2px] bg-[#23232a] border border-white/[0.04]" />
                            <span className="w-2 h-2 rounded-[2px] bg-[#0e4429]" />
                            <span className="w-2 h-2 rounded-[2px] bg-[#006d32]" />
                            <span className="w-2 h-2 rounded-[2px] bg-[#26a641]" />
                            <span className="w-2 h-2 rounded-[2px] bg-[#39d353]" />
                            <span>More</span>
                        </div>
                    </div>
                )}

                {/* Problem of the Day (Live Official LeetCode Daily) */}
                <div className="p-3 rounded-2xl bg-[#16161c] border border-white/10 mb-2.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-white/50 mb-1">
                        <span className="text-[#ffa116] font-semibold tracking-wider">PROBLEM OF THE DAY</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30">
                            {dailyQuestion?.difficulty || 'Medium'}
                        </span>
                    </div>

                    <div className="text-xs font-bold text-white mb-2 truncate">
                        #{dailyQuestion?.id || '128'}. {dailyQuestion?.title || 'Longest Consecutive Sequence'}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => openExternal(dailyQuestion?.link || 'https://leetcode.com/problems/longest-consecutive-sequence/')}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-[#ffa116] hover:bg-[#ffb034] text-black font-extrabold text-xs flex items-center justify-center gap-1 cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 shadow-md"
                        >
                            <span>Solve</span>
                            <span>↗</span>
                        </button>

                        <button
                            onClick={handleToggleSolved}
                            className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                                isSolvedToday
                                    ? 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/40'
                                    : 'bg-[#26262e] text-white/70 border-white/10 hover:text-white'
                            }`}
                        >
                            <span>{isSolvedToday ? '✓ Done' : 'Mark Done'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Problem Search Bar */}
            <form onSubmit={handleSearch} className="relative mt-1">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search LeetCode (e.g. Two Sum, 200)..."
                    className="w-full pl-3 pr-8 py-2 rounded-xl bg-[#16161c] border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#ffa116] transition-colors"
                />
                <button
                    type="submit"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#ffa116] text-xs cursor-pointer"
                >
                    🔍
                </button>
            </form>
        </div>
    )
}
