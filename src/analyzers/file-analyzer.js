// Since simple-git log doesn't always include full diff stats easily without extra calls,
// we will rely on what we can parse or infer. 
// If log options included --stat, the body might contain it, but parsing it from raw body is complex.
// ALTERNATIVE: Use a separate git command to get simple file stats: 
// git log --pretty=format: --name-only
// This is much faster/lighter than full stat parsing.

import simpleGit from 'simple-git';

export async function analyzeFiles(repoPath = process.cwd(), options = {}) {
  const git = simpleGit(repoPath);
  
  try {
    const logOptions = ['--pretty=format:', '--name-only'];
    if (options.since) logOptions.push(`--since=${options.since}`);
    if (options.until) logOptions.push(`--until=${options.until}`);
    
    const raw = await git.raw(['log', ...logOptions]);
    
    const fileCounts = {};
    const lines = raw.split('\n');
    let totalFilesChanged = 0;
    
    lines.forEach(line => {
      const file = line.trim();
      if (file) {
        fileCounts[file] = (fileCounts[file] || 0) + 1;
        totalFilesChanged++;
      }
    });
    
    const sortedFiles = Object.entries(fileCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([file, count]) => ({ file, count }));
      
    return {
      hotspots: sortedFiles,
      totalFilesChanged
    };
  } catch (error) {
    console.error('File analysis failed:', error);
    return { hotspots: [], totalFilesChanged: 0 };
  }
}
