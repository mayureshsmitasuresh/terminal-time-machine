import chalk from 'chalk';

export const themes = {
  classic: {
    primary: chalk.blue,
    secondary: chalk.cyan,
    success: chalk.green,
    warning: chalk.yellow,
    error: chalk.red,
    muted: chalk.gray,
    feat: chalk.green,
    fix: chalk.red,
    docs: chalk.blue,
    refactor: chalk.yellow,
    test: chalk.magenta,
    other: chalk.white
  },
  sunset: {
    primary: chalk.hex('#FF6B6B'),
    secondary: chalk.hex('#4ECDC4'),
    success: chalk.hex('#95E1D3'),
    warning: chalk.hex('#FCE38A'),
    error: chalk.hex('#FF6B6B'),
    muted: chalk.hex('#556270'),
    feat: chalk.hex('#F38181'),
    fix: chalk.hex('#FCE38A'),
    docs: chalk.hex('#EAFFD0'),
    refactor: chalk.hex('#95E1D3'),
    test: chalk.hex('#A8E6CF'),
    other: chalk.hex('#FFFFFF')
  },
  neon: {
    primary: chalk.hex('#FF00FF'),
    secondary: chalk.hex('#00FFFF'),
    success: chalk.hex('#00FF00'),
    warning: chalk.hex('#FFFF00'),
    error: chalk.hex('#FF0000'),
    muted: chalk.hex('#444444'),
    feat: chalk.hex('#39FF14'),
    fix: chalk.hex('#FF0055'),
    docs: chalk.hex('#00FFFF'),
    refactor: chalk.hex('#CC00FF'),
    test: chalk.hex('#FFFF00'),
    other: chalk.hex('#E0E0E0')
  }
};

export const currentTheme = themes.classic;

export function getTheme(name = 'classic') {
  return themes[name] || themes.classic;
}
