import { marked } from 'marked';
import fm from 'front-matter';
import fs from 'fs';
import path from 'path';

const POSTS_SRC = 'src/posts';
const POSTS_OUT = 'posts';
const TEMPLATE = 'src/_includes/post-template.html';

// Ensure output directory exists
if (!fs.existsSync(POSTS_OUT)) {
  fs.mkdirSync(POSTS_OUT, { recursive: true });
}

// Read template
const template = fs.readFileSync(TEMPLATE, 'utf-8');

// Process each markdown file
const files = fs.readdirSync(POSTS_SRC).filter(f => f.endsWith('.md'));

for (const file of files) {
  const content = fs.readFileSync(path.join(POSTS_SRC, file), 'utf-8');
  const { attributes, body } = fm(content);
  
  const html = marked(body);
  
  // Replace template variables
  let output = template
    .replace(/\{\{\s*title\s*\}\}/g, attributes.title || '')
    .replace(/\{\{\s*dateStr\s*\}\}/g, attributes.dateStr || '')
    .replace(/\{\{\s*content\s*\}\}/g, html);
  
  // Write output
  const outFile = file.replace('.md', '.html');
  fs.writeFileSync(path.join(POSTS_OUT, outFile), output);
  console.log(`Built: ${outFile}`);
}

console.log(`\n✓ Built ${files.length} post(s)`);
