import chalk from 'chalk';

export function processGitGraph(rawGraph, themeObj) {
  const lines = rawGraph.split('\n');
  let output = '';

  lines.forEach(line => {
    // We want to colorize the graph structure (|, /, \, *) differently from the text
    // The graph structure is always at the beginning.
    // Regex strategy: match the leading graph characters.
    // Graph chars are usually: * | / \ _ - . and spaces
    
    // It's tricky because * is also a commit bullet.
    
    // Simple heuristic: split by timestamp/hash pattern?
    // Our format: %h %s (%cr) <%an>%d
    // The hash is the first 7-char hex string we see?
    
    const hashMatch = line.match(/([a-f0-9]{7}) /); // Find the hash
    
    if (hashMatch) {
      const idx = hashMatch.index;
      // Everything before hash is graph
      const graphPart = line.substring(0, idx);
      const rest = line.substring(idx);
      
      // Colorize graph part: logic to make rails distinct colors?
      // For now, just a nice neon color.
      const coloredGraph = graphPart
        .replace(/\*/g, chalk.hex('#F472B6')('●')) // Commit dot
        .replace(/[|\\/]/g, (m) => chalk.hex('#60A5FA')(m)); // Rails
        
      // Colorize text part
      // Hash: Yellow
      // Message: White
      // (Date): Dim
      // <Author>: Cyan
      
      const coloredRest = rest.replace(
        /^([a-f0-9]{7}) (.*) \((.*)\) <(.*)>(.*)/,
        (match, h, msg, date, auth, refs) => {
           return `${chalk.yellow(h)} ${chalk.white(msg)} ${chalk.dim(`(${date})`)} ${chalk.cyan(`<${auth}>`)}${chalk.red(refs)}`;
        }
      );
      
      output += coloredGraph + coloredRest + '\n';
    } else {
      // Just graph line (merges sometimes have extra lines) or end
      const coloredGraph = line
        .replace(/[|\\/]/g, (m) => chalk.hex('#60A5FA')(m));
      output += coloredGraph + '\n';
    }
  });

  return output;
}
