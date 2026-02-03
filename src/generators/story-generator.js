import { groupCommitsByPeriod, formatDate } from '../utils/date-utils.js';
import { analyzeCommits } from '../analyzers/commit-analyzer.js';
import { introTemplates, chapterTitles, moodDescriptors, milestoneTemplates, getRandom } from '../../prompts/story-templates.js';

export function generateStory(commits, milestones, stats) {
  let story = '';
  
  // 1. Introduction
  const firstCommit = commits[commits.length - 1]; // Reverse chrono
  if (firstCommit) {
    const intro = getRandom(introTemplates).replace('{date}', formatDate(firstCommit.date));
    story += `# Prologue\n\n${intro}\n\n`;
  }

  // 2. Group by months for chapters
  const monthlyGroups = groupCommitsByPeriod(commits, 'month');
  const sortedMonths = Object.keys(monthlyGroups).sort();

  sortedMonths.forEach(monthKey => {
    const monthCommits = monthlyGroups[monthKey];
    const { categories } = analyzeCommits(monthCommits);
    
    // Determine Chapter Title based on dominant category
    let dominantType = 'mixed';
    let maxCount = 0;
    
    // Check key categories
    ['feat', 'fix', 'refactor'].forEach(type => {
      if (categories[type] > maxCount) {
        maxCount = categories[type];
        dominantType = type;
      }
    });

    // If mixed (no clear winner or low volume), stay mixed
    if (maxCount < 3) dominantType = 'mixed';

    const title = getRandom(chapterTitles[dominantType]);
    const prettyDate = new Date(monthKey + '-02').toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    
    story += `## Chapter: ${title} (${prettyDate})\n\n`;

    // Narrative content
    const total = monthCommits.length;
    let narrative = `In ${prettyDate}, the repository saw ${total} commits. `;
    
    if (total > 20) narrative += getRandom([moodDescriptors.high_activity]);
    else if (total < 5) narrative += getRandom([moodDescriptors.low_activity]);
    else narrative += getRandom([moodDescriptors.consistent]);

    narrative += ` Focus, primarily, was on **${dominantType === 'mixed' ? 'general improvements' : dominantType + 's'}**.\n\n`;
    
    story += narrative;

    // Highlights / Milestones in this month
    const monthMilestones = milestones.filter(m => m.date.startsWith(monthKey));
    if (monthMilestones.length > 0) {
      story += `### Key Moments\n`;
      monthMilestones.forEach(m => {
        let template = milestoneTemplates[m.type] || "{title} happened.";
        template = template.replace('{title}', m.title).replace('{name}', ''); // Placeholder
        story += `- ${m.icon} **${m.title}**: ${template}\n`;
      });
      story += '\n';
    }

    // Top 3 informative commits (simply listed for context)
    // Filter out merges or boring ones if possible
    const meaningfulCommits = monthCommits
      .filter(c => !c.message.startsWith('Merge'))
      .slice(0, 3);

    if (meaningfulCommits.length > 0) {
      story += `> *Notable work: ${meaningfulCommits.map(c => c.message.split('\n')[0]).join(', ')}*\n\n`;
    }
  });

  // 3. Conclusion
  story += `# Epilogue\n\nThe journey continues. With ${commits.length} commits behind us, the future remains unwritten.\n`;

  return story;
}
