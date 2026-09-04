import { ipcMain } from 'electron'
import { exec } from 'child_process'
import { promisify } from 'util'
import { getDB } from '../database'
import { localDate } from '../lib/dates'
import { recalculateScore } from './tasks'

const execAsync = promisify(exec)

export interface GitCommit {
    hash: string
    author: string
    message: string
    time: string
}

export interface GitRepoInfo {
    repoName: string
    repoPath: string
    branch: string
    todayCommitCount: number
    commits: GitCommit[]
    isGitRepo: boolean
}

export function registerGitIPC() {
    const db = getDB()

    ipcMain.handle('git:getRepoInfo', async (_e, customPath?: string): Promise<GitRepoInfo> => {
        // Default to current working directory or custom path
        const repoPath = customPath || process.cwd()

        try {
            // Check if git repo and get branch
            const { stdout: branchOut } = await execAsync('git branch --show-current', {
                cwd: repoPath,
                timeout: 3000,
            })
            const branch = branchOut.trim() || 'main'

            // Get repo name
            const { stdout: topLevel } = await execAsync('git rev-parse --show-toplevel', {
                cwd: repoPath,
                timeout: 3000,
            })
            const cleanTopLevel = topLevel.trim().replace(/\\/g, '/')
            const repoName = cleanTopLevel.split('/').pop() || 'Repository'

            // Get commits since midnight
            const { stdout: logOut } = await execAsync(
                'git log --since="midnight" --pretty=format:"%h|%an|%s|%cr"',
                {
                    cwd: repoPath,
                    timeout: 4000,
                }
            )

            const commits: GitCommit[] = []
            const lines = logOut.trim().split('\n').filter(Boolean)
            for (const line of lines) {
                const parts = line.split('|')
                if (parts.length >= 4) {
                    commits.push({
                        hash: parts[0],
                        author: parts[1],
                        message: parts[2],
                        time: parts[3],
                    })
                }
            }

            const todayCommitCount = commits.length

            // Sync with goals table (type = 'github')
            if (todayCommitCount > 0) {
                db.prepare(`UPDATE goals SET current = MAX(current, ?) WHERE type = 'github'`).run(todayCommitCount)

                // Sync with daily_scores github_pts
                const today = localDate()
                const githubPts = Math.min(20, todayCommitCount * 5)
                db.prepare(`
                    UPDATE daily_scores
                    SET github_pts = ?
                    WHERE date = ?
                `).run(githubPts, today)

                recalculateScore()
            }

            return {
                repoName,
                repoPath,
                branch,
                todayCommitCount,
                commits,
                isGitRepo: true,
            }
        } catch {
            return {
                repoName: 'No Git Repository',
                repoPath,
                branch: '-',
                todayCommitCount: 0,
                commits: [],
                isGitRepo: false,
            }
        }
    })
}
