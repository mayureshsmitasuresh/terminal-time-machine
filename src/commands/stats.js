import { parseGitHistory } from '../analyzers/git-parser.js';
import { analyzeCommits } from '../analyzers/commit-analyzer.js';
import { detectMilestones } from '../analyzers/milestone-detector.js';
import { getContributorStats } from '../analyzers/contributor-stats.js';
import { generateHeatmap } from '../generators/heatmap-generator.js';
import { generateActivityChart } from '../generators/graph-generator.js';
import { formatTitle, formatError } from '../utils/formatting.js';
import { handleOutput } from '../utils/export.js';

export const statsCommand = async (options) => {
  try {
    const { commits, totalCommits, branches, tags } = await parseGitHistory(process.cwd());
    
    if (options.format === 'json' || (options.output && options.output.endsWith('.json'))) {
        const data = {
          totalCommits,
          branchCount: branches.all.length,
          tagCount: tags.all.length,
          commits: commits.map(c => ({ hash: c.hash, date: c.date, author: c.author_name, message: c.message })),
          analysis: totalCommits > 0 ? analyzeCommits(commits) : null,
          contributors: totalCommits > 0 ? getContributorStats(commits) : null,
          milestones: totalCommits > 0 ? detectMilestones(commits, tags) : null
        };
        handleOutput(data, options, 'json');
        return;
    }

    console.log(formatTitle('Repository Statistics'));
    console.log(`Total Commits: ${totalCommits}`);
    console.log(`Branches: ${branches.all.length}`);
    console.log(`Tags: ${tags.all.length}`);

    if (totalCommits > 0) {
      const analysis = analyzeCommits(commits);
      console.log(formatTitle('\nCommit Categories:'));
      Object.entries(analysis.categories).forEach(([type, count]) => {
        if (count > 0) console.log(`${type}: ${count}`);
      });

      const contributors = getContributorStats(commits);
      console.log(formatTitle('\nTop Contributors:'));
      contributors.slice(0, 5).forEach(c => {
        console.log(`${c.name}: ${c.commitCount} commits`);
      });

      const milestones = detectMilestones(commits, tags);
      console.log(formatTitle('\nMilestones Detected:'));
      milestones.forEach(m => {
        console.log(`${m.icon} ${new Date(m.date).toISOString().split('T')[0]} - ${m.title}`);
      });

      console.log(generateActivityChart(commits, options));
      console.log(generateHeatmap(commits, options));
    }

  } catch (err) {
    console.error(formatError(err.message));
  }
};
