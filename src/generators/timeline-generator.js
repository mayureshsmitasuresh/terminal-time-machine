import { getTheme } from '../config/themes.js';

export function generateTimeline(commits, milestones, options = {}) {
  const theme = getTheme(options.theme);
  let output = '';
  
  // Sort reverse chrono
  const sorted = [...commits].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let currentMonth = '';
  
  sorted.forEach((commit, index) => {
    const date = new Date(commit.date);
    const monthYear = date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    const day = date.getDate().toString().padStart(2, '0');
    
    // Check if it's a milestone
    const milestone = milestones.find(m => m.hash === commit.hash);
    const isMilestone = !!milestone;
    
    // Time grouping
    if (monthYear !== currentMonth) {
      output += theme.muted(`\n${monthYear}\n`);
      currentMonth = monthYear;
    }

    // Tree/Graph symbols (simplified)
    const connector = index === sorted.length - 1 ? '└─' : '├─';
    const symbol = isMilestone ? milestone.icon : '●';
    
    // Color coding based on type (assuming analysis ran)
    const type = commit.analysis ? commit.analysis.type : 'other';
    const color = theme[type] || theme.other;

    const shortHash = commit.hash.substring(0, 7);
    const summary = commit.message.split('\n')[0];
    
    let line = `${theme.muted(day)} ${theme.muted(connector)}${symbol} ${color(shortHash)} ${summary}`;
    
    if (isMilestone) {
      // chalk is needed for bold
      const chalkIndex = getTheme(options.theme).warning; // Fallback if import missing, but let's import it top level
      line += `\n     ${theme.muted('│')}  ${theme.warning('★')} ${milestone.title}`;
    }

    output += line + '\n';
  });

  return output;
}
