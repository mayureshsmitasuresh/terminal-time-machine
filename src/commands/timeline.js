import { getGitLogGraph } from '../analyzers/git-parser.js';
import { processGitGraph } from '../generators/timeline-generator.js';
import { formatTitle, formatError } from '../utils/formatting.js';
import { getTheme } from '../config/themes.js';
import { askToExport } from '../utils/interactivity.js'; // New Import

export const timelineCommand = async (options) => {
  try {
    const limit = options.limit || 100; 
    const rawGraph = await getGitLogGraph(process.cwd(), limit);
    
    const theme = getTheme(options.theme);
    
    console.clear();
    console.log(formatTitle('Project Timeline ⚡'));
    
    if (rawGraph.startsWith('Error')) {
       console.error(formatError(rawGraph));
       return;
    }

    const coloredOutput = processGitGraph(rawGraph, theme);
    console.log(coloredOutput);

    // Ask to export
    if (!options.output) {
      // For PDF/Markdown export, we might want the *uncolored* or *plain* graph?
      // Or we can just save the text representation.
      // `rawGraph` contains raw text. `coloredOutput` has ANSI codes.
      // PDF generator needs to handle ANSI or strip it? 
      // markdown-pdf doesn't handle ANSI.
      // We should pass rawGraph or a stripped version.
      // Actually `rawGraph` from `git log --graph` is plain text structure.
      
      const exportContent = `# Project Timeline\n\n\`\`\`\n${rawGraph}\n\`\`\``;
      await askToExport(exportContent, 'timeline');
    }
    
  } catch (err) {
    console.error(formatError(err.message));
  }
};
