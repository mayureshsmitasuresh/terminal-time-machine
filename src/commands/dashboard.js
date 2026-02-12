import chalk from 'chalk';
import boxen from 'boxen';
import { parseGitHistory } from '../analyzers/git-parser.js';
import { analyzeCommits } from '../analyzers/commit-analyzer.js';
import { analyzeTime } from '../analyzers/time-analyzer.js';
import { generatePunchCard } from '../generators/punchcard-generator.js';
import { formatError, formatTitle } from '../utils/formatting.js';

export const dashboardCommand = async (options) => {
  try {
    // Optimization: Only fetch last 200 commits for dashboard speed
    const { commits, totalCommits, branches, tags } = await parseGitHistory(process.cwd(), { limit: 200 });
    const repoName = process.cwd().split('/').pop();

    if (commits.length === 0) {
      console.log(chalk.yellow('No commits found. Start coding!'));
      return;
    }

    const recentCommits = commits.slice(0, 50);
    const { categories, commits: enrichedRecent } = analyzeCommits(recentCommits);
    const timeStats = analyzeTime(recentCommits);

    // 1. Header Stats
    // Calculate "Streak" (consecutive days with commits in recent history)
    // Simplified: check gaps between days
    const uniqueDays = [...new Set(commits.map(c => c.date.split('T')[0]))];
    const latestDate = new Date(uniqueDays[0]);
    const today = new Date();
    // Check if active today or yesterday?
    const diffHours = (today - latestDate) / (1000 * 60 * 60);
    const isActive = diffHours < 48; // "Active" if commit in last 48h
    
    const statusColor = isActive ? chalk.green : chalk.yellow;
    const statusIcon = isActive ? '🟢 Online' : '🌙 Idle';

    const header = boxen(
      `${chalk.bold.white('TERMINAL TIME MACHINE')} ${chalk.dim('v1.1.0')}\n` +
      `${chalk.dim('Repository:')} ${chalk.cyan(repoName)}\n` +
      `${chalk.dim('Status:')}     ${statusColor(statusIcon)}\n` +
      `${chalk.dim('Head:')}       ${chalk.hex('#A78BFA')(commits[0].hash.substring(0,7))}`,
      { padding: 1, borderStyle: 'round', borderColor: 'cyan', title: 'MISSION CONTROL', titleAlignment: 'center' }
    );
    
    console.clear();
    console.log(header);

    // 2. Recent Impact
    // Sum impact of last 50 commits
    const recentImpact = enrichedRecent.reduce((sum, c) => sum + (c.analysis.impactScore || 0), 0);
    const avgImpact = (recentImpact / recentCommits.length).toFixed(1);
    
    let impactBar = '';
    const impactLevel = Math.min(Math.round(avgImpact * 2), 10);
    impactBar = '⚡'.repeat(impactLevel) + chalk.dim('⚡'.repeat(10 - impactLevel));

    console.log(chalk.bold('Create Flow (Last 50 Commits)'));
    console.log(`Impact Velocity: ${impactBar} ${chalk.dim(`(${avgImpact}/5.0)`)}`);
    
    // 3. Recent Shell Activity (New!)
    // We try to show the last 3-5 shell commands for context
    try {
      const { analyzeShellHabits } = await import('../analyzers/shell-history-parser.js');
      const { recentCommands } = analyzeShellHabits();
      
      if (recentCommands.length > 0) {
        console.log('');
        console.log(chalk.bold('Recent Terminal Activity'));
        recentCommands.slice(0, 3).forEach(cmd => {
           // cmd.cli is the full string
           // Truncate if too long?
           const display = cmd.cli.length > 40 ? cmd.cli.substring(0, 37) + '...' : cmd.cli;
           console.log(`  ${chalk.dim('❯')} ${chalk.cyan(display)}`);
        });
      }
    } catch (e) {
      // Ignore
    }
    
    // 4. Mini Punch Card (Recent)
    console.log('');
    console.log(chalk.bold('Recent Rhythm (Last 50 Commits)'));
    // Generate a smaller punchcard? No, standard function works but maybe dim the output?
    // We'll just show the standard one but it's based on only 50 commits so it shows *recent* habits.
    console.log(generatePunchCard(timeStats.matrix, timeStats.maxPunch, { theme: 'classic' })); // Force classic or user theme?

    // 4. Quick Actions Hint
    console.log('');
    console.log(boxen(
      `${chalk.bold('Quick Links')}\n` +
      `[s] ttm stats\n` +
      `[t] ttm timeline\n` +
      `[g] ttm git`,
      { padding: 0.5, borderStyle: 'classic', borderColor: 'grey', dimBorder: true }
    ));

  } catch (err) {
    console.error(formatError(err.message));
  }
};
