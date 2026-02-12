import chalk from 'chalk';
import { getTheme } from '../config/themes.js';

export function generateHeatmap(commits, options = {}) {
  const theme = getTheme(options.theme);
  
  // 1. Map commits to dates (YYYY-MM-DD)
  const activity = {};
  commits.forEach(c => {
    const date = c.date.split('T')[0];
    activity[date] = (activity[date] || 0) + 1;
  });

  // 2. Generate matrix (Last 6 Months approx 26 weeks)
  const COLUMNS = 53; // ~1 year or 6 months? Let's do ~6 months (26 cols) for terminal width
  // Actually GitHub is 52 weeks. Terminal width is limited. 
  // 80 chars width. 
  // "Mon ⬛ ⬛ ⬛ ..."
  // 52 cols * 2 chars = 104 chars. Too wide for default 80 cols.
  // Let's do 30 weeks (~7 months). 30 * 2 = 60 chars. + labels = ~70 chars. Perfect.
  
  const RECENCY_WEEKS = 30;
  
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - (RECENCY_WEEKS * 7));
  
  // Align startDate to the previous Sunday (to start strictly on Sun-Sat grid)
  // GitHub starts on Sunday usually? Or Mon?
  // Let's assume standard Sun=0
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek); // Go back to Sunday

  // Levels
  // ' ' (0), '░' (1), '▒' (2), '▓' (3), '█' (4)
  // Or distinct blocks: ' ' (0), '▪' (1-2), '▪' (3-5), '■' (6-10), '■' (10+)
  // GitHub uses shades of green. We use colors + char.
  
  const levels = [
    { threshold: 0, char: ' ', color: theme.muted },   // Empty
    { threshold: 1, char: '▪', color: chalk.hex('#0E4429') }, // L1 (Dim)
    { threshold: 3, char: '▪', color: chalk.hex('#006D32') }, // L2
    { threshold: 6, char: '■', color: chalk.hex('#26A641') }, // L3
    { threshold: 10, char: '■', color: chalk.hex('#39D353') }, // L4 (Bright)
  ];
  
  // We can also use theme colors if we want.
  // But let's stick to a nice green "Contribution" aesthetic or theme-based.
  // Let's use theme.primary for max, theme.secondary for mid.
  
  const getCell = (count) => {
    if (count === 0) return chalk.dim('·'); // Dot for empty is nicer than space sometimes? Or specific ' ' with gray bg?
    // Let's use a dot for empty to see the grid
    if (count === 0) return chalk.hex('#2d333b')('□'); // GitHub dark mode empty
    
    if (count <= 2) return theme.muted('■');
    if (count <= 5) return theme.info('■');
    if (count <= 9) return theme.primary('■');
    return theme.success('■'); // Max
  };

  let output = theme.primary('Contribution Graph (Last 30 Weeks)\n\n');
  
  // Rows: Sun, Mon, Tue, Wed, Thu, Fri, Sat (0-6)
  // GitHub usually shows Mon, Wed, Fri labels.
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const showLabel = [false, true, false, true, false, true, false]; // Mon, Wed, Fri
  
  const grid = Array(7).fill().map(() => []);

  // build grid column by column
  let current = new Date(startDate);
  
  // We iterate week by week? No, day by day is safer.
  // Actually, we need columns.
  
  for (let week = 0; week < RECENCY_WEEKS; week++) {
    for (let day = 0; day < 7; day++) {
       const dateStr = current.toISOString().split('T')[0];
       const count = activity[dateStr] || 0;
       
       grid[day].push(getCell(count));
       
       current.setDate(current.getDate() + 1);
    }
  }

  // Render
  grid.forEach((row, dayIdx) => {
    const label = showLabel[dayIdx] ? dayLabels[dayIdx] : '   ';
    output += `${theme.muted(label)}  ${row.join(' ')}\n`;
  });
  
  // Legend?
  output += `\n${theme.muted('Less')}  ${getCell(0)} ${getCell(2)} ${getCell(5)} ${getCell(8)} ${getCell(12)}  ${theme.muted('More')}\n`;

  return output;
}
