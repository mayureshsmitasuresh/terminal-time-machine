import fs from 'fs';
import { marked } from 'marked';

export function writeToFile(content, format, filename) {
  let finalContent = content;

  if (format === 'html') {
    // Basic HTML wrapper with GitHub-like styling
    finalContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Terminal Time Machine Export</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; color: #24292e; }
pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
code { font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace; background: rgba(27,31,35,0.05); padding: 0.2em 0.4em; border-radius: 3px; }
h1, h2 { border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
blockquote { border-left: 0.25em solid #dfe2e5; color: #6a737d; padding: 0 1em; }
</style>
</head>
<body>
${marked(content)}
</body>
</html>`;
  } else if (format === 'json') {
    finalContent = JSON.stringify(content, null, 2);
  }

  try {
    fs.writeFileSync(filename, finalContent);
    return true;
  } catch (error) {
    throw new Error(`Failed to write file: ${error.message}`);
  }
}
