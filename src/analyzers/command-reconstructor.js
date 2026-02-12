import { formatDate } from '../utils/date-utils.js';

export function reconstructCommands(commits, tags) {
  const commands = [];

  // Iterate chronologically (oldest first) so we can build the story
  const chronologicalCommits = [...commits].reverse();

  chronologicalCommits.forEach(commit => {
    const { hash, date, message, author_name, diff, refs } = commit;
    const shortHash = hash.substring(0, 7);
    const friendlyDate = formatDate(date);
    
    // 1. Reconstruct Commit/Merge Command
    let cli = '';
    let type = 'commit';
    let outputLines = [];

    if (message.startsWith('Merge')) {
      const branchMatch = message.match(/Merge (?:branch|pull request) '([^']+)'/);
      const branchName = branchMatch ? branchMatch[1] : 'unknown-branch';
      
      cli = `git merge ${branchName}`;
      type = 'merge';
      outputLines = [
        `Merge made by the 'ort' strategy.`,
        ` ${shortHash}..${hash}  master -> master`
      ];
    } else {
      const safeMessage = message.replace(/"/g, '\\"');
      cli = `git commit -m "${safeMessage}"`;
      
      let stats = '';
      if (diff) {
        stats = `${diff.changed} file${diff.changed !== 1 ? 's' : ''} changed`;
        if (diff.insertions) stats += `, ${diff.insertions} insertions(+)`;
        if (diff.deletions) stats += `, ${diff.deletions} deletions(-)`;
      } else {
        stats = '1 file changed, 1 insertion(+)'; 
      }
      
      outputLines = [
        `[master ${shortHash}] ${message.split('\n')[0]}`,
        ` ${author_name} committed on ${friendlyDate}`,
        ` ${stats}`
      ];
    }

    commands.push({
      id: hash,
      date,
      type,
      cli,
      outputLines,
      timestamp: new Date(date).getTime(),
      author: author_name
    });

    // 2. Derive Tags from Refs
    // refs string example: "HEAD -> master, tag: v1.0.1, origin/master"
    if (refs && refs.includes('tag: ')) {
       const refParts = refs.split(',').map(r => r.trim());
       const tagRefs = refParts.filter(r => r.startsWith('tag: '));
       
       tagRefs.forEach(tagRef => {
         const tagName = tagRef.replace('tag: ', '');
         commands.push({
            id: `tag-${hash}-${tagName}`,
            date, // Same time as commit for simplicity
            type: 'tag',
            cli: `git tag ${tagName}`,
            outputLines: [], // Tags usually have no output
            timestamp: new Date(date).getTime() + 100, // Slightly after
            author: author_name
         });
       });
    }
  });

  return commands;
}
