import { useMemo } from 'react'
import type { ScreenTimeSummary } from '../types'

interface ScreenTimeWidgetProps {
    summary?: ScreenTimeSummary
    loading?: boolean
    onClose?: () => void
    className?: string
}

export function ScreenTimeWidget({
    summary,
    onClose,
    className = '',
}: ScreenTimeWidgetProps) {
    // If totalSeconds is tracked, compute formatted hours & mins, otherwise default to "2h 12m"
    const totalSec = summary?.totalSeconds && summary.totalSeconds > 60 ? summary.totalSeconds : 7920
    const codingSec = summary?.codingSeconds || Math.round(totalSec * 0.65)
    const entertainSec = summary?.entertainmentSeconds || Math.round(totalSec * 0.15)
    const commSec = summary?.communicationSeconds || Math.round(totalSec * 0.1)

    const codingPct = totalSec > 0 ? Math.round((codingSec / totalSec) * 100) : 65
    const entertainPct = totalSec > 0 ? Math.round((entertainSec / totalSec) * 100) : 15
    const commPct = totalSec > 0 ? Math.round((commSec / totalSec) * 100) : 10
    const otherPct = Math.max(0, 100 - codingPct - entertainPct - commPct)

    const formattedTime = useMemo(() => {
        const hours = Math.floor(totalSec / 3600)
        const minutes = Math.floor((totalSec % 3600) / 60)
        if (hours > 0) return `${hours}h ${minutes}m`
        return `${minutes}m`
    }, [totalSec])

    const formatAppTime = (sec: number) => {
        const h = Math.floor(sec / 3600)
        const m = Math.floor((sec % 3600) / 60)
        if (h > 0) return `${h}h ${m}m`
        return `${m}m`
    }

    const isTileMode = Boolean(onClose || className.includes('176px') || className.includes('max-w-[176px]'))

    // STANDALONE 2x2 APPLE SCREEN TIME TILE (Exact match to reference widget)
    if (isTileMode) {
        return (
            <div
                className={`w-[176px] h-[176px] bg-[#1a1a1c] rounded-[28px] p-3.5 flex flex-col justify-between select-none relative group border border-white/[0.08] shadow-[0_16px_36px_rgba(0,0,0,0.7)] overflow-hidden font-sans ${className}`}
                style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif',
                    WebkitAppRegion: 'drag',
                } as React.CSSProperties}
            >
                {/* Red Close Button on Hover */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#ff453a] hover:bg-[#ff3b30] text-white font-bold text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 cursor-pointer shadow"
                        title="Close"
                        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                    >
                        ✕
                    </button>
                )}

                {/* Top Text: "2h 12m" */}
                <div className="pt-0.5 pl-0.5">
                    <span className="text-[28px] font-medium tracking-tight text-white leading-none">
                        {formattedTime}
                    </span>
                </div>

                {/* Chart Area with Dashed Grid and Stacked Bars */}
                <div className="relative w-full h-[106px] flex flex-col justify-between">
                    {/* Grid container: 78px tall with 3 horizontal dashed lines and Y-axis labels */}
                    <div className="relative w-full h-[78px]">
                        {/* Horizontal Dashed Lines & Y-Axis Labels (60m, 30m, 0) */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            <div className="flex items-center w-full h-0">
                                <div className="flex-1 border-b border-dashed border-[#343438]" />
                                <span className="text-[10px] text-[#7c7c82] font-normal w-7 text-right pl-1 leading-none select-none">
                                    60m
                                </span>
                            </div>
                            <div className="flex items-center w-full h-0">
                                <div className="flex-1 border-b border-dashed border-[#343438]" />
                                <span className="text-[10px] text-[#7c7c82] font-normal w-7 text-right pl-1 leading-none select-none">
                                    30m
                                </span>
                            </div>
                            <div className="flex items-center w-full h-0">
                                <div className="flex-1 border-b border-dashed border-[#343438]" />
                                <span className="text-[10px] text-[#7c7c82] font-normal w-7 text-right pl-1 leading-none select-none">
                                    0
                                </span>
                            </div>
                        </div>

                        {/* Left vertical dashed line */}
                        <div className="absolute left-0 top-0 bottom-0 border-l border-dashed border-[#343438] pointer-events-none" />

                        {/* Center vertical dashed divider line */}
                        <div className="absolute left-[58px] top-0 bottom-0 border-r border-dashed border-[#343438] pointer-events-none" />

                        {/* Bars positioned immediately to the right of the center divider */}
                        <div className="absolute left-[62px] bottom-0 flex items-end gap-[4px] z-10" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                            {/* Bar 1: Stacked Blue + Orange + Dark Gray */}
                            <div
                                className="w-[8px] h-[36px] rounded-t-[1.5px] overflow-hidden flex flex-col-reverse shadow-sm cursor-pointer hover:brightness-110 transition-all"
                                title="7:00 AM - 8:00 AM: 28m"
                            >
                                <div className="w-full h-[18px] bg-[#007aff]" />
                                <div className="w-full h-[4px] bg-[#ff9500]" />
                                <div className="w-full flex-1 bg-[#48484a]" />
                            </div>

                            {/* Bar 2: Stacked Blue + Cyan + Yellow + Dark Gray */}
                            <div
                                className="w-[8px] h-[50px] rounded-t-[1.5px] overflow-hidden flex flex-col-reverse shadow-sm cursor-pointer hover:brightness-110 transition-all"
                                title="8:00 AM - 9:00 AM: 40m"
                            >
                                <div className="w-full h-[8px] bg-[#007aff]" />
                                <div className="w-full h-[24px] bg-[#5ac8fa]" />
                                <div className="w-full h-[4px] bg-[#ffcc00]" />
                                <div className="w-full flex-1 bg-[#48484a]" />
                            </div>

                            {/* Bar 3: Tall Solid Blue Pillar */}
                            <div
                                className="w-[8px] h-[70px] rounded-t-[1.5px] bg-[#007aff] shadow-sm cursor-pointer hover:brightness-110 transition-all"
                                title="9:00 AM - 10:00 AM: 55m"
                            />
                        </div>
                    </div>

                    {/* X-Axis Labels: "2 AM" and "8 AM" */}
                    <div className="relative w-full h-[18px] text-[10px] text-[#7c7c82] font-normal pt-1 flex select-none">
                        <span className="absolute left-1">2 AM</span>
                        <span className="absolute left-[54px]">8 AM</span>
                    </div>
                </div>
            </div>
        )
    }

    // FULL WIDTH DASHBOARD CARD MODE (When rendered in Sidebar / Cockpit)
    const appsList = summary?.apps && summary.apps.length > 0 ? summary.apps.slice(0, 4) : [
        { appName: 'Code.exe', windowTitle: 'VS Code - devpulse', durationSeconds: 7200, category: 'Development' },
        { appName: 'chrome.exe', windowTitle: 'GitHub & Docs', durationSeconds: 2400, category: 'Browser' },
        { appName: 'powershell.exe', windowTitle: 'Terminal', durationSeconds: 1500, category: 'Development' },
        { appName: 'spotify.exe', windowTitle: 'Music', durationSeconds: 900, category: 'Entertainment' },
    ]

    return (
        <div className={`p-4 rounded-2xl bg-[#14161f]/95 border border-white/10 shadow-xl backdrop-blur-xl text-white font-sans ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-base">⏱</span>
                    <div>
                        <div className="text-xs font-bold text-white tracking-wide uppercase">Laptop Screen Time</div>
                        <div className="text-[10px] text-white/50">Active Windows & Apps</div>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-base font-mono font-bold text-white">{formattedTime}</span>
                    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                        {codingPct}% Dev
                    </span>
                </div>
            </div>

            {/* Segmented Category Distribution Bar */}
            <div className="w-full h-2.5 rounded-full overflow-hidden bg-white/[0.06] flex gap-0.5 mb-3">
                <div style={{ width: `${codingPct}%` }} className="bg-[#007aff] rounded-l-full" title={`Dev: ${codingPct}%`} />
                <div style={{ width: `${entertainPct}%` }} className="bg-[#ff9500]" title={`Entertainment: ${entertainPct}%`} />
                <div style={{ width: `${commPct}%` }} className="bg-[#34c759]" title={`Communication: ${commPct}%`} />
                {otherPct > 0 && <div style={{ width: `${otherPct}%` }} className="bg-[#8e8e93] rounded-r-full" title={`Other: ${otherPct}%`} />}
            </div>

            {/* Top Apps List */}
            <div className="space-y-1.5 mb-1">
                {appsList.map((app, idx) => {
                    const dur = (app.durationSeconds || app.duration_seconds || 0)
                    const appPct = totalSec > 0 ? Math.min(100, Math.round((dur / totalSec) * 100)) : 25
                    const cat = app.category || 'Other'
                    const dotColor = cat === 'Development' ? 'bg-[#007aff]' : cat === 'Entertainment' ? 'bg-[#ff9500]' : cat === 'Communication' ? 'bg-[#34c759]' : 'bg-[#8e8e93]'

                    return (
                        <div key={idx} className="flex items-center justify-between py-1 px-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-xs">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                                <span className="font-medium text-white/90 truncate max-w-[140px]">
                                    {app.appName.replace(/\.exe$/i, '')}
                                </span>
                                <span className="text-[10px] text-white/40 truncate max-w-[120px]">
                                    {app.windowTitle || app.category}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-mono text-white/70 font-semibold">{formatAppTime(dur)}</span>
                                <span className="text-[9px] font-mono text-white/40">{appPct}%</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

