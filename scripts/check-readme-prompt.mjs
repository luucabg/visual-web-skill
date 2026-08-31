#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const prompt = fs.readFileSync(path.join(root, 'PROMPT-EMPRESA.md'), 'utf8').match(/```text\r?\n([\s\S]*?)\r?\n```/)?.[1];
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const embedded = readme.match(/<!-- PROMPT_EMPRESA_START -->\s*```text\r?\n([\s\S]*?)\r?\n```\s*<!-- PROMPT_EMPRESA_END -->/)?.[1];

if (!prompt || !embedded) throw new Error('Prompt code block or README markers are missing');
if (embedded !== prompt) throw new Error('README prompt differs from PROMPT-EMPRESA.md; run node scripts/sync-readme-prompt.mjs');
for (const phrase of ['DATOS DE LA EMPRESA', 'DECISIONES QUE TE DELEGO', 'PROCESO VISUAL OBLIGATORIO', 'IMPLEMENTACIÓN Y COMPROBACIÓN', 'ENTREGA']) {
  if (!embedded.includes(phrase)) throw new Error(`README prompt is incomplete: ${phrase}`);
}
console.log(JSON.stringify({ valid: true, lines: embedded.split(/\r?\n/).length, characters: embedded.length }));
