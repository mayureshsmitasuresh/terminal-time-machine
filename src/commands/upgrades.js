import chalk from 'chalk';
import { parseGitHistory } from '../analyzers/git-parser.js';
import { formatSectionHeader, formatTitle, formatError } from '../utils/formatting.js';

export const upgradesCommand = async (options) => {
  try {
    // We need file stats to detect upgrades
    // git log --name-only etc is handled by parseGitHistory? 
    // parseGitHistory currently parses `git log --stat` which gives files changed.
    
    console.clear();
    console.log(formatTitle('Upgrade History 📦'));

    const { commits } = await parseGitHistory(process.cwd());

    // Filter commits that look like upgrades
    const upgradeCommits = commits.filter(c => {
        // 1. Message Check
        const msg = c.message.toLowerCase();
        if (msg.match(/(bump|upgrade|update dependency|deps:|chore\(deps\))/)) return true;

        // 2. File Check (if available in current parser?) 
        // Our parser stores `files` array in each commit!
        if (c.files && c.files.some(f => 
            f.match(/package(-lock)?\.json/) || 
            f.match(/yarn\.lock/) || 
            f.match(/pnpm-lock\.yaml/) ||
            f.match(/Cargo\.toml/) ||
            f.match(/go\.mod/)
        )) {
            // Also message usually says something, but maybe just "fix package"?
            // Let's be a bit generous but maybe strict on message for now to avoid noise
            return true;
        }
        return false;
    });

    if (upgradeCommits.length === 0) {
        console.log(chalk.dim('\n  No upgrade-related commits found.\n'));
        return;
    }

    console.log(chalk.dim(`  Found ${upgradeCommits.length} upgrade events.\n`));

    // Display
    upgradeCommits.slice(0, 20).forEach(c => {
        const date = new Date(c.date).toISOString().split('T')[0];
        const hash = c.hash.substring(0, 7);
        const author = c.author;
        
        // Highlight keywords
        let msg = c.message;
        msg = msg.replace(/(bump|upgrade|from|to|v\d+\.\d+\.\d+)/gi, match => chalk.cyan(match));
        
        console.log(`  ${chalk.dim(date)} ${chalk.yellow('📦')} ${msg} ${chalk.dim(`(${hash})`)}`);
    });
    
    if (upgradeCommits.length > 20) {
        console.log(chalk.dim(`\n  ... and ${upgradeCommits.length - 20} more.`));
    }
    console.log('');

  } catch (err) {
    console.error(formatError(err.message));
  }
};
