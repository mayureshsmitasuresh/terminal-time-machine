import chalk from 'chalk';
import { parseGitHistory } from '../analyzers/git-parser.js';
import { getContributorStats } from '../analyzers/contributor-stats.js';
import { formatSectionHeader, formatContributorRow, formatError, formatTitle } from '../utils/formatting.js';

export const contributorsCommand = async (options) => {
  try {
    console.clear();
    console.log(formatTitle('Hall of Fame 🏆'));

    const { commits } = await parseGitHistory(process.cwd());

    if (commits.length === 0) {
      console.log(chalk.yellow('No commits found. Be the first contributor!'));
      return;
    }

    const contributors = getContributorStats(commits);
    const maxCommits = contributors.length > 0 ? contributors[0].commitCount : 1;

    console.log(formatSectionHeader('Top Contributors', '👥'));
    console.log('');

    contributors.forEach((c, i) => {
      // Use existing formatter but maybe add more details if available?
      // formatContributorRow shows rank, name, bar, count, medal.
      console.log(formatContributorRow(c, i, maxCommits));
      
      // Optional: Add "Active since..." or "Latest commit..." if we want more detail than stats command?
      // For now, reuse the clean stats view but standalone.
    });
    
    console.log('');
    console.log(chalk.dim(`  Total Contributors: ${contributors.length}`));
    console.log('');

  } catch (err) {
    console.error(formatError(err.message));
  }
};
