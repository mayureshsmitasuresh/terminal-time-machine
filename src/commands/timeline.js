import { parseGitHistory } from '../analyzers/git-parser.js';
import { detectMilestones } from '../analyzers/milestone-detector.js';
import { generateTimeline } from '../generators/timeline-generator.js';
import { formatTitle, formatError } from '../utils/formatting.js';
import { handleOutput } from './story.js'; // Reuse helper

export const timelineCommand = async (options) => {
  try {
    const { commits, tags } = await parseGitHistory(process.cwd(), options);
    if (commits.length === 0) {
      console.log(formatError('No commits found in the specified range.'));
      return;
    }
    
    const milestones = detectMilestones(commits, tags);
    let timeline = generateTimeline(commits, milestones, options);
    
    if (options.format === 'html' || (options.output && options.output.endsWith('.html'))) {
        timeline = `<pre>\n${timeline}\n</pre>`;
    }
    
    if (options.output) {
        handleOutput(timeline, options, 'text');
    } else {
        console.log(formatTitle('Git History Timeline'));
        console.log(timeline);
    }
    
  } catch (err) {
    console.error(formatError(err.message));
  }
};
