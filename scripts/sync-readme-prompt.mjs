#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const promptPath = path.join(root, 'PROMPT-EMPRESA.md');
const readmePath = path.join(root, 'README.md');
const start = '<!-- PROMPT_EMPRESA_START -->';
const end = '<!-- PROMPT_EMPRESA_END -->';

const promptDocument = fs.readFileSync(promptPath, 'utf8');
const match = promptDocument.match(/```text\r?\n([\s\S]*?)\r?\n```/);
if (!match) throw new Error('PROMPT-EMPRESA.md must contain one text code block');

const readme = fs.readFileSync(readmePath, 'utf8');
const startIndex = readme.indexOf(start);
const endIndex = readme.indexOf(end);
if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) throw new Error('README prompt markers are missing or out of order');

const block = `${start}\n\n\`\`\`text\n${match[1]}\n\`\`\`\n\n${end}`;
const updated = `${readme.slice(0, startIndex)}${block}${readme.slice(endIndex + end.length)}`;
fs.writeFileSync(readmePath, updated);
console.log(`Synced ${match[1].split(/\r?\n/).length} prompt lines into README.md.`);
