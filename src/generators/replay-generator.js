import chalk from 'chalk';

export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function typeCommand(command, speed = 30) {
  process.stdout.write(chalk.green('➜  ') + chalk.cyan('project ') + chalk.yellow('git:(master) ') + 'git ');
  
  // Simulate "git " already typed or typed fast?
  // Let's type the rest
  const rest = command.startsWith('git ') ? command.slice(4) : command;
  
  for (const char of rest) {
    process.stdout.write(char);
    await sleep(Math.random() * speed + 20); // Variable typing speed
  }
  
  await sleep(300); // Pause before "enter"
  process.stdout.write('\n');
}

export async function showSimulatedOutput(lines, color = chalk.white) {
  await sleep(200); // Processing delay
  
  for (const line of lines) {
    console.log(color(line));
    await sleep(50); // Line buffering delay
  }
  console.log('');
}

export async function replayCommand(cmdObj) {
  console.clear();
  // Header context
  console.log(chalk.dim(`\n--- Replaying Event from ${new Date(cmdObj.date).toLocaleString()} ---\n`));
  
  await typeCommand(cmdObj.cli);
  await showSimulatedOutput(cmdObj.outputLines);
  
  console.log(chalk.dim('--- Command Completed (Simulated) ---'));
  console.log(chalk.dim('Press ENTER to return to list...'));
}
