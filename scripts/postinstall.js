import fs from 'fs';
import path from 'path';

// This script runs after npm install to automatically add generated files to .gitignore
// It helps keep the user's repository clean without manual configuration.

const gitignorePath = path.join(process.cwd(), '.gitignore');
const filesToIgnore = ['.ttm-cache.json', 'stats.json'];

try {
  if (fs.existsSync(gitignorePath)) {
    let content = fs.readFileSync(gitignorePath, 'utf-8');
    let added = false;
    let newContent = content;

    // Check for missing entries
    const missing = filesToIgnore.filter(file => !content.includes(file));

    if (missing.length > 0) {
      // Ensure newline at end of file if not present
      if (!newContent.endsWith('\n') && newContent.length > 0) {
        newContent += '\n';
      }
      
      newContent += '\n# Terminal Time Machine generated files\n';
      missing.forEach(file => {
        newContent += `${file}\n`;
      });
      
      fs.writeFileSync(gitignorePath, newContent);
      console.log('✔ Added .ttm-cache.json and stats.json to .gitignore');
    }
  } else {
    // No .gitignore found - likely not a git repo or user doesn't use git
    // We do nothing to avoid creating files where they might not be wanted.
  }
} catch (error) {
  // Silent fail - postinstall scripts should not break installation
  // console.error('Failed to update .gitignore:', error.message);
}
