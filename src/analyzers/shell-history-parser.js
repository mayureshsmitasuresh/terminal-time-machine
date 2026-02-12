import fs from 'fs';
import path from 'path';
import os from 'os';

export function parseShellHistory(repoPath = process.cwd()) {
  const history = [];
  const homeDir = os.homedir();
  
  // Try ZSH history first (Mac default)
  const zshPath = path.join(homeDir, '.zsh_history');
  const bashPath = path.join(homeDir, '.bash_history');
  
  let rawContent = '';
  let type = 'unknown';

  try {
    if (fs.existsSync(zshPath)) {
      rawContent = fs.readFileSync(zshPath, 'utf-8');
      type = 'zsh';
    } else if (fs.existsSync(bashPath)) {
      rawContent = fs.readFileSync(bashPath, 'utf-8');
      type = 'bash';
    }
  } catch (e) {
    // Permission denied or other error
    return [];
  }

  const lines = rawContent.split('\n');
  const repoName = path.basename(repoPath);

  // Heuristic: We want commands that *likely* happened in this repo.
  // Since history doesn't store CWD, we look for:
  // 1. "cd <repo>" commands -> Start a "session"
  // 2. git commands that match known history? Hard.
  // 3. Just all git commands? Too noisy.
  
  // Strategy:
  // Filter for 'git' commands.
  // If we find 'cd .../repoName', boost confidence.
  
  // Parsing logic
  lines.forEach(line => {
    let timestamp = Date.now(); // Default if not found
    let command = '';

    if (type === 'zsh') {
      // Format: : 1678888888:0;git commit...
      const match = line.match(/^: (\d+):\d+;(.*)/);
      if (match) {
        timestamp = parseInt(match[1]) * 1000;
        command = match[2];
      }
    } else {
      // Bash: straightforward usually, or minimal
      command = line;
    }

    if (!command) return;

    // Filter useful commands
    // We want real "shell habits" but maybe avoid secrets
    // Exclude: standard noise, secrets?
    // Actually, `analyzeShellHabits` does the counting/filtering of 'ttm'/'clear'.
    // Here we should just capture "valid looking" commands.
    
    // Safety: exclude lines with potentially sensitive keywords if possible?
    // For local tool, we trust the user's local history access, but let's be safe.
    // We already filter empty.
    
    if (command.length < 2) return;
    
    // Allow everything (analyzeShellHabits filters 'ttm', 'clear' etc)
    // But maybe still skip blatantly empty or 'exit' here to save memory?
    if (command === 'exit') return;

    history.push({
         cli: command.trim(),
         date: new Date(timestamp),
         timestamp: timestamp,
         source: 'shell',
         type: 'shell'
    });
  });

  return history;
}

export function analyzeShellHabits(historyLines = []) {
  if (historyLines.length === 0) {
    historyLines = parseShellHistory();
  }

  const commandCounts = {};
  const ignored = ['git', 'cd', 'ls', 'll', 'clear', 'exit', 'ttm', 'npm', 'node', 'pnpm', 'yarn']; // Common prefixes to maybe ignore? 
  // User asked to ignore `ttm` and `clear`.
  // Let's be specific about what we count. usually we want the full command or just the tool?
  // "tell all the commands ignoring clear and ttm commands what has been ran"
  // Let's count the *program* (first word) but maybe also full command for context?
  // Let's count "Programs" (e.g. 'vim', 'docker', 'cargo')
  
  const recentCommands = [];

  historyLines.forEach(entry => {
    const parts = entry.cli.trim().split(' '); // Changed from entry.command to entry.cli based on parseShellHistory output
    const program = parts[0];

    // Filter noise
    if (!program) return;
    if (['ttm', 'clear', 'history', 'exit'].includes(program)) return;
    // node bin/ttm.js matches 'node'
    if (program === 'node' && entry.cli.includes('ttm')) return; // Changed from entry.command to entry.cli

    // Count usage
    commandCounts[program] = (commandCounts[program] || 0) + 1;
    
    // Keep recent (uniqueish?)
    // identifying recent meaningful work
    recentCommands.push(entry);
  });

  // Sort counts
  const sortedCounts = Object.entries(commandCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([program, count]) => ({ program, count }));

  return {
    topCommands: sortedCounts,
    recentCommands: recentCommands.reverse().slice(0, 50) // Last 50 meaningful commands
  };
}

// Merge Shell History with Reconstructed History
export function mergeHistories(gitEvents, shellEvents) {
  // We need to deduplicate.
  // Reconstructed events are "perfect" (derived from commit).
  // 2. If a shell command closely matches a git event command AND is near same time, use Shell (it's more authentic).
  // 3. Else, include it as context.
  
  const combined = [...gitEvents, ...shellEvents];
  combined.sort((a, b) => b.timestamp - a.timestamp); // Reverse chrono for list
  
  // Dedupe logic (simple window)
  const deduped = [];
  const seenCommits = new Set();
  
  combined.forEach(event => {
    if (event.source === 'shell') {
      deduped.push(event);
    } else {
      // It's a reconstructed git event (commit/tag)
      // Have we seen a shell command that looks like this recently?
      // e.g. "git commit -m 'mesage'" vs "git commit -m "message""
      // For now, just keep both? Or prioritize reconstructed for data quality?
      // User wants "whatever he has entered".
      // Let's explicitly mark them.
      deduped.push(event);
    }
  });

  return deduped;
}
