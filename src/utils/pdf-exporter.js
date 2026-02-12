import markdownpdf from 'markdown-pdf';
import fs from 'fs';
import path from 'path';
import { formatSuccess, formatError } from './formatting.js';

export function convertMarkdownToPdf(markdownContent, outputPath) {
  return new Promise((resolve, reject) => {
    // Custom CSS for simple styling
    const cssPath = path.join(process.cwd(), 'assets', 'pdf-styles.css');
    // Ensure assets dir exists or write temp css
    // For simplicity, let's inject CSS directly if library supports, or write a temp file
    
    // customizable css
    const css = `
      body { font-family: Helvetica, Arial, sans-serif; padding: 20px; line-height: 1.5; }
      h1, h2, h3 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
      code { font-family: monospace; background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
      pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      blockquote { border-left: 4px solid #ddd; padding-left: 10px; color: #666; }
    `;
    
    // We can pass options to markdown-pdf
    // It usually accepts a stream or string
    
    const tmpCss = path.join(process.cwd(), '.ttm-pdf.css');
    fs.writeFileSync(tmpCss, css);

    markdownpdf({
        cssPath: tmpCss,
        paperFormat: 'A4',
        orientation: 'portrait',
        border: '1cm'
    })
      .from.string(markdownContent)
      .to(outputPath, () => {
        // Cleanup
        if (fs.existsSync(tmpCss)) fs.unlinkSync(tmpCss);
        resolve(outputPath);
      });
  });
}
