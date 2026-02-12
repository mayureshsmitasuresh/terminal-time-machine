import { Command } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import path from 'path'; // New Import
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import inquirer from 'inquirer';
import chalk from 'chalk';

import { storyCommand } from './commands/story.js';
import { timelineCommand } from './commands/timeline.js';
import { statsCommand } from './commands/stats.js';
import { generateReleaseNotes, renderReleaseNotesTerminal } from './commands/release-notes.js';
import { gitSimulator } from './commands/git-simulator.js'; // New Import
import { upgradesCommand } from './commands/upgrades.js'; 
import { contributorsCommand } from './commands/contributors.js'; // New Import
import { dashboardCommand } from './commands/dashboard.js'; 
import { parseGitHistory } from './analyzers/git-parser.js';
import { formatError, formatSuccess, formatWelcomeBanner } from './utils/formatting.js';
import { writeToFile } from './utils/export.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

// Setup marked for rich terminal markdown rendering
marked.use(markedTerminal({
  width: 80,
  reflowText: true,
  tab: 2
}));

// ── Git Extension Dispatch Logic ─────────────────────
// Check how the CLI was invoked (argv[1] is the binary path)
const binName = process.argv[1] ? path.basename(process.argv[1]) : 'ttm';

// Map git-<cmd> to ttm internal commands
const gitMap = {
  'git-story': ['story'],
  'git-timeline': ['timeline'],
  'git-stats': ['stats'],
  'git-contributors': ['contributors'],
  'git-upgrades': ['upgrades']
};

// If invoked as a git extension, rewrite argv to force the sub-command
if (gitMap[binName]) {
  // argv[0] = node, argv[1] = bin/ttm.js
  // We want to insert the command at argv[2]
  // Commander expects [node, script, command, args...]
  const newArgs = gitMap[binName];
  // Keep existing args (flags etc)
  const userArgs = process.argv.slice(2);
  process.argv = [process.argv[0], process.argv[1], ...newArgs, ...userArgs];
}

const program = new Command();

program
  .name('ttm')
  .description('Terminal Time Machine - Git History Storyteller')
  .version('1.1.0');

// Manual flag handling for --creator to avoid command constraints
if (process.argv.includes('--creator')) {
  console.log(chalk.bold.hex('#A78BFA')('Mayuresh Smita Suresh') + ' ' + chalk.blue('https://tagnovate.com/mayuresh'));
  process.exit(0);
}



// Helper for output handling (still needed here for release-notes file export)
function handleOutput(content, options, format = 'markdown') {
  if (options.output) {
    let outFormat = options.format || format;
    if (options.output.endsWith('.html')) outFormat = 'html';
    if (options.output.endsWith('.json')) outFormat = 'json';
    
    try {
      writeToFile(content, outFormat, options.output);
      console.log(formatSuccess(`Output saved to ${options.output}`));
    } catch (err) {
      console.error(formatError(err.message));
    }
  } else {
    if (format === 'markdown') {
      console.log(marked(content));
    } else {
      console.log(content);
    }
  }
}

program
  .command('git') // Alias: simulator
  .alias('simulator')
  .description('Interactive Git Command Simulator')
  .action(gitSimulator);

program
  .command('dashboard')
  .alias('dash')
  .description('Show high-level mission control dashboard')
  .action(dashboardCommand);

program
  .command('story')
  .description('Generate narrative story from git history')
  .option('--since <date>', 'Start date')
  .option('--until <date>', 'End date')
  .option('--output <file>', 'Output file')
  .option('--format <fmt>', 'Output format (markdown, html)', 'markdown')
  .action(storyCommand);

program
  .command('timeline')
  .description('Show ASCII timeline of git history')
  .option('--since <date>', 'Start date')
  .option('--until <date>', 'End date')
  .option('--limit <n>', 'Limit number of commits', 100) // New Option
  .option('--theme <name>', 'Color theme (classic, sunset, neon)', 'classic')
  .option('--output <file>', 'Output file')
  .option('--format <fmt>', 'Output format (markdown, html)', 'markdown')
  .action(timelineCommand);

program
  .command('stats')
  .description('Show repository statistics')
  .option('--theme <name>', 'Color theme', 'classic')
  .option('--output <file>', 'Output file')
  .option('--format <fmt>', 'Output format (json, markdown)', 'text')
  .action(statsCommand);

program
  .command('upgrades')
  .description('Show history of dependency upgrades')
  .action(upgradesCommand);

program
  .command('contributors')
  .description('Show contributor Hall of Fame')
  .action(contributorsCommand);

program
  .command('release-notes <from> <to>')
  .description('Generate release notes between two refs')
  .option('--output <file>', 'Output file')
  .option('--format <fmt>', 'Output format (markdown, html)', 'markdown')
  .action(async (from, to, options) => {
    try {
      const rangeOptions = { from, to };
      const data = await parseGitHistory(process.cwd(), rangeOptions);
      
      if (options.output) {
        // File export: generate markdown
        const notes = generateReleaseNotes(data.commits, from, to);
        handleOutput(notes, options);
      } else {
        // Terminal: rich colored output
        const coloredNotes = renderReleaseNotesTerminal(data.commits, from, to);
        console.log(coloredNotes);
      }
    } catch (err) {
      console.error(formatError(err.message));
    }
  });

// Interactive Mode
async function interactiveMode() {
  // Show beautiful figlet banner
  try {
    const banner = await formatWelcomeBanner(packageJson.version);
    console.log(banner);
  } catch {
    console.log(chalk.bold.hex('#A78BFA')('Terminal Time Machine 🕰️') + chalk.dim(` v${packageJson.version}`));
    console.log('');
  }
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: chalk.hex('#A78BFA')('What would you like to do?'),
      choices: [
        { name: `${chalk.hex('#34D399')('📖 Tell me a story')}       ${chalk.dim('— narrative from git history')}`, value: 'story' },
        { name: `${chalk.hex('#60A5FA')('⚡ View Timeline')}         ${chalk.dim('— visual branch history')}`, value: 'timeline' },
        { name: `${chalk.hex('#FBBF24')('📊 View Statistics')}       ${chalk.dim('— charts, heatmaps & insights')}`, value: 'stats' },
        { name: `${chalk.hex('#A78BFA')('🚀 Mission Control')}       ${chalk.dim('— project dashboard')}`, value: 'dashboard' }, // New Option
        { name: `${chalk.hex('#F472B6')('🕹️  Git Simulator')}         ${chalk.dim('— replay command history')}`, value: 'simulator' },
        { name: `${chalk.hex('#FBBF24')('📦 View Upgrades')}         ${chalk.dim('— dependency bump history')}`, value: 'upgrades' }, // New
        { name: `${chalk.hex('#F87171')('📝 Generate Release Notes')} ${chalk.dim('— changelog between refs')}`, value: 'notes' },
        { name: chalk.dim('🚪 Exit'), value: 'exit' }
      ]
    }
  ]);

  if (action === 'exit') {
    console.log(chalk.dim('  Goodbye! 👋\n'));
    process.exit(0);
  }

  if (action === 'story') {
    const { output } = await inquirer.prompt([
       { type: 'confirm', name: 'output', message: 'Export to file?', default: false }
    ]);
    if(output) {
       await program.parseAsync(['node', 'ttm', 'story', '--output', 'story.md']);
    } else {
       await program.parseAsync(['node', 'ttm', 'story']);
    }
  }
  else if (action === 'timeline') {
    await program.parseAsync(['node', 'ttm', 'timeline']);
  }
  else if (action === 'dashboard') {
    await program.parseAsync(['node', 'ttm', 'dashboard']);
  }
  else if (action === 'stats') {
    await program.parseAsync(['node', 'ttm', 'stats']);
  }
  else if (action === 'simulator') {
    await program.parseAsync(['node', 'ttm', 'git']);
  }
  else if (action === 'notes') {
    const { from, to } = await inquirer.prompt([
      { name: 'from', message: chalk.dim('From ref (e.g. HEAD~5):'), default: 'HEAD~10' },
      { name: 'to', message: chalk.dim('To ref:'), default: 'HEAD' }
    ]);
    await program.parseAsync(['node', 'ttm', 'release-notes', from, to]);
  }
}

if (process.argv.length <= 2) {
  interactiveMode();
} else {
  program.parse(process.argv);
}
