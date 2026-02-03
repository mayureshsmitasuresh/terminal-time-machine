import { analyzeCommits } from '../analyzers/commit-analyzer.js';

export function generateReleaseNotes(commits, fromRef, toRef) {
  const { categories, commits: enrichedCommits } = analyzeCommits(commits);
  
  // Get date range from commits if possible
  const lastCommit = enrichedCommits[0]; // Most recent
  const firstCommit = enrichedCommits[enrichedCommits.length - 1]; // Oldest
  const dateStr = lastCommit ? new Date(lastCommit.date).toLocaleDateString() : '';

  let output = `# Release Notes (${fromRef}...${toRef})\n`;
  output += `> Generated on ${new Date().toLocaleDateString()} | Target Release Date: ${dateStr}\n\n`;
  
  // Stats summary
  output += `**Total Commits**: ${commits.length}\n`;
  output += `**Features**: ${categories.feat} | **Fixes**: ${categories.fix} | **Refactors**: ${categories.refactor}\n\n`;
  
  // Sections
  const sections = {
    feat: '🚀 New Features',
    fix: '🐛 Bug Fixes',
    refactor: '🛠 Improvements',
    docs: '📚 Documentation',
    test: '✅ Tests',
    other: '🔍 Other Changes'
  };

  Object.keys(sections).forEach(type => {
    const typeCommits = enrichedCommits.filter(c => c.analysis.type === type);
    
    if (typeCommits.length > 0) {
      output += `## ${sections[type]}\n`;
      typeCommits.forEach(c => {
        const hash = c.hash.substring(0, 7);
        const subject = c.message.split('\n')[0];
        output += `- ${subject} (${hash}) - @${c.author_name}\n`;
      });
      output += '\n';
    }
  });

  // Contributors section
  const authors = [...new Set(commits.map(c => c.author_name))];
  output += `## 👥 Contributors\n`;
  output += `Thank you to: ${authors.join(', ')}\n`;

  return output;
}
