# Terminal Time Machine 🕰️

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Transform your Git history into engaging narratives, beautiful ASCII visualizations, and deep insights. `ttm` is a CLI tool designed to help developers, teams, and managers understand the story behind the code.

![Timeline Screenshot](examples/demo-screenshot.png)

## Core Features
- **📖 Narrative Stories**: Turn dry commit logs into readable chapters.
- **⚡ Interactive Timeline**: Visual ASCII tree of commits, branches, and tags.
- **📊 Team Analytics**: Contributor heatmaps, activity graphs, and impact scores.
- **📝 Automated Release Notes**: Generate professional changelogs instantly.
- **🤖 Smart Highlights**: AI-inspired milestone detection.
- **💾 Multi-Format Export**: Save reports as Markdown, HTML, or JSON.

---

## 🚀 Step-by-Step Tutorial

### 1. Installation

**Requirements**
- Node.js v18.0.0 or higher
- Git installed and available in PATH

#### For Global Usage (Recommended)
This makes the `ttm` command available anywhere in your terminal.
```bash
npm install -g terminal-time-machine
```

#### For One-Time Use (via npx)
```bash
npx terminal-time-machine stats
```

### 2. Basic Usage

Navigate to any git repository on your machine:
```bash
cd /path/to/my-project
```

#### The Interactive Menu
If you're unsure where to start, just run:
```bash
ttm
```
This launches an interactive menu where you can explore all features.

#### Generating a Story
Want to read how your project evolved last month?
```bash
ttm story --since "1 month ago"
```

#### Viewing the Timeline
See a visual representation of your branch history:
```bash
ttm timeline
```

#### Generating Release Notes
Need to tell your team what changed between version 1.0 and 2.0?
```bash
ttm release-notes v1.0 v2.0 --output changelog.md
```

---

## 🏢 Use Cases: Small vs Large Teams

### For Small Teams / Solo Devs (~1-5 people)
*Goal: Rapid self-review and marketing content.*

**1. "The Weekly Sync"**
Before your Monday meeting, run `ttm story --since "1 week ago"` to get a narrative summary of what was accomplished. It's friendlier than reading raw logs.

**2. "Portfolio Building"**
Solo devs can use `ttm story --output blog-post.md` to generate draft content for devlogs or blog posts about their progress.

**3. "Client Reports"**
Freelancers can export a `ttm stats --format html --output report.html` to show clients "proof of work" with fancy heatmaps and activity graphs.

### For Huge Teams / Enterprise (50+ contributors)
*Goal: High-level overview, milestone tracking, and onboarding.*

**1. "Onboarding New Hires"**
New joiners can run `ttm story` to read the "Prologue" and "Chapters" of the project history. It helps them understand the *phases* of development (e.g., "The Great Refactor of 2024") rather than just code.

**2. "Release Management"**
Release managers can automate changelog generation for massive monorepos using `ttm release-notes <last-tag> HEAD`. The tool groups commits by type (Feat/Fix), making it easier to filter noise.

**3. "Sprint Retrospectives"**
Use `ttm stats` to identify "Impact Scores" and "Top Contributors" for the sprint.
- **Heatmaps**: Spot if the team is burning out (too much activity on weekends).
- **Categories**: Are we spending 80% of time on "Fixes" vs "Features"?

---

## ⚙️ Configuration & Customization

### Themes
Spice up your terminal with built-in themes:
```bash
ttm stats --theme neon    # Cyberpunk vibes
ttm stats --theme sunset  # Warm colors
```

### Exporting Data
Need raw data for your own dashboard?
```bash
ttm stats --format json --output analytics.json
```

---

## Contributing
We love contributions! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to submit pull requests.

## License
MIT
