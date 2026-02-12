import chalk from 'chalk';
import { parseGitHistory } from '../analyzers/git-parser.js';
import { analyzeCommits } from '../analyzers/commit-analyzer.js';
import { analyzeTime } from '../analyzers/time-analyzer.js';
import { analyzeFiles } from '../analyzers/file-analyzer.js'; 
import { detectMilestones } from '../analyzers/milestone-detector.js';
import { getContributorStats } from '../analyzers/contributor-stats.js';
import { generateHeatmap } from '../generators/heatmap-generator.js';
import { generateActivityChart } from '../generators/graph-generator.js';
import { generatePunchCard } from '../generators/punchcard-generator.js'; 
import {
  formatSectionHeader,
  formatSummaryBox,
  formatBar,
  formatLabelValue,
  formatContributorRow,
  formatMilestone,
  formatCategoryIcon,
  getCategoryConfig,
  formatError,
  formatDivider,
  formatTitle
} from '../utils/formatting.js';
import { handleOutput } from '../utils/export.js';
import { askToExport } from '../utils/interactivity.js'; // New Import

export const statsCommand = async (options) => {
  try {
    const { commits, totalCommits, branches, tags } = await parseGitHistory(process.cwd());
    const repoName = process.cwd().split('/').pop();

    // ── JSON Export (Early Exit) ─────────────────────────
    if (options.format === 'json' || (options.output && options.output.endsWith('.json'))) {
      const timeAnalysis = analyzeTime(commits);
      const fileAnalysis = await analyzeFiles(process.cwd());

      const data = {
        meta: { repo: repoName, generated: new Date().toISOString() },
        stats: {
          commits: totalCommits,
          branches: branches.all.length,
          tags: tags.all.length,
          filesChanged: fileAnalysis.totalFilesChanged
        },
        analysis: totalCommits > 0 ? analyzeCommits(commits) : null,
        contributors: totalCommits > 0 ? getContributorStats(commits) : null,
        milestones: totalCommits > 0 ? detectMilestones(commits, tags) : null,
        time: timeAnalysis,
        files: fileAnalysis
      };
      handleOutput(data, options, 'json');
      return;
    }

    // ── Terminal Output & Markdown Generation ─────────────
    
    // Header Summary Box
    const summaryLines = [
      `${chalk.dim('Repository:')}  ${chalk.bold.hex('#A78BFA')(repoName)}`,
      `${chalk.dim('Commits:')}     ${chalk.bold.hex('#34D399')(totalCommits)}`,
      `${chalk.dim('Branches:')}    ${chalk.bold.hex('#60A5FA')(branches.all.length)}`,
      `${chalk.dim('Tags:')}        ${chalk.bold.hex('#FBBF24')(tags.all.length)}`
    ];
    console.log(formatSummaryBox('📊 Repository Overview', summaryLines, '#A78BFA'));

    if (totalCommits === 0) {
      console.log(chalk.dim('\n  No commits found. Start committing to see stats!\n'));
      return;
    }

    // Run parallel analyzers
    const [analysis, fileStats] = await Promise.all([
      Promise.resolve(analyzeCommits(commits)), 
      analyzeFiles(process.cwd()) 
    ]);
    const timeStats = analyzeTime(commits);
    const contributors = getContributorStats(commits);
    const milestones = detectMilestones(commits, tags);

    // Prepare Markdown Buffer
    let mdOutput = `# Repository Statistics: ${repoName}\n\n`;
    mdOutput += `**Generated**: ${new Date().toLocaleString()}\n\n`;
    mdOutput += `| Statistic | Value |\n|---|---|\n`;
    mdOutput += `| Commits | ${totalCommits} |\n| Branches | ${branches.all.length} |\n| Tags | ${tags.all.length} |\n\n`;

    // ── 1. Commit Categories ───────────────────────────
    const maxCategory = Math.max(...Object.values(analysis.categories));
    console.log(formatSectionHeader('Commit Breakdown', '📦'));
    console.log('');
    
    mdOutput += `## 📦 Commit Breakdown\n\n`;
    Object.entries(analysis.categories).forEach(([type, count]) => {
      if (count > 0) {
        const cfg = getCategoryConfig(type);
        console.log(formatBar(`${cfg.icon} ${cfg.label}`, count, maxCategory, cfg.color));
        mdOutput += `- **${cfg.label}**: ${count}\n`;
      }
    });
    mdOutput += '\n';

    // ── 2. Top Contributors ────────────────────────────
    const maxCommits = contributors.length > 0 ? contributors[0].commitCount : 1;
    console.log(formatSectionHeader('Top Contributors', '👥'));
    console.log('');
    mdOutput += `## 👥 Top Contributors\n\n| Name | Commits | Impact |\n|---|---|---|\n`;
    contributors.slice(0, 5).forEach((c, i) => {
      console.log(formatContributorRow(c, i, maxCommits));
      mdOutput += `| ${c.name} | ${c.commitCount} | ${c.impactScore} |\n`;
    });
    mdOutput += '\n';

    // ── 3. Punch Card ──────────────────────────────────
    console.log(formatSectionHeader('Productivity Punch Card', '🕒'));
    console.log(chalk.dim('  (Activity by Day & Hour)\n'));
    console.log(generatePunchCard(timeStats.matrix, timeStats.maxPunch, options));
    // Punchcard is hard in markdown/pdf without image. Omit or simple table?
    mdOutput += `## 🕒 Productivity\n*(Punch card visualization available in terminal)*\n\n`;
    
    // ── 4. File Churn ──────────────────────────────────
    if (fileStats.hotspots.length > 0) {
      console.log(formatSectionHeader('Code Hotspots (Most Modified)', '🔥'));
      console.log('');
      mdOutput += `## 🔥 Code Hotspots\n\n`;
      const maxChurn = fileStats.hotspots[0].count;
      fileStats.hotspots.slice(0, 5).forEach(f => {
         const name = f.file.length > 30 ? '...' + f.file.slice(-27) : f.file;
         console.log(formatBar(name, f.count, maxChurn, chalk.hex('#F87171'), 15));
         mdOutput += `- \`${f.file}\`: ${f.count} changes\n`;
      });
      mdOutput += '\n';
    }

    // ── 5. Project Vocabulary ──────────────────────────
    if (timeStats.vocabulary.length > 0) {
       console.log(formatSectionHeader('Project Vocabulary', '💬'));
       console.log('');
       const words = timeStats.vocabulary.slice(0, 8).map(v => chalk.cyan(v.word)).join(chalk.dim(' • '));
       console.log(`  ${words}`);
       mdOutput += `## 💬 Vocabulary\nCommon terms: ${timeStats.vocabulary.slice(0, 8).map(v => v.word).join(', ')}\n\n`;
    }

    // ── 5b. Shell Habits (New!) ────────────────────────
    // We try to analyze shell history from ~/.zsh_history or ~/.bash_history
    try {
      const { analyzeShellHabits } = await import('../analyzers/shell-history-parser.js');
      const shellStats = analyzeShellHabits();
      
      if (shellStats.topCommands.length > 0) {
        console.log(formatSectionHeader('Top Terminal Commands', '⌨️'));
        console.log('');
        mdOutput += `## ⌨️ Top Terminal Commands\n\n`;
        
        const maxCmd = shellStats.topCommands[0].count;
        shellStats.topCommands.slice(0, 5).forEach(cmd => {
          console.log(formatBar(cmd.program, cmd.count, maxCmd, chalk.hex('#F472B6'), 15));
          mdOutput += `- \`${cmd.program}\`: ${cmd.count}\n`;
        });
        mdOutput += '\n';
      }
    } catch (e) {
      // Ignore if shell history fails (e.g. permission or not found)
    }

    // ── 6. Milestones ──────────────────────────────────
    if (milestones.length > 0) {
      console.log(formatSectionHeader('Key Milestones', '🏆'));
      console.log('');
      mdOutput += `## 🏆 Key Milestones\n\n`;
      milestones.forEach(m => {
        console.log(formatMilestone(m));
        mdOutput += `- **${new Date(m.date).toLocaleDateString()}**: ${m.icon} ${m.title}\n`;
      });
      mdOutput += '\n';
    }

    // ── 7. Charts & Footer ─────────────────────────────
    console.log(formatSectionHeader('Activity Trend', '📈'));
    console.log(generateActivityChart(commits, options));
    
    console.log(formatSectionHeader('Heatmap', '🗓️'));
    console.log(generateHeatmap(commits, options));

    console.log(formatDivider('─', 50));
    const dateRange = commits.length > 0
      ? `${chalk.hex('#60A5FA')(new Date(commits[commits.length - 1].date).toISOString().split('T')[0])} → ${chalk.hex('#60A5FA')(new Date(commits[0].date).toISOString().split('T')[0])}`
      : '';
    console.log(`  ${chalk.dim('Period:')} ${dateRange}`);
    console.log('');

    // Ask to export
    if (!options.output) {
      await askToExport(mdOutput, 'repo-stats');
    }

  } catch (err) {
    console.error(formatError(err.message));
  }
};
