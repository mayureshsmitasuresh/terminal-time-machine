import chalk from 'chalk';
import { getTheme } from '../config/themes.js';

export function generatePunchCard(matrix, maxPunch, options = {}) {
  const theme = getTheme(options.theme);
  
  // Matrix is 7 rows (days) x 24 cols (hours)
  // Day 0 = Sun, Day 1 = Mon ... Day 6 = Sat
  
  let output = '';
  
  // Header: hours every 3 marks
  output += '     ';
  for (let h = 0; h < 24; h++) {
    if (h % 3 === 0) output += chalk.dim(h.toString().padStart(2, '0'));
    else output += '  '; // Spacing
  }
  output += '\n';

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const levels = [' ', '░', '▒', '▓', '█']; // Density chars

  matrix.forEach((row, dayIndex) => {
    output += ` ${chalk.dim(dayLabels[dayIndex])} `;
    
    row.forEach(count => {
      // Normalize to 0-4 scale
      let level = 0;
      if (count > 0) {
        // Simple logic: relative to maxPunch
        const ratio = count / (maxPunch || 1);
        if (ratio < 0.25) level = 1;
        else if (ratio < 0.5) level = 2;
        else if (ratio < 0.75) level = 3;
        else level = 4;
      }
      
      const char = levels[level];
      const color = level === 0 ? chalk.dim : (level < 3 ? theme.secondary : theme.primary);
      
      output += color(char) + ' '; // Space for width
    });
    output += '\n';
  });

  return output;
}
