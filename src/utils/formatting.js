import chalk from 'chalk';
import boxen from 'boxen';

// ─── Basic Helpers ──────────────────────────────────────────

export function formatTitle(text) {
  return chalk.bold.blue(text);
}

export function formatError(text) {
  return chalk.red('✖ ' + text);
}

export function formatSuccess(text) {
  return chalk.green('✔ ' + text);
}

// ─── Section Headers ────────────────────────────────────────

export function formatSectionHeader(text, icon = '▸') {
  const line = chalk.dim('─'.repeat(48));
  return `\n${line}\n  ${icon}  ${chalk.bold.hex('#A78BFA')(text)}\n${line}`;
}

export function formatDivider(char = '─', length = 50) {
  return chalk.dim(char.repeat(length));
}

// ─── Labeled Values ─────────────────────────────────────────

export function formatLabelValue(label, value, colorFn = chalk.white) {
  return `  ${chalk.dim(label.padEnd(20))} ${colorFn(value)}`;
}

// ─── Bar Charts ─────────────────────────────────────────────

export function formatBar(label, value, max, colorFn = chalk.green, barWidth = 25) {
  const filled = max > 0 ? Math.round((value / max) * barWidth) : 0;
  const empty = barWidth - filled;
  const bar = colorFn('█'.repeat(filled)) + chalk.dim('░'.repeat(empty));
  const count = chalk.bold(String(value).padStart(4));
  return `  ${chalk.dim(label.padEnd(12))} ${bar} ${count}`;
}

// ─── Summary Boxes ──────────────────────────────────────────

export function formatSummaryBox(title, lines, borderColor = 'cyan') {
  const content = lines.join('\n');
  return boxen(content, {
    title: chalk.bold(title),
    titleAlignment: 'center',
    padding: { top: 0, bottom: 0, left: 2, right: 2 },
    margin: { top: 1, bottom: 1, left: 0, right: 0 },
    borderStyle: 'round',
    borderColor: borderColor,
    dimBorder: false
  });
}

// ─── Rank Medals ────────────────────────────────────────────

export function formatRank(index) {
  const medals = ['🥇', '🥈', '🥉'];
  if (index < 3) return medals[index];
  return chalk.dim(` ${index + 1}.`);
}

// ─── Category Icons & Colors ────────────────────────────────

const categoryConfig = {
  feat:     { icon: '🚀', label: 'Features',  color: chalk.hex('#34D399') },
  fix:      { icon: '🐛', label: 'Bug Fixes', color: chalk.hex('#F87171') },
  docs:     { icon: '📚', label: 'Docs',      color: chalk.hex('#60A5FA') },
  style:    { icon: '🎨', label: 'Style',     color: chalk.hex('#C084FC') },
  refactor: { icon: '🔧', label: 'Refactor',  color: chalk.hex('#FBBF24') },
  test:     { icon: '✅', label: 'Tests',     color: chalk.hex('#A78BFA') },
  chore:    { icon: '🔩', label: 'Chores',    color: chalk.hex('#9CA3AF') },
  other:    { icon: '🔍', label: 'Other',     color: chalk.hex('#D1D5DB') }
};

export function getCategoryConfig(type) {
  return categoryConfig[type] || categoryConfig.other;
}

export function formatCategoryIcon(type) {
  const cfg = getCategoryConfig(type);
  return `${cfg.icon} ${cfg.color(cfg.label)}`;
}

// ─── Milestone Formatting ───────────────────────────────────

export function formatMilestone(milestone) {
  const dateStr = new Date(milestone.date).toISOString().split('T')[0];
  const dateColored = chalk.hex('#60A5FA')(dateStr);
  const titleColored = chalk.bold.white(milestone.title);
  const desc = milestone.description ? chalk.dim(` — ${milestone.description}`) : '';
  return `  ${milestone.icon}  ${dateColored}  ${titleColored}${desc}`;
}

// ─── Contributor Row ────────────────────────────────────────

export function formatContributorRow(contributor, index, maxCommits) {
  const rank = formatRank(index);
  const name = chalk.bold.white(contributor.name.padEnd(22));
  const bar = formatBar('', contributor.commitCount, maxCommits, chalk.hex('#34D399'), 15).trim();
  return `  ${rank}  ${name} ${bar}`;
}

// ─── Release Notes Colored Terminal Rendering ───────────────

export function formatReleaseNotesTerminal(notes, fromRef, toRef) {
  // notes is the raw markdown string - we parse and colorize it
  const lines = notes.split('\n');
  let output = '';

  for (const line of lines) {
    if (line.startsWith('# Release Notes')) {
      output += `\n${chalk.bold.hex('#A78BFA')('📝 Release Notes')} ${chalk.dim(`(${fromRef}...${toRef})`)}\n`;
    } else if (line.startsWith('> Generated')) {
      output += `  ${chalk.dim(line.replace('> ', ''))}\n\n`;
    } else if (line.startsWith('**Total Commits**')) {
      const match = line.match(/\*\*Total Commits\*\*: (\d+)/);
      if (match) output += `  ${chalk.dim('Total Commits:')} ${chalk.bold.hex('#34D399')(match[1])}\n`;
    } else if (line.startsWith('**Features**')) {
      const parts = line.replace(/\*\*/g, '').split('|').map(s => s.trim());
      output += `  ${parts.map(p => {
        const [label, val] = p.split(': ');
        if (label.includes('Features')) return `${chalk.hex('#34D399')('🚀 ' + label)}: ${chalk.bold(val)}`;
        if (label.includes('Fixes')) return `${chalk.hex('#F87171')('🐛 ' + label)}: ${chalk.bold(val)}`;
        if (label.includes('Refactors')) return `${chalk.hex('#FBBF24')('🔧 ' + label)}: ${chalk.bold(val)}`;
        return `${label}: ${val}`;
      }).join(chalk.dim('  │  '))}\n`;
    } else if (line.startsWith('## 🚀') || line.startsWith('## 🐛') || line.startsWith('## 🛠') ||
               line.startsWith('## 📚') || line.startsWith('## ✅') || line.startsWith('## 🔍') ||
               line.startsWith('## 👥')) {
      output += `\n${formatSectionHeader(line.replace('## ', ''), '')}\n`;
    } else if (line.startsWith('- ')) {
      // Commit line: - subject (hash) - @author
      const match = line.match(/^- (.+) \(([a-f0-9]+)\) - @(.+)$/);
      if (match) {
        const [, subject, hash, author] = match;
        output += `  ${chalk.dim('•')}  ${chalk.white(subject)} ${chalk.dim('(')}${chalk.hex('#60A5FA')(hash)}${chalk.dim(')')} ${chalk.dim('by')} ${chalk.hex('#C084FC')(author)}\n`;
      } else {
        output += `  ${chalk.dim('•')}  ${chalk.white(line.substring(2))}\n`;
      }
    } else if (line.startsWith('Thank you to:')) {
      const authors = line.replace('Thank you to: ', '');
      output += `  ${chalk.dim('Thanks to:')} ${chalk.hex('#34D399')(authors)}\n`;
    } else if (line.trim() !== '') {
      output += `  ${chalk.dim(line)}\n`;
    }
  }

  return output;
}

// ─── Welcome Banner ─────────────────────────────────────────

export async function formatWelcomeBanner(version) {
  const { default: figlet } = await import('figlet');
  const { default: gradient } = await import('gradient-string');
  
  return new Promise((resolve) => {
    figlet.text('TTM', { font: 'ANSI Shadow', horizontalLayout: 'full' }, (err, data) => {
      if (err) {
        resolve(chalk.bold.hex('#A78BFA')('Terminal Time Machine 🕰️'));
        return;
      }
      const banner = gradient(['#A78BFA', '#60A5FA', '#34D399'])(data);
      const subtitle = chalk.dim('  Terminal Time Machine') + chalk.hex('#A78BFA')(' v' + version) + chalk.dim(' — Git History Storyteller');
      const tip = chalk.dim('  💡 Tip: Run ') + chalk.hex('#60A5FA')('ttm --help') + chalk.dim(' to see all commands');
      resolve(`${banner}\n${subtitle}\n${tip}\n`);
    });
  });
}
