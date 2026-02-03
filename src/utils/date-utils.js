export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

export function groupCommitsByPeriod(commits, period = 'month') {
  const groups = {};

  commits.forEach(commit => {
    const date = new Date(commit.date);
    let key;

    switch (period) {
      case 'year':
        key = date.getFullYear().toString();
        break;
      case 'month':
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        break;
      case 'day':
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(commit);
  });

  return groups;
}
