import chalk from 'chalk';
import { analyzeCommits } from '../analyzers/commit-analyzer.js';
import {
  formatSectionHeader,
  getCategoryConfig,
  formatDivider
} from '../utils/formatting.js';

export function generateReleaseNotes(commits, fromRef, toRef) {
  const { categories, commits: enrichedCommits } = analyzeCommits(commits);
  
  // Get date range from commits if possible
  const lastCommit = enrichedCommits[0]; // Most recent
  const firstCommit = enrichedCommits[enrichedCommits.length - 1]; // Oldest
  const dateStr = lastCommit ? new Date(lastCommit.date).toLocaleDateString() : '';

  let output = `# Release Notes (${fromRef}...${toRef})\n`;
  output += `> Generated on ${new Date().toLocaleDateString()} | Target Release Date: ${dateStr}\n\n`;
  
  // Stats summary
  output += `**Total Commits**: ${commits.length}\n`;
  output += `**Features**: ${categories.feat} | **Fixes**: ${categories.fix} | **Refactors**: ${categories.refactor}\n\n`;
  
  // Sections
  const sections = {
    feat: '🚀 New Features',
    fix: '🐛 Bug Fixes',
    refactor: '🛠 Improvements',
    docs: '📚 Documentation',
    test: '✅ Tests',
    other: '🔍 Other Changes'
  };

  Object.keys(sections).forEach(type => {
    const typeCommits = enrichedCommits.filter(c => c.analysis.type === type);
    
    if (typeCommits.length > 0) {
      output += `## ${sections[type]}\n`;
      typeCommits.forEach(c => {
        const hash = c.hash.substring(0, 7);
        const subject = c.message.split('\n')[0];
        output += `- ${subject} (${hash}) - @${c.author_name}\n`;
      });
      output += '\n';
    }
  });

  // Contributors section
  const authors = [...new Set(commits.map(c => c.author_name))];
  output += `## 👥 Contributors\n`;
  output += `Thank you to: ${authors.join(', ')}\n`;

  return output;
}

/**
 * Render release notes with rich colors for terminal display
 */
export function renderReleaseNotesTerminal(commits, fromRef, toRef) {
  const { categories, commits: enrichedCommits } = analyzeCommits(commits);

  const lastCommit = enrichedCommits[0];
  const dateStr = lastCommit ? new Date(lastCommit.date).toLocaleDateString() : 'N/A';

  let output = '';

  // ── Header ──────────────────────────────────────────
  output += `\n  ${chalk.bold.hex('#A78BFA')('📝 Release Notes')} ${chalk.dim(`(${fromRef}...${toRef})`)}\n`;
  output += `  ${chalk.dim(`Generated on ${new Date().toLocaleDateString()} • Target: ${dateStr}`)}\n\n`;

  // ── Stats Summary ───────────────────────────────────
  output += `  ${chalk.dim('Total Commits:')} ${chalk.bold.hex('#34D399')(commits.length)}    `;
  output += `${chalk.hex('#34D399')('🚀 Features:')} ${chalk.bold(categories.feat)}  ${chalk.dim('│')}  `;
  output += `${chalk.hex('#F87171')('🐛 Fixes:')} ${chalk.bold(categories.fix)}  ${chalk.dim('│')}  `;
  output += `${chalk.hex('#FBBF24')('🔧 Refactors:')} ${chalk.bold(categories.refactor)}\n`;

  // ── Sections ────────────────────────────────────────
  const sections = {
    feat: '🚀 New Features',
    fix: '🐛 Bug Fixes',
    refactor: '🛠 Improvements',
    docs: '📚 Documentation',
    test: '✅ Tests',
    other: '🔍 Other Changes'
  };

  Object.keys(sections).forEach(type => {
    const typeCommits = enrichedCommits.filter(c => c.analysis.type === type);
    
    if (typeCommits.length > 0) {
      const cfg = getCategoryConfig(type);
      output += formatSectionHeader(sections[type], '') + '\n\n';
      
      typeCommits.forEach(c => {
        const hash = c.hash.substring(0, 7);
        const subject = c.message.split('\n')[0];
        output += `  ${chalk.dim('•')}  ${chalk.white(subject)} ${chalk.dim('(')}${chalk.hex('#60A5FA')(hash)}${chalk.dim(')')} ${chalk.dim('by')} ${chalk.hex('#C084FC')(c.author_name)}\n`;
      });
      output += '\n';
    }
  });

  // ── Contributors ────────────────────────────────────
  const authors = [...new Set(commits.map(c => c.author_name))];
  output += formatSectionHeader('👥 Contributors', '') + '\n\n';
  output += `  ${chalk.dim('Thanks to:')} ${chalk.hex('#34D399')(authors.join(chalk.dim(', ')))}\n`;

  // ── Footer ──────────────────────────────────────────
  output += '\n' + formatDivider('─', 50) + '\n';
  
  // Calculate type distribution
  const total = commits.length;
  if (total > 0) {
    const distribution = Object.entries(categories)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => {
        const pct = Math.round((count / total) * 100);
        const cfg = getCategoryConfig(type);
        return cfg.color(`${pct}%${cfg.icon}`);
      })
      .join(' ');
    output += `  ${chalk.dim('Distribution:')} ${distribution}\n`;
  }
  output += '\n';

  return output;
}
