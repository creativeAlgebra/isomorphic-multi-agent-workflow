#!/usr/bin/env node
/**
 * generate-paper-pdf.js
 *
 * Converts paper.md to a clean PDF using Puppeteer.
 * Renders markdown to HTML, styles it, and prints to PDF.
 *
 * Usage: node scripts/generate-paper-pdf.js
 * Output: public/paper.pdf
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAPER_PATH = path.join(__dirname, '..', 'src', 'paper.md');
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'paper.pdf');

async function main() {
  console.log('📄 Reading paper.md...');
  const md = fs.readFileSync(PAPER_PATH, 'utf-8');

  // Dynamic imports for ESM compatibility
  const { marked } = await import('marked');
  const puppeteer = await import('puppeteer');

  console.log('🔄 Converting markdown to HTML...');
  const htmlBody = await marked.parse(md);

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  body {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 11pt;
    line-height: 1.7;
    color: #1a1a1a;
    max-width: 680px;
    margin: 0 auto;
    padding: 40px 60px;
  }
  h1, h2, h3, h4 { font-weight: 600; margin-top: 2em; margin-bottom: 0.5em; color: #0f172a; }
  h3 { font-size: 14pt; }
  h4 { font-size: 12pt; }
  p { margin: 0.8em 0; }
  strong { font-weight: 600; }
  em { font-style: italic; }
  a { color: #2563eb; text-decoration: none; }
  code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.9em; background: #f5f5f5; padding: 2px 5px; border-radius: 3px; }
  pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 0.85em; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 3px solid #e5e5e5; margin-left: 0; padding-left: 16px; color: #666; font-style: italic; }
  table { width: 100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.9em; }
  th, td { border: 1px solid #e5e5e5; padding: 8px 12px; text-align: left; }
  th { background: #f9fafb; font-weight: 600; }
  hr { border: none; border-top: 1px solid #e5e5e5; margin: 2em 0; }
  ul, ol { padding-left: 24px; }
  li { margin: 0.4em 0; }
</style>
</head>
<body>${htmlBody}</body>
</html>`;

  console.log('🖨️  Launching browser and generating PDF...');
  const browser = await puppeteer.default.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: OUTPUT_PATH,
    format: 'Letter',
    margin: { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' },
    printBackground: true,
  });
  await browser.close();

  const sizeMB = (fs.statSync(OUTPUT_PATH).size / (1024 * 1024)).toFixed(2);
  console.log(`Saved to ${OUTPUT_PATH} (${sizeMB} MB)`);
}

main().catch(err => { console.error('❌ Fatal:', err.message); process.exit(1); });
