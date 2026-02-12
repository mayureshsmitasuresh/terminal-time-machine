import inquirer from 'inquirer';
import chalk from 'chalk';
import { writeToFile } from './export.js';
import { convertMarkdownToPdf } from './pdf-exporter.js'; // Import our new tool
import { formatSuccess, formatError } from './formatting.js';

export async function askToExport(content, defaultFilenameBase = 'report') {
  console.log(''); // Spacing
  const response = await inquirer.prompt([
    {
      type: 'list',
      name: 'exportType',
      message: chalk.hex('#F472B6')('💾 Would you like to export this report?'),
      choices: [
        { name: 'No, thanks', value: 'no' },
        { name: `PDF (${defaultFilenameBase}.pdf)`, value: 'pdf' },
        { name: `Markdown (${defaultFilenameBase}.md)`, value: 'md' },
        { name: `HTML (${defaultFilenameBase}.html)`, value: 'html' },
        { name: `JSON (${defaultFilenameBase}.json)`, value: 'json' }
      ]
    }
  ]);

  if (response.exportType === 'no') return;

  const ext = response.exportType;
  const filename = `${defaultFilenameBase}.${ext}`;

  try {
    if (ext === 'pdf') {
      console.log(chalk.dim('Generating PDF...'));
      // PDF requires special handling
      // We assume content is Markdown string usually (except for JSON commands)
      // If content is object (for JSON stats), we might need to convert to text first?
      // For stats, we should pass the Markdown string representation to this function.
      
      if (typeof content !== 'string') {
        throw new Error('PDF export requires Markdown string content.');
      }
      
      await convertMarkdownToPdf(content, filename);
       console.log(formatSuccess(`Report saved to ${chalk.bold(filename)}`));
    } else {
      // Use existing writer
      writeToFile(content, ext, filename);
      console.log(formatSuccess(`Report saved to ${chalk.bold(filename)}`));
    }
  } catch (err) {
    console.error(formatError(`Export failed: ${err.message}`));
  }
}
