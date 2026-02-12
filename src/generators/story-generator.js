import { groupCommitsByPeriod, formatDate } from '../utils/date-utils.js';
import { analyzeCommits } from '../analyzers/commit-analyzer.js';
import { 
  introTemplates, 
  chapterTitles, 
  moodDescriptors, 
  milestoneTemplates, 
  transitions,
  contributorBiographies,
  epilogues,
  getRandom 
} from '../../prompts/story-templates.js';

export function generateNarrative({ commits, milestones, repoName, options }) {
  let story = '';
  
  // ── 1. Introduction ────────────────────────────────────────────────────────
  const firstCommit = commits[commits.length - 1]; // Reverse chrono, so last is first
  
  if (repoName) {
    story += `# The Story of ${repoName}\n\n`;
  } else {
    story += `# A Git Journey\n\n`;
  }

  if (firstCommit) {
    const intro = getRandom(introTemplates).replace('{date}', formatDate(firstCommit.date));
    story += `## Prologue\n\n${intro}\n\n`;
  }

  // ── 2. Group by months for chapters ────────────────────────────────────────
  const monthlyGroups = groupCommitsByPeriod(commits, 'month');
  const sortedMonths = Object.keys(monthlyGroups).sort();
  
  // Track seen contributors to identify newcomers
  const seenContributors = new Set();

  sortedMonths.forEach((monthKey, index) => {
    const monthCommits = monthlyGroups[monthKey];
    const { categories } = analyzeCommits(monthCommits);
    
    // Calculate Monthly Stats
    const total = monthCommits.length;
    const authors = new Set(monthCommits.map(c => c.author_name));
    
    // Calculate Dominant Category
    let dominantType = 'mixed';
    let maxCount = 0;
    ['feat', 'fix', 'refactor', 'docs', 'chore'].forEach(type => {
      if (categories[type] > maxCount) {
        maxCount = categories[type];
        dominantType = type;
      }
    });
    if (maxCount < Math.ceil(total * 0.4)) dominantType = 'mixed'; // If no clear winner (>40%)

    // Select Chapter Title
    const titlePool = chapterTitles[dominantType] || chapterTitles.mixed;
    const title = getRandom(titlePool);
    const prettyDate = new Date(monthKey + '-02').toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    
    story += `## Chapter: ${title} (${prettyDate})\n\n`;

    // ── Narrative Generation ───────────────────────────────────────────────
    // Extract top words for "Theme"
    const allWords = monthCommits.map(c => c.message.toLowerCase()).join(' ').split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'to', 'for', 'in', 'of', 'and', 'with', 'fix', 'feat', 'update', 'merge', 'remote', 'branch', 'pull', 'request', 'bump', 'version', 'from']);
    const wordCounts = {};
    allWords.forEach(w => {
      const clean = w.replace(/[^a-z0-9]/g, '');
      if (clean.length > 3 && !stopWords.has(clean)) {
        wordCounts[clean] = (wordCounts[clean] || 0) + 1;
      }
    });
    
    // Top 3 distinct terms
    const topTerms = Object.entries(wordCounts)
       .sort((a,b) => b[1] - a[1])
       .slice(0, 3)
       .map(e => e[0]);

    let narrative = `In ${prettyDate}, the repository saw **${total} commits**. `;
    
    // Mood selection
    if (total > 30) {
      narrative += getRandom(moodDescriptors.high_activity) + " ";
    } else if (total < 5) {
      narrative += getRandom(moodDescriptors.low_activity) + " ";
    } else {
      narrative += getRandom(moodDescriptors.consistent) + " ";
    }

    if (authors.size > 1 && total > 10) {
       narrative += getRandom(moodDescriptors.collaborative) + " ";
    }

    // Contextual description of work
    if (dominantType !== 'mixed') {
      const focusMap = {
        feat: "The primary focus was on shipping new features.",
        fix: "Efforts were concentrated on stability and bug fixes.",
        refactor: "The team took a step back to improve code quality.",
        docs: "Documentation was a priority this month.",
        chore: "Maintenance tasks dominated the workload."
      };
      narrative += focusMap[dominantType] || "";
    } else {
      narrative += "Work was balanced across various areas.";
    }
    
    // Inject Themes
    if (topTerms.length > 0) {
      narrative += ` Key themes included **${topTerms.join(', ')}**.`;
    }

    story += `${narrative}\n\n`;

    // ── Contributor Spotlight ──────────────────────────────────────────────
    // Check for newcomers
    const newComers = [];
    authors.forEach(author => {
      if (!seenContributors.has(author)) {
        seenContributors.add(author);
        newComers.push(author);
      }
    });
    
    // Check for "Hero" (Highest contributor this month)
    const authorCounts = {};
    monthCommits.forEach(c => {
      authorCounts[c.author_name] = (authorCounts[c.author_name] || 0) + 1;
    });
    const sortedAuthors = Object.entries(authorCounts).sort((a,b) => b[1] - a[1]);
    const topAuthor = sortedAuthors[0];
    
    let spotlight = "";
    
    if (newComers.length > 0 && index > 0) { // Don't show newcomers in first month (everyone is new)
       const randomNewcomer = getRandom(newComers);
       spotlight += getRandom(contributorBiographies.newcomer).replace('{name}', randomNewcomer) + " ";
    }
    
    // Only mention hero if they did significant work relative to total (>30%) and not just 1 commit
    if (topAuthor && topAuthor[1] > 1 && (topAuthor[1] / total) > 0.3) {
       spotlight += getRandom(contributorBiographies.hero).replace('{name}', topAuthor[0]).replace('{count}', topAuthor[1]);
    }
    
    if (spotlight) {
      story += `> 👥 ${spotlight}\n\n`;
    }

    // ── Key Moments ────────────────────────────────────────────────────────
    const monthMilestones = milestones.filter(m => m.date.startsWith(monthKey));
    if (monthMilestones.length > 0) {
      story += `### Key Moments\n`;
      monthMilestones.forEach(m => {
        let template = milestoneTemplates[m.type] || "{title}.";
        // If the title is already the generic "Major Changes", we might have replaced it in detector.
        // But here we rely on m.title being good now.
        // Also remove generic names from template if present
        template = template.replace('{title}', m.title).replace('{name}', ''); 
        // If template basically just repeats the title, maybe simplify?
        // But template usually adds flavor "The project hit a milestone: {title}"
        story += `- ${m.icon} **${m.title}**: ${template}\n`;
      });
      story += '\n';
    }

    // ── Notable Work (High Impact) ─────────────────────────────────────────
    const { commits: enrichedMonthCommits } = analyzeCommits(monthCommits);
    
    const meaningfulCommits = enrichedMonthCommits
      .filter(c => {
         const msg = c.message.toLowerCase();
         // Filter out boring stuff
         if (msg.startsWith('merge')) return false;
         if (msg.includes('bump version')) return false;
         if (msg.includes('typo')) return false;
         if (msg.length < 10) return false;
         return true;
      })
      .sort((a, b) => (b.analysis.impactScore || 0) - (a.analysis.impactScore || 0)) 
      .slice(0, 5); // Show up to 5 best commits

    if (meaningfulCommits.length > 0) {
      story += `> *Notable work:*\n`;
      meaningfulCommits.forEach(c => {
         // Clean subject
         let subject = c.message.split('\n')[0];
         if (subject.length > 60) subject = subject.substring(0, 57) + '...';
         story += `> * ${subject}\n`;
      });
      story += '\n';
    }
    
    // Add transition if not the last chapter
    if (index < sortedMonths.length - 1) {
       story += `_${getRandom(transitions)}_\n\n`;
    }
  });

  // ── 3. Epilogue ──────────────────────────────────────────────────────────
  const epilogue = getRandom(epilogues).replace('{count}', commits.length);
  story += `# Epilogue\n\n${epilogue}\n`;

  return story;
}
