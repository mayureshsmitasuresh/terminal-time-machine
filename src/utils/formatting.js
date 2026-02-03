import chalk from 'chalk';

export function formatTitle(text) {
  return chalk.bold.blue(text);
}

export function formatError(text) {
  return chalk.red('✖ ' + text);
}

export function formatSuccess(text) {
  return chalk.green('✔ ' + text);
}
