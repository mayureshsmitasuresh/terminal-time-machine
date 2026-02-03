import { Command } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import inquirer from 'inquirer';

import { storyCommand } from './commands/story.js';
import { timelineCommand } from './commands/timeline.js';
import { statsCommand } from './commands/stats.js';
import { generateReleaseNotes } from './commands/release-notes.js';
import { parseGitHistory } from './analyzers/git-parser.js';
import { formatTitle, formatError, formatSuccess } from './utils/formatting.js';
import { writeToFile } from './utils/export.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

// Setup marked
marked.use(markedTerminal({
  width: 80,
  reflowText: true,
  tab: 2
}));

const program = new Command();

program
  .name('ttm')
  .description('Terminal Time Machine - Git History Storyteller')
  .version(packageJson.version);

// Helper for output handling (still needed here for release-notes until refactored)
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
  .command('release-notes <from> <to>')
  .description('Generate release notes between two refs')
  .option('--output <file>', 'Output file')
  .option('--format <fmt>', 'Output format (markdown, html)', 'markdown')
  .action(async (from, to, options) => {
    try {
      const rangeOptions = { from, to };
      const data = await parseGitHistory(process.cwd(), rangeOptions);
      const notes = generateReleaseNotes(data.commits, from, to);
      handleOutput(notes, options);
    } catch (err) {
      console.error(formatError(err.message));
    }
  });

// Interactive Mode
async function interactiveMode() {
  console.log('Welcome to Terminal Time Machine 🕰️\n');
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '📖 Tell me a story', value: 'story' },
        { name: '⚡ View Timeline', value: 'timeline' },
        { name: '📊 View Statistics', value: 'stats' },
        { name: '📝 Generate Release Notes', value: 'notes' },
        { name: '🚪 Exit', value: 'exit' }
      ]
    }
  ]);

  if (action === 'exit') {
    console.log('Bye! 👋');
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
  else if (action === 'stats') {
    await program.parseAsync(['node', 'ttm', 'stats']);
  }
  else if (action === 'notes') {
    const { from, to } = await inquirer.prompt([
      { name: 'from', message: 'From ref (e.g. HEAD~5):', default: 'HEAD~10' },
      { name: 'to', message: 'To ref:', default: 'HEAD' }
    ]);
    await program.parseAsync(['node', 'ttm', 'release-notes', from, to]);
  }
}

if (process.argv.length <= 2) {
  interactiveMode();
} else {
  program.parse(process.argv);
}
