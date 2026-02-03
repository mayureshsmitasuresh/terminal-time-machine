import asciichart from 'asciichart';
import { getTheme } from '../config/themes.js';
import { groupCommitsByPeriod } from '../utils/date-utils.js';

export function generateActivityChart(commits, options = {}) {
  const theme = getTheme(options.theme);
  
  // Group by day for the chart
  const grouped = groupCommitsByPeriod(commits, 'day');
  
  // Get keys (dates) sorted
  const dates = Object.keys(grouped).sort();
  
  if (dates.length === 0) return '';
  
  // Fill in gaps? asciichart needs continuous array preferably
  // For simplicity, just chart the existing days first, but gaps make it misleading.
  // Better: Create array from start to end date.
  
  const startDate = new Date(dates[0]);
  const endDate = new Date(dates[dates.length - 1]);
  const series = [];
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split('T')[0];
    const count = grouped[key] ? grouped[key].length : 0;
    series.push(count);
  }

  const chart = asciichart.plot(series, {
    height: 10,
    colors: [asciichart.blue] // asciichart uses its own color codes or ANSI
  });

  return theme.primary('\nCommit Activity Trend\n') + chart;
}
