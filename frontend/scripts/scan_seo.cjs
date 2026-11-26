const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanDir(fullPath));
    } else if (entry.name === 'page.jsx' || entry.name === 'layout.jsx') {
      const content = fs.readFileSync(fullPath, 'utf8');
      const hasMetadata = content.includes('export const metadata');
      const hasGenerateMetadata = content.includes('generateMetadata');
      const isClient = content.includes("'use client'") || content.includes('"use client"');
      
      let title = null;
      const titleMatch = content.match(/title:\s*['"`]([^'"`]+)['"`]/) || content.match(/title:\s*\{\s*default:\s*['"`]([^'"`]+)['"`]/);
      if (titleMatch) {
        title = titleMatch[1];
      }

      results.push({
        file: fullPath.replace(path.join(process.cwd(), 'frontend') + path.sep, '').replace(/\\/g, '/'),
        isClient,
        hasMetadata,
        hasGenerateMetadata,
        title
      });
    }
  }
  return results;
}

const list = scanDir(path.join(process.cwd(), 'frontend', 'app'));
console.log(JSON.stringify(list, null, 2));
