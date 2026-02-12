import inquirer from 'inquirer';
import chalk from 'chalk';
import { parseGitHistory } from '../analyzers/git-parser.js';
import { reconstructCommands } from '../analyzers/command-reconstructor.js';
import { replayCommand, typeCommand, showSimulatedOutput } from '../generators/replay-generator.js';
import { formatTitle, formatError } from '../utils/formatting.js';

import { parseShellHistory, mergeHistories } from '../analyzers/shell-history-parser.js'; // New Import

export const gitSimulator = async (options) => {
  try {
    const { commits, totalCommits, tags } = await parseGitHistory(process.cwd());

    // 1. Reconstruct command history
    const reconstructedLog = reconstructCommands(commits, tags);
    
    // 2. Ask for Source
    console.clear();
    console.log(formatTitle('Git Command Simulator 🕹️'));
    
    const { source } = await inquirer.prompt([
      {
        type: 'list',
        name: 'source',
        message: 'Select History Source:',
        choices: [
          { name: '📚 Git History (Reconstructed)', value: 'git' },
          { name: '💻 Mixed Mode (Git + Real Shell History)', value: 'mixed' }
        ]
      }
    ]);

    let commandLog = reconstructedLog;
    if (source === 'mixed') {
      const shellLog = parseShellHistory();
      // Simple filter: only shell commands in the date range of the repo?
      const repoStart = reconstructedLog[reconstructedLog.length - 1].timestamp;
      const recentShell = shellLog.filter(c => c.timestamp >= repoStart);
      commandLog = mergeHistories(reconstructedLog, recentShell);
    }

    console.log(chalk.dim('\nSelect a past event to replay and see what happened in the terminal.\n'));

    // 3. Interactive Loop
    while (true) {
      const choices = commandLog.map(cmd => {
        const dateStr = new Date(cmd.date).toISOString().split('T')[0];
        let label = `${chalk.hex('#A78BFA')(dateStr)}  ${cmd.cli}`;
        
        if (cmd.source === 'shell') {
          label = `${chalk.hex('#A78BFA')(dateStr)}  ${chalk.yellow('💻 ' + cmd.cli)}`;
        } else {
           if (cmd.author) label += `  ${chalk.dim(cmd.author)}`;
        }
        
        return { name: label, value: cmd };
      });

      choices.push(new inquirer.Separator());
      choices.push({ name: chalk.red('Exit Simulator'), value: 'exit' });

      // Inquirer pageSize limit handles large lists
      const { selectedCommand } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedCommand',
          message: 'Choose a command from history:',
          pageSize: 15,
          loop: false,
          choices: choices
        }
      ]);

      if (selectedCommand === 'exit') {
        console.log(chalk.yellow('\nExiting simulator... 👋\n'));
        break;
      }

      // Replay Action
      // We could add submenu here (Replay, Copy, Details), but let's default to Replay for now as requested.
      // "Click and Run" -> implies immediate action or a submenu.
      // Let's add a quick confirm or just replay. The user said "click and run".
      
      await replayCommand(selectedCommand);
      
      // Pause before returning to list
      await inquirer.prompt([{ type: 'input', name: 'pause', message: 'Press Enter to continue...' }]);
      console.clear();
    }

  } catch (error) {
    console.error(formatError(error.message));
  }
};
