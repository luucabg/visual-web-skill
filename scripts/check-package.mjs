#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIndex } from '../skill/visual-web/scripts/index.mjs';
import { inspectImage, validateCatalog } from '../skill/visual-web/scripts/validate.mjs';
import { rebuildCatalog } from './rebuild-catalog.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillRoot = path.join(root, 'skill', 'visual-web');
const read = file => fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  assert(!entry.isSymbolicLink(), `Unexpected symbolic link: ${entry.name}`);
  const full = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});

const catalog = JSON.parse(read(path.join(skillRoot, 'references', 'catalog.json')));
const validation = validateCatalog(catalog, { rootDir: skillRoot });
assert(validation.valid, JSON.stringify(validation.errors));
const rebuilt = rebuildCatalog({ write: false });
assert(JSON.stringify(rebuilt.catalog) === JSON.stringify(catalog), 'catalog.json is stale; rebuild it');
assert(buildIndex(catalog, { rootDir: skillRoot }) === read(path.join(skillRoot, 'references', 'INDEX.md')), 'INDEX.md is stale');

const files = walk(skillRoot);
const documents = [...files.filter(file => file.endsWith('.md')), path.join(root, 'README.md'), path.join(root, 'NOTICES.md'), path.join(root, 'evaluation', 'RESULTS.md')];
let localLinks = 0;
for (const file of documents) {
  const markdown = read(file).replace(/```[\s\S]*?```/g, '');
  for (const match of markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].trim().replace(/^<|>$/g, '');
    if (/^(https?:|mailto:|#)/i.test(target)) continue;
    const relative = decodeURIComponent(target.split('#')[0]);
    assert(!path.isAbsolute(relative) && !/^[A-Za-z]:/.test(relative), `Nonportable Markdown link in ${file}: ${target}`);
    const resolved = path.resolve(path.dirname(file), relative);
    const containment = path.relative(root, resolved);
    assert(!containment.startsWith('..') && !path.isAbsolute(containment), `Link leaves package: ${file}: ${target}`);
    assert(fs.existsSync(resolved), `Broken local link: ${file}: ${target}`);
    localLinks++;
  }
}

let analysisImageLinks = 0;
for (const site of catalog.sites) {
  const analysis = read(path.join(skillRoot, site.analysis));
  for (const capture of site.captures) {
    assert(analysis.includes(`](${path.basename(capture.file)})`), `Analysis must link its capture: ${site.id}/${capture.id}`);
    analysisImageLinks++;
  }
}

const caseRoot = path.join(skillRoot, 'references', 'cases', 'offgrid');
const caseCounts = {};
for (const type of ['sections', 'photos']) {
  const images = fs.readdirSync(path.join(caseRoot, type));
  assert(images.length === 8, `OFFGRID ${type}: expected 8, found ${images.length}`);
  for (const filename of images) {
    const image = inspectImage(fs.readFileSync(path.join(caseRoot, type, filename)));
    assert(image.format === 'png', `OFFGRID file is not PNG: ${filename}`);
    if (type === 'sections') assert(image.width > image.height, `Section must be horizontal: ${filename}`);
  }
  caseCounts[type] = images.length;
}

console.log(JSON.stringify({
  valid: true,
  sites: catalog.sites.length,
  captures: catalog.sites.reduce((sum, site) => sum + site.captures.length, 0),
  mobileCaptures: catalog.sites.flatMap(site => site.captures).filter(capture => capture.kind === 'mobile').length,
  analysisImageLinks,
  markdownDocuments: documents.length,
  localLinks,
  offgrid: caseCounts,
  warnings: validation.warnings.length,
  warningCodes: [...new Set(validation.warnings.map(warning => warning.code))],
  skillFiles: files.length,
  skillBytes: files.reduce((sum, file) => sum + fs.statSync(file).size, 0),
}, null, 2));
