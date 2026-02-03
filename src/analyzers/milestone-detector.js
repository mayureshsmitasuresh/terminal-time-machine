export function detectMilestones(commits, tags) {
  const milestones = [];

  // Sort commits by date ascending
  const sortedCommits = [...commits].sort((a, b) => new Date(a.date) - new Date(b.date));

  if (sortedCommits.length === 0) return [];

  // 1. Project Inception
  milestones.push({
    date: sortedCommits[0].date,
    hash: sortedCommits[0].hash,
    type: 'inception',
    title: 'Project Inception',
    description: 'The journey begins!',
    icon: '🌱'
  });

  // 2. Releases (Tags)
  if (tags && tags.all) {
    tags.all.forEach(tagName => {
      // Find commit for this tag (simple-git often gives tag maps, but here we might need to match refs)
      // For now, we'll try to match exact hash if available or assume it's properly linked in a real scenario
      // NOTE: simple-git "tags" output is list of names. "log" can include refs.
      
      // Let's look for commits that have "tag: vX.Y.Z" in their refs
      // Check if refs exist first
      const tagCommit = sortedCommits.find(c => c.refs && c.refs.includes(`tag: ${tagName}`));
      
      if (tagCommit) {
        milestones.push({
          date: tagCommit.date,
          hash: tagCommit.hash,
          type: 'release',
          title: `Release ${tagName}`,
          description: `Version ${tagName} released.`,
          icon: '🚀'
        });
      }
    });
  }

  // 3. Major Refactors (High file churn)
  // Assuming 'diff' details are available or we estimate from 'changes'
  // simple-git log with --stat gives diff property usually if parsed right, or we use .diff object
  // For now, check diff.changed
  sortedCommits.forEach(commit => {
    if (commit.diff && commit.diff.changed > 15) { // Arbitrary threshold
      milestones.push({
        date: commit.date,
        hash: commit.hash,
        type: 'refactor',
        title: 'Major Changes',
        description: `Massive update affecting ${commit.diff.changed} files.`,
        icon: '🏗️'
      });
    }
  });

  return milestones.sort((a, b) => new Date(a.date) - new Date(b.date));
}
