import chalk from 'chalk';
import { getTheme } from '../config/themes.js';

export function generateHeatmap(commits, options = {}) {
  const theme = getTheme(options.theme);
  
  // 1. Map commits to dates (YYYY-MM-DD)
  const activity = {};
  commits.forEach(c => {
    const date = c.date.split('T')[0]; // Simple-git ISO string
    activity[date] = (activity[date] || 0) + 1;
  });

  // 2. Generate matrix (Last 52 weeks? Or simplified small grid for now)
  // Let's do last 6 months for terminal width safety (~26 weeks)
  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(now.getMonth() - 6);
  
  // Simple block characters: ░ ▒ ▓ █
  const levels = [' ', '░', '▒', '▓', '█'];
  
  let output = theme.primary('Activity Heatmap (Last 6 Months)\n\n');
  
  // Rows: Mon, Wed, Fri
  const days = ['Mon', '', 'Wed', '', 'Fri', '', ''];
  
  // We need to build a grid: 7 rows x N cols
  const grid = Array(7).fill().map(() => []);

  // Iterate weeks
  let current = new Date(startDate);
  // Align to previous Monday
  const dayOfWeek = current.getDay(); // 0=Sun, 1=Mon
  const diff = current.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
  current.setDate(diff);

  while (current <= now) {
    for (let day = 0; day < 7; day++) { // Mon=0 index logic adjustment?
      // Date object standard: 0=Sun, 1=Mon.
      // Let's map grid row 0 = Mon, 6 = Sun.
      
      const checkDate = new Date(current);
      checkDate.setDate(current.getDate() + day);
      
      // grid row mapping: 0(Mon)..4(Fri)..6(Sun)
      // checkDate.getDay(): 0=Sun, 1=Mon...
      // Map: Mon(1)->0, Tue(2)->1... Sun(0)->6
      const gridRow = checkDate.getDay() === 0 ? 6 : checkDate.getDay() - 1;
      
      const dateStr = checkDate.toISOString().split('T')[0];
      const count = activity[dateStr] || 0;
      
      let char = levels[0];
      if (count > 0) char = levels[1];
      if (count > 2) char = levels[2];
      if (count > 5) char = levels[3];
      if (count > 10) char = levels[4];
      
      let color = theme.muted;
      if (count > 0) color = theme.success;
      if (count > 5) color = theme.secondary;
      
      if (checkDate > now) {
         grid[gridRow].push(' '); 
      } else {
         grid[gridRow].push(color(char));
      }
    }
    // Next week
    current.setDate(current.getDate() + 7);
  }

  // Render grid
  grid.forEach((row, i) => {
    output += `${theme.muted(days[i].padEnd(4))} ${row.join('')}\n`;
  });

  return output;
}
