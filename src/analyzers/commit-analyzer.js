export function analyzeCommits(commits) {
  const categories = {
    feat: 0,
    fix: 0,
    docs: 0,
    style: 0,
    refactor: 0,
    test: 0,
    chore: 0,
    other: 0
  };

  const themes = new Map();

  const enrichedCommits = commits.map(commit => {
    const { message } = commit;
    let type = 'other';
    let scope = null;

    // Conventional Commits regex
    // type(scope): subject
    const match = message.match(/^(\w+)(?:\(([^)]+)\))?: .+/);
    
    if (match) {
      const detectedType = match[1].toLowerCase();
      if (categories.hasOwnProperty(detectedType)) {
        type = detectedType;
      }
      scope = match[2] || null;
    } else {
      // Fallback keywords
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('feature') || lowerMsg.includes('add')) type = 'feat';
      else if (lowerMsg.includes('fix') || lowerMsg.includes('bug')) type = 'fix';
      else if (lowerMsg.includes('doc') || lowerMsg.includes('readme')) type = 'docs';
      else if (lowerMsg.includes('test')) type = 'test';
      else if (lowerMsg.includes('refactor')) type = 'refactor';
    }

    categories[type]++;

    // Impact Score Calculation
    // Heuristic: (files_changed * 2) + (keywords matches)
    let impactScore = 1;
    const lowerMsg = commit.message.toLowerCase(); // Fix: Define lowerMsg
    
    if (commit.diff) {
        impactScore += (commit.diff.changed || 0) * 0.5;
        impactScore += (commit.diff.insertions || 0) * 0.1;
        impactScore += (commit.diff.deletions || 0) * 0.1;
    }
    
    // Boost for keywords
    if (lowerMsg.includes('breaking')) impactScore += 5;
    if (lowerMsg.includes('major')) impactScore += 3;
    if (type === 'feat') impactScore += 2;
    if (type === 'fix') impactScore += 1;

    return {
      ...commit,
      analysis: {
        type,
        scope,
        impactScore
      }
    };
  });

  return {
    categories,
    commits: enrichedCommits
  };
}
