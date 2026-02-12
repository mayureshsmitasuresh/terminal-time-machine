import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), '.ttm-cache.json');

// In-memory cache for the session
let memoryCache = null;

function loadCache() {
  if (memoryCache) return memoryCache;
  try {
    if (fs.existsSync(CACHE_FILE)) {
      memoryCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    } else {
      memoryCache = {};
    }
  } catch (e) {
    memoryCache = {};
  }
  return memoryCache;
}

function saveCache(cache) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    memoryCache = cache;
  } catch (e) {
    // Ignore cache errors
  }
}

export async function parseGitHistory(repoPath = process.cwd(), options = {}) {
  const git = simpleGit(repoPath);
  
  try {
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      throw new Error('Current directory is not a git repository');
    }

    // Cache key based on HEAD + options
    const head = await git.revparse(['HEAD']);
    const cacheKey = `${head.trim()}-${JSON.stringify(options)}`;
    
    // Check cache
    const cache = loadCache();
    if (cache[cacheKey]) {
      // console.log('Using cached git history'); // Debug
      return cache[cacheKey];
    }

    const logOptions = {
      '--stat': true,
    };

    if (options.since) logOptions['--since'] = options.since;
    if (options.until) logOptions['--until'] = options.until;
    if (options.from && options.to) {
        logOptions['from'] = options.from;
        logOptions['to'] = options.to;
    }
    if (options.limit) {
      logOptions['--max-count'] = options.limit;
    }
    
    // simple-git's .log() automatically parses standard log format
    const log = await git.log(logOptions);

    // Fetch branches and tags for context
    const branches = await git.branch();
    const tags = await git.tags();

    const result = {
      commits: log.all,
      totalCommits: log.total,
      branches,
      tags
    };

    // Save cache (limit cache size?)
    cache[cacheKey] = result;
    // Simple retention policy: keep last 5 keys? Or just save for now
    if (Object.keys(cache).length > 10) {
        const keys = Object.keys(cache);
        delete cache[keys[0]]; // Remove oldest inserted
    }
    saveCache(cache);

    return result;
  } catch (error) {
    if (error.message.includes('does not have any commits yet') || error.message.includes('fatal: bad default revision')) {
       return {
         commits: [],
         totalCommits: 0,
         branches: { all: [] },
         tags: { all: [] }
       };
    }
    throw new Error(`Failed to parse git history: ${error.message}`);
  }
}

export async function getGitLogGraph(repoPath = process.cwd(), limit = 50) {
  const git = simpleGit(repoPath);
  // Format: hash, subject, author relative-date
  // We want the graph lines to be preserved.
  // --graph --pretty=format:'%h %s (%cr) <%an>%d'
  try {
    const raw = await git.raw([
      'log',
      '--graph',
      '--color=always', // Force color from git? Or parse ourselves?
      // Git's color output is hard to parse if we want to change it.
      // Better to get plain text and colorize ourselves, OR let git do it if we like git's colors.
      // Plan said: "Apply custom coloring". So plain text is better.
      `--max-count=${limit}`,
      `--pretty=format:%h %s (%cr) <%an>%d` 
    ]);
    return raw;
  } catch (e) {
    return 'Error getting graph: ' + e.message;
  }
}
