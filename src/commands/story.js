import ora from 'ora';
import chalk from 'chalk';
import boxen from 'boxen';
import { parseGitHistory } from '../analyzers/git-parser.js';
import { analyzeCommits } from '../analyzers/commit-analyzer.js';
import { generateNarrative } from '../generators/story-generator.js';
import { detectMilestones } from '../analyzers/milestone-detector.js';

export async function storyCommand(options = {}) {
  const spinner = ora('Analyzing git history...').start();
  
  try {
    // Step 1: Parse git history
    const gitData = await parseGitHistory(process.cwd(), options);
    
    if (!gitData || !gitData.commits || gitData.commits.length === 0) {
      spinner.fail('No commits found in this repository');
      return;
    }
    
    spinner.text = `Found ${gitData.commits.length} commits. Analyzing...`;
    
    // Step 2: Analyze commits (categorize, group, etc.)
    const analysis = await analyzeCommits(gitData.commits, options);
    
    // Step 3: Detect milestones
    // Passing tags if available for better release detection
    spinner.text = 'Detecting key milestones...';
    const milestones = detectMilestones(gitData.commits, gitData.tags);
    
    // Step 4: Generate the narrative story
    spinner.text = 'Generating story...';
    const story = generateNarrative({
      commits: gitData.commits,
      analysis: analysis,
      milestones: milestones,
      repoName: gitData.repoName,
      options: options
    });
    
    spinner.succeed('Story Generated!');
    
    // Display the story
    console.log('\n');
    console.log(boxen(chalk.bold.cyan('📖 Your Repository\'s Story'), {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'cyan'
    }));
    console.log('\n');
    console.log(story);
    console.log('\n'); // Extra spacing at the end
    
  } catch (error) {
    spinner.fail('Failed to generate story');
    console.error(chalk.red('Error:'), error.message);
    
    if (options.verbose) {
      console.error(chalk.gray(error.stack));
    }
    
    process.exit(1);
  }
}
