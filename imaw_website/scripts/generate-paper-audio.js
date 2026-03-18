#!/usr/bin/env node
/**
 * generate-paper-audio.js
 *
 * Reads paper.md, strips markdown, and generates an MP3 via OpenAI TTS.
 * Usage: source ~/.zshrc && node scripts/generate-paper-audio.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAPER_PATH = path.join(__dirname, '..', 'src', 'paper.md');
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'paper-audio.mp3');

// OpenAI TTS limit is 4096 chars per request
const CHUNK_SIZE = 4000;

/**
 * Strip markdown formatting to produce clean prose for TTS.
 */
function stripMarkdown(md) {
  return md
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`[^`]+`/g, '')
    // Remove images
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Remove headings markers
    .replace(/^#{1,6}\s*/gm, '')
    // Remove bold/italic markers
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    // Remove horizontal rules
    .replace(/^---+$/gm, '')
    // Remove blockquote markers
    .replace(/^>\s*/gm, '')
    // Remove list markers
    .replace(/^\s*[-*]\s+/gm, '')
    // Remove numbered list markers
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove table formatting
    .replace(/\|/g, '')
    .replace(/^[-:]+$/gm, '')
    // Collapse multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Split text into chunks that respect sentence boundaries.
 */
function chunkText(text, maxLen) {
  const chunks = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    // Find the last sentence-ending punctuation within the limit
    let splitAt = -1;
    for (let i = maxLen; i >= maxLen * 0.5; i--) {
      if (remaining[i] === '.' || remaining[i] === '!' || remaining[i] === '?') {
        splitAt = i + 1;
        break;
      }
    }

    // Fallback: split at last space
    if (splitAt === -1) {
      splitAt = remaining.lastIndexOf(' ', maxLen);
    }
    if (splitAt <= 0) splitAt = maxLen;

    chunks.push(remaining.substring(0, splitAt).trim());
    remaining = remaining.substring(splitAt).trim();
  }

  return chunks;
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not set. Run: source ~/.zshrc && node scripts/generate-paper-audio.js');
    process.exit(1);
  }

  console.log('📄 Reading paper.md...');
  const raw = fs.readFileSync(PAPER_PATH, 'utf-8');
  const prose = stripMarkdown(raw);
  console.log(`   ${raw.length} chars → ${prose.length} chars (after stripping markdown)`);

  const chunks = chunkText(prose, CHUNK_SIZE);
  console.log(`   Split into ${chunks.length} chunks for TTS\n`);

  const client = new OpenAI({ apiKey });
  const audioBuffers = [];

  for (let i = 0; i < chunks.length; i++) {
    const pct = Math.round(((i + 1) / chunks.length) * 100);
    process.stdout.write(`🎙️  Generating chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars) ... `);

    const response = await client.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'alloy',
      input: chunks[i],
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    audioBuffers.push(buffer);
    console.log(`✅ (${buffer.length} bytes) [${pct}%]`);
  }

  console.log('\n📦 Concatenating audio...');
  const final = Buffer.concat(audioBuffers);

  // Ensure public dir exists
  const publicDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  fs.writeFileSync(OUTPUT_PATH, final);
  const sizeMB = (final.length / (1024 * 1024)).toFixed(2);
  console.log(`✅ Saved to ${OUTPUT_PATH} (${sizeMB} MB)`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
