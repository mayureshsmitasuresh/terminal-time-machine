# 📚 Terminal Time Machine - Documentation

Welcome to the comprehensive documentation for **Terminal Time Machine (TTM)**. This tool transforms your git history into rich narratives, visual graphs, and actionable insights.

## Table of Contents
- [Installation](#installation)
- [Commands](#commands)
  - [Mission Control (`dashboard`)](#mission-control-dashboard)
  - [Git Simulator (`simulator`)](#git-simulator-simulator)
  - [Timeline (`timeline`)](#timeline-timeline)
  - [Stats (`stats`)](#statistics-stats)
  - [Story Mode (`story`)](#story-mode-story)
  - [Release Notes (`release-notes`)](#release-notes-release-notes)
  - [Upgrades (`upgrades`)](#upgrades-upgrades)
  - [Contributors (`contributors`)](#contributors-contributors)
- [Git Native Extension](#git-native-extension)
- [Export & Reporting](#export--reporting)
- [Configuration](#configuration)

---

## Installation

```bash
npm install -g terminal-time-machine
```

Or run directly with `npx`:

```bash
npx terminal-time-machine [command]
```

---

## Commands

### Mission Control (`dashboard`)
**Alias:** `dash`

A high-level "Mission Control" center for your project. Displays your current streak, recent impact velocity, and a quick health check of the repository.

```bash
ttm dashboard
```

**Features:**
- **Status Check**: See if you are "Online" (active in last 48h) or "Idle".
- **Impact Velocity**: A visual bar representing the significance of your recent commits.
- **Recent Shell Activity**: Displays the last few commands you ran in your terminal (context-aware).
- **Quick Links**: Shortcuts to other TTM commands.

---

### Git Simulator (`simulator`)
**Alias:** `git`

Relive your project's history. The simulator replays your commit history as if you were typing it in real-time.

```bash
ttm simulator
```

**Interactive Modes:**
1. **📚 Git History (Reconstructed)**: Replays only git commands derived from your commit history.
2. **💻 Mixed Mode (Git + Real Shell History)**: Interleaves your actual `.zsh_history` or `.bash_history` commands (e.g., `npm install`, `cd`, `ls`) with git commits to show the full context of your development sessions.

**Controls:**
- Use `Up/Down` arrows to select a specific point in time to start the replay.
- Select `Exit Simulator` to quit.

---

### Timeline (`timeline`)

Visualize your git history as a beautiful, neon-colored Metro map.

```bash
ttm timeline [options]
```

**Options:**
- `--limit <n>`: Limit the number of commits to show (default: 100).
- `--theme <name>`: Color theme (`classic`, `neon`, `sunset`).

**Example:**
```bash
ttm timeline --limit 50 --theme neon
```

---

### Statistics (`stats`)

Deep insights into your coding habits, productivity, and project health.

```bash
ttm stats [options]
```

**Key Insights:**
- **Commit Breakdown**: Distribution of commit types (feat, fix, docs, etc.).
- **Top Contributors**: Leaderboard ranked by commit count and impact.
- **Productivity Punch Card**: Heatmap of your activity by day of week and hour of day.
- **Top Terminal Commands**: Analyzes your local shell history to show which tools you use most.
- **Code Hotspots**: Files that are modified most frequently (potential technical debt).
- **Project Vocabulary**: Most common words used in your commit messages.
- **GitHub-Style Heatmap**: A 30-week contribution calendar grid.

**Options:**
- `--output <file>`: Save report to file (JSON, Markdown, or HTML).

---

### Story Mode (`story`)

Generates a coherent, readable narrative of your project's evolution using GPT-style heuristics (no external API required).

```bash
ttm story [options]
```

**Options:**
- `--since <date>`: Start date for the story.
- `--until <date>`: End date.

---

### Release Notes (`release-notes`)

Automatically generate professional release notes between two git references (tags, branches, or commit hashes).

```bash
ttm release-notes <from> <to>
```

**Example:**
```bash
ttm release-notes v1.0.0 v1.1.0
```

**Output:**
- Categorized changes (Features, Fixes, Refactors).
- Contributor credits.
- Impact summary.

---

### Upgrades (`upgrades`)

Tracks the history of dependency changes in your project.

```bash
ttm upgrades
```
*Scans for changes to `package.json`, `Cargo.toml`, `go.mod`, etc.*

---

### Contributors (`contributors`)

Displays a "Hall of Fame" leaderboard of all contributors, ranked by commit count and impact.

```bash
ttm contributors
```

---

## Git Native Extension

You can run TTM commands directly as `git` subcommands!

**Prerequisite:** Ensure TTM is installed globally (`npm i -g terminal-time-machine`) or linked (`npm link`).

**Available Commands:**
- `git story` -> Generates narrative
- `git timeline` -> Visual history
- `git stats` -> Repo statistics
- `git contributors` -> Hall of Fame
- `git upgrades` -> Dependency history

---

## Export & Reporting

All major commands (`stats`, `timeline`, `story`) support **Interactive Export**.

After running a command, you will be prompted:
```
? 💾 Would you like to export this report?
```

**Supported Formats:**
- **PDF**: Beautifully styled, print-ready reports.
- **Markdown**: Raw text for documentation.
- **HTML**: Web-ready view.
- **JSON**: Raw data for programmatic use.

---

## Configuration

TTM works out of the box, but you can customize it via command-line flags or by modifying the source code themes in `src/config/themes.js`.

**Themes:**
- `classic`: Standard terminal colors.
- `neon`: Cyberpunk aesthetic (Pink/Cyan).
- `sunset`: Warm gradients (Red/Orange).
