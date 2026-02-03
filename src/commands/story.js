import { marked } from 'marked';
import { parseGitHistory } from '../analyzers/git-parser.js';
import { detectMilestones } from '../analyzers/milestone-detector.js';
import { generateStory } from '../generators/story-generator.js';
import { formatTitle, formatError } from '../utils/formatting.js';
import { writeToFile } from '../utils/export.js';
import { formatSuccess } from '../utils/formatting.js';

// Reusable export handler
export function handleOutput(content, options, format = 'markdown') {
  if (options.output) {
    let outFormat = options.format || format;
    if (options.output.endsWith('.html')) outFormat = 'html';
    if (options.output.endsWith('.json')) outFormat = 'json';
    
    try {
      writeToFile(content, outFormat, options.output);
      console.log(formatSuccess(`Output saved to ${options.output}`));
    } catch (err) {
      console.error(formatError(err.message));
    }
  } else {
    if (format === 'markdown') {
      console.log(marked(content));
    } else {
      console.log(content);
    }
  }
}

export const storyCommand = async (options) => {
  try {
    console.log(formatTitle('Analyzing git history...'));
    const { commits, tags } = await parseGitHistory(process.cwd(), options);
    
    if (commits.length === 0) {
      console.log(formatError('No commits found.'));
      return;
    }

    console.log(formatTitle('Generating Story...'));
    const milestones = detectMilestones(commits, tags);
    const storyMarkdown = generateStory(commits, milestones);
    
    handleOutput(storyMarkdown, options, 'markdown');

  } catch (err) {
    console.error(formatError(err.message));
  }
};
