# DevPulse — Developer Productivity Widget

## Phase 1 MVP — Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm 9+
- Windows 10/11

### Installation

```bash
cd widget
npm install
```

### Development (Electron + Vite hot reload)

```bash
npm run electron:dev
```

### Build (Production)

```bash
npm run electron:build
```

The installer will be in the `release/` folder.

---

### Architecture

- **Electron** (main process) — window management, screen time tracking, SQLite
- **React + Vite** (renderer) — UI, components, pages
- **Tailwind CSS** — styling (dark mode first)
- **better-sqlite3** — local SQLite database
- **TypeScript** — end-to-end type safety

### Database Location

`%APPDATA%\devpulse\devpulse.db`

### Phase 2 (Coming Soon)

- GitHub integration
- LeetCode integration  
- Gmail integration
- Google Calendar
- AI Daily Briefing
