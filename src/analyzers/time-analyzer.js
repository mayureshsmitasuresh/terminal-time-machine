export function analyzeTime(commits) {
  // Matrix: 7 days x 24 hours
  const matrix = Array(7).fill().map(() => Array(24).fill(0));
  const weekDayCounts = Array(7).fill(0);
  const hourCounts = Array(24).fill(0);

  // Vocabulary Analysis (Basic stopword filtering)
  const vocabulary = {};
  const stopwords = new Set([
     'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
     'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'up', 'down',
     'feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'test', 'merge', // types as well
     'branch', 'remote', 'origin', 'pull', 'request', 'bump', 'version', 
     'add', 'remove', 'update', 'delete', 'change', 'initial', 'commit'
  ]);

  commits.forEach(commit => {
    const date = new Date(commit.date);
    const day = date.getDay(); // 0=Sun, 6=Sat
    const hour = date.getHours(); // 0-23
    
    // Matrix
    matrix[day][hour]++;
    weekDayCounts[day]++;
    hourCounts[hour]++;

    // Vocab
    const words = commit.message.toLowerCase()
      .replace(/[^\w\s]/g, '') // remove punctuation
      .split(/\s+/);
      
    words.forEach(w => {
      if (w.length > 3 && !stopwords.has(w) && !/^\d+$/.test(w)) {
        vocabulary[w] = (vocabulary[w] || 0) + 1;
      }
    });
  });

  // Calculate Max for normalization
  let maxPunch = 0;
  matrix.forEach(row => {
    row.forEach(val => {
      if (val > maxPunch) maxPunch = val;
    });
  });

  // Sort Vocab
  const sortedVocab = Object.entries(vocabulary)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  return {
    matrix,
    weekDayCounts,
    hourCounts,
    maxPunch,
    vocabulary: sortedVocab
  };
}
