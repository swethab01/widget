import { useState } from 'react'

interface LeetCodeWidgetProps {
    className?: string
    onClose?: () => void
    isEditMode?: boolean
}

interface LeetProblem {
    id: number
    title: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
    category: string
    acceptance: string
    url: string
}

const DAILY_PROBLEMS: LeetProblem[] = [
    {
        id: 128,
        title: 'Longest Consecutive Sequence',
        difficulty: 'Medium',
        category: 'Hash Table • Union Find',
        acceptance: '48.2%',
        url: 'https://leetcode.com/problems/longest-consecutive-sequence/',
    },
    {
        id: 322,
        title: 'Coin Change (Dynamic Programming)',
        difficulty: 'Medium',
        category: 'DP • Breadth-First Search',
        acceptance: '43.6%',
        url: 'https://leetcode.com/problems/coin-change/',
    },
    {
        id: 42,
        title: 'Trapping Rain Water',
        difficulty: 'Hard',
        category: 'Two Pointers • Stack • Monotonic',
        acceptance: '61.4%',
        url: 'https://leetcode.com/problems/trapping-rain-water/',
    },
    {
        id: 1,
        title: 'Two Sum',
        difficulty: 'Easy',
        category: 'Array • Hash Table',
        acceptance: '53.8%',
        url: 'https://leetcode.com/problems/two-sum/',
    },
]

export function LeetCodeWidget({
    className = '',
    onClose,
    isEditMode = false,
}: LeetCodeWidgetProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
    const [isSolvedToday, setIsSolvedToday] = useState(false)
    const [streakDays, setStreakDays] = useState(14)

    const problem = DAILY_PROBLEMS[currentProblemIndex]

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return
        const targetUrl = `https://leetcode.com/problemset/all/?search=${encodeURIComponent(
            searchQuery.trim()
        )}`
        if (window.electronAPI?.openExternal) {
            window.electronAPI.openExternal(targetUrl)
        } else {
            window.open(targetUrl, '_blank')
        }
    }

    const handleOpenProblem = (url: string) => {
        if (window.electronAPI?.openExternal) {
            window.electronAPI.openExternal(url)
        } else {
            window.open(url, '_blank')
        }
    }

    const handleToggleSolved = () => {
        if (!isSolvedToday) {
            setIsSolvedToday(true)
            setStreakDays((prev) => prev + 1)
        } else {
            setIsSolvedToday(false)
            setStreakDays((prev) => Math.max(1, prev - 1))
        }
    }

    const getDifficultyColor = (diff: 'Easy' | 'Medium' | 'Hard') => {
        switch (diff) {
            case 'Easy':
                return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
            case 'Medium':
                return 'text-amber-400 bg-amber-500/15 border-amber-500/30'
            case 'Hard':
                return 'text-rose-400 bg-rose-500/15 border-rose-500/30'
        }
    }

    return (
        <div
            className={`mac-widget-tile p-4 w-80 select-none relative group transition-all duration-200 ${className}`}
        >
            {/* Remove badge in Edit Mode */}
            {isEditMode && onClose && (
                <button
                    onClick={onClose}
                    className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center shadow-lg cursor-pointer z-30 transition-transform hover:scale-110"
                    title="Remove LeetCode Widget"
                >
                    ✕
                </button>
            )}

            {/* Header */}
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-white/50 mb-2.5">
                <div className="flex items-center gap-1.5">
                    {/* LeetCode Icon */}
                    <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[10px] font-bold text-amber-400">
                        ⚡
                    </div>
                    <span className="font-semibold text-white/80">LEETCODE</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <span>🔥</span>
                        <span>{streakDays}d</span>
                    </span>
                    <button
                        onClick={() =>
                            setCurrentProblemIndex((prev) => (prev + 1) % DAILY_PROBLEMS.length)
                        }
                        className="text-white/40 hover:text-white transition-colors text-xs p-0.5 cursor-pointer"
                        title="Next Daily Problem"
                    >
                        ↻
                    </button>
                </div>
            </div>

            {/* Daily Problem Card */}
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-3">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-medium text-amber-400/90 uppercase tracking-wider">
                        Problem of the Day
                    </span>
                    <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getDifficultyColor(
                            problem.difficulty
                        )}`}
                    >
                        {problem.difficulty}
                    </span>
                </div>

                <div className="text-sm font-semibold text-white mb-1 line-clamp-1">
                    #{problem.id} {problem.title}
                </div>

                <div className="flex items-center justify-between text-[10px] text-white/40 font-mono mb-2">
                    <span>{problem.category}</span>
                    <span>Acc: {problem.acceptance}</span>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleOpenProblem(problem.url)}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer"
                    >
                        <span>Solve</span>
                        <span className="text-[9px]">↗</span>
                    </button>

                    <button
                        onClick={handleToggleSolved}
                        className={`py-1.5 px-3 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                            isSolvedToday
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-white/[0.06] border-white/10 text-white/70 hover:text-white hover:bg-white/15'
                        }`}
                    >
                        {isSolvedToday ? '✓ Solved' : 'Mark Done'}
                    </button>
                </div>
            </div>

            {/* LeetCode Quick Search Bar */}
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search LeetCode (e.g. Two Sum, 200)..."
                    className="w-full px-3 py-1.5 pr-8 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400/60 transition-colors font-sans"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-amber-400 text-xs transition-colors cursor-pointer"
                    title="Search LeetCode"
                >
                    🔍
                </button>
            </form>

            {/* Quick Topic Chips */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto scrollbar-hide text-[9px] font-mono text-white/50">
                {['Dynamic Prog', 'Binary Tree', 'Graph', 'Array'].map((tag) => (
                    <button
                        key={tag}
                        type="button"
                        onClick={() => {
                            setSearchQuery(tag)
                            const targetUrl = `https://leetcode.com/problemset/all/?search=${encodeURIComponent(
                                tag
                            )}`
                            if (window.electronAPI?.openExternal) {
                                window.electronAPI.openExternal(targetUrl)
                            } else {
                                window.open(targetUrl, '_blank')
                            }
                        }}
                        className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/10 hover:text-white border border-white/[0.06] transition-colors whitespace-nowrap cursor-pointer"
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    )
}
