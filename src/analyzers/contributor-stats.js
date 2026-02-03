export function getContributorStats(commits) {
  const contributors = {};

  commits.forEach(commit => {
    const author = commit.author_name || commit.author_email;
    const email = commit.author_email;
    
    if (!contributors[author]) {
      contributors[author] = {
        name: author,
        email: email,
        commitCount: 0,
        firstCommit: commit.date,
        lastCommit: commit.date,
        hashes: []
      };
    }

    const stats = contributors[author];
    stats.commitCount++;
    stats.hashes.push(commit.hash);
    
    if (new Date(commit.date) < new Date(stats.firstCommit)) {
      stats.firstCommit = commit.date;
    }
    if (new Date(commit.date) > new Date(stats.lastCommit)) {
      stats.lastCommit = commit.date;
    }
  });

  // Convert to array and sort by commit count
  return Object.values(contributors).sort((a, b) => b.commitCount - a.commitCount);
}
