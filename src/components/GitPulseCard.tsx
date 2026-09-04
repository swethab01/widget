import { useState, useEffect, useCallback } from 'react'
import { Card } from './ui/Card'
import type { GitRepoInfo } from '../types'

export function GitPulseCard() {
    const [repoInfo, setRepoInfo] = useState<GitRepoInfo | null>(null)
    const [loading, setLoading] = useState(false)

    const fetchGit = useCallback(async () => {
        setLoading(true)
        try {
            if (window.electronAPI?.git) {
                const info = await window.electronAPI.git.getRepoInfo()
                setRepoInfo(info)
            }
        } catch {
            // ignore
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchGit()
        const interval = setInterval(fetchGit, 60000)
        return () => clearInterval(interval)
    }, [fetchGit])

    if (!repoInfo || !repoInfo.isGitRepo) {
        return (
            <Card>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm">🐙</span>
                        <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Git Pulse</span>
                    </div>
                    <button
                        onClick={fetchGit}
                        className="text-[10px] text-text-muted hover:text-accent transition-colors"
                        title="Rescan Git"
                    >
                        ↻ Check
                    </button>
                </div>
                <div className="text-[10px] text-text-muted mt-2">
                    Open a Git repository to auto-track local commits.
                </div>
            </Card>
        )
    }

    return (
        <Card className="relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm">🐙</span>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-text-primary">{repoInfo.repoName}</span>
                            <span className="text-[9px] bg-accent-purple/10 text-accent-purple border border-accent-purple/20 px-1.5 py-0.2 rounded font-mono">
                                🌿 {repoInfo.branch}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={fetchGit}
                        disabled={loading}
                        className="text-[10px] text-text-muted hover:text-accent transition-colors"
                    >
                        {loading ? '…' : '↻'}
                    </button>
                </div>
            </div>

            {/* Commits today badge */}
            <div className="flex items-center justify-between bg-surface-hover/80 rounded-lg px-2.5 py-2 mb-2 border border-surface-border">
                <span className="text-[11px] text-text-secondary">Today's Local Commits</span>
                <span className="text-sm font-mono font-bold text-accent-purple">
                    {repoInfo.todayCommitCount} <span className="text-[10px] text-text-muted font-normal">commits</span>
                </span>
            </div>

            {/* Latest commits */}
            {repoInfo.commits.length > 0 ? (
                <div className="space-y-1.5">
                    <div className="text-[9px] text-text-muted uppercase tracking-wider">Recent Commits</div>
                    {repoInfo.commits.slice(0, 2).map((c) => (
                        <div key={c.hash} className="text-[10px] flex items-baseline gap-1.5 truncate">
                            <span className="font-mono text-accent-purple/80 text-[9px]">{c.hash}</span>
                            <span className="text-text-primary truncate flex-1">{c.message}</span>
                            <span className="text-text-muted text-[8px] whitespace-nowrap">{c.time}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-[10px] text-text-muted text-center py-1">
                    No commits logged yet today. Keep coding!
                </div>
            )}
        </Card>
    )
}
