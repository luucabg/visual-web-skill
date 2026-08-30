#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const ignoredRootNames = new Set(['.git', 'node_modules', 'gates']);
const ignoredFiles = new Set(['GATES.md', 'GATES-PUBLISH.md', 'PLAN.md']);
const files = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error(`Symbolic link is not releasable: ${entry.name}`);
    const full = path.join(directory, entry.name);
    const relative = path.relative(root, full).replaceAll('\\', '/');
    if (entry.isDirectory()) {
      if (ignoredRootNames.has(entry.name) && directory === root) continue;
      walk(full);
    } else if (!ignoredFiles.has(relative) && !/^evaluation\/[^/]+\/GATES\.md$/.test(relative)) {
      files.push({ full, relative, size: fs.statSync(full).size });
    }
  }
}
walk(root);

for (const required of ['README.md', 'PROMPT-EMPRESA.md', 'LICENSE.md', 'NOTICES.md', 'CONTRIBUTING.md',
  '.github/workflows/verify.yml', 'docs/visual-web-cover.svg', 'docs/social-preview.png', 'skill/visual-web/SKILL.md']) {
  assert(files.some(file => file.relative === required), `Release file missing: ${required}`);
}
const privatePackage = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
assert(privatePackage.private === true, 'package.json must prevent accidental npm publishing');

const textExtensions = new Set(['.md', '.json', '.mjs', '.yaml', '.yml', '.svg', '.ps1', '.txt', '.gitignore', '.gitattributes']);
const personalPath = /(?:[A-Za-z]:[\\/]Users[\\/]|\/Users\/)[A-Za-z0-9._-]+[\\/][^\s`"']+/i;
const secret = /(?:github_pat_[A-Za-z0-9_]{20,}|ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,})/;
let markdownLinks = 0;
for (const file of files) {
  assert(file.size < 50 * 1024 * 1024, `File exceeds the conservative 50 MB release limit: ${file.relative}`);
  const extension = path.extname(file.relative).toLowerCase() || path.basename(file.relative).toLowerCase();
  if (!textExtensions.has(extension)) continue;
  const text = fs.readFileSync(file.full, 'utf8');
  assert(!personalPath.test(text), `Personal filesystem path found in ${file.relative}`);
  assert(!secret.test(text), `Possible credential found in ${file.relative}`);
  if (extension !== '.md') continue;
  const withoutCode = text.replace(/```[\s\S]*?```/g, '');
  const targets = [
    ...[...withoutCode.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map(match => match[1]),
    ...[...withoutCode.matchAll(/<(?:img|source)[^>]+src=["']([^"']+)["']/gi)].map(match => match[1]),
  ];
  for (const rawTarget of targets) {
    const target = rawTarget.trim().replace(/^<|>$/g, '').split('#')[0];
    if (!target || /^(?:https?:|mailto:|#)/i.test(target)) continue;
    const decoded = decodeURIComponent(target);
    assert(!path.isAbsolute(decoded) && !/^[A-Za-z]:/.test(decoded), `Nonportable Markdown link in ${file.relative}: ${target}`);
    const resolved = path.resolve(path.dirname(file.full), decoded);
    const containment = path.relative(root, resolved);
    assert(!containment.startsWith('..') && !path.isAbsolute(containment), `Markdown link leaves release: ${file.relative}: ${target}`);
    assert(fs.existsSync(resolved), `Broken Markdown link in ${file.relative}: ${target}`);
    markdownLinks++;
  }
}

const cover = fs.readFileSync(path.join(root, 'docs', 'visual-web-cover.svg'), 'utf8');
assert(/width="1280" height="640"/.test(cover) && /role="img"/.test(cover), 'Cover must be a 2:1 accessible SVG');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
for (const phrase of ['Pruébala con un solo mensaje', 'Instalación sencilla', 'Tres resultados', 'Uso responsable']) {
  assert(readme.includes(phrase), `README is missing its nontechnical section: ${phrase}`);
}

console.log(JSON.stringify({
  valid: true,
  releaseFiles: files.length,
  releaseBytes: files.reduce((sum, file) => sum + file.size, 0),
  markdownLinks,
  personalPaths: 0,
  possibleCredentials: 0,
  largestFile: (({ relative, size }) => ({ relative, size }))(files.sort((a, b) => b.size - a.size)[0]),
}, null, 2));
