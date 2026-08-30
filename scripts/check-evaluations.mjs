#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { inspectImage } from '../skill/visual-web/scripts/validate.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillRoot = path.join(root, 'skill', 'visual-web');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const catalog = readJson(path.join(skillRoot, 'references', 'catalog.json'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const results = [];
const hashes = new Set();
for (const id of ['architecture', 'instrument', 'school']) {
  const directory = path.join(root, 'evaluation', id);
  for (const file of ['selection.json', 'direction.md', 'prompt.md', 'hero.png', 'review.md']) {
    assert(fs.statSync(path.join(directory, file)).size > 100, `${id}: missing or empty ${file}`);
  }
  const selection = readJson(path.join(directory, 'selection.json'));
  assert(selection.brief?.product && selection.brief?.primaryAction, `${id}: incomplete brief`);
  assert(selection.direction?.concept, `${id}: missing independent concept`);
  assert(selection.references?.length >= 2, `${id}: insufficient reference provenance`);
  let mobile = 0;
  const references = [];
  const seen = new Set();
  for (const reference of selection.references) {
    const site = catalog.sites.find(candidate => candidate.id === reference.siteId);
    assert(site, `${id}: unknown source ${reference.siteId}`);
    for (const field of ['observed', 'adapt', 'reject']) {
      assert(typeof reference[field] === 'string' && reference[field].length > 20, `${id}: missing ${field}`);
    }
    assert(reference.captureIds?.length, `${id}: no selected captures`);
    for (const captureId of reference.captureIds) {
      const capture = site.captures.find(candidate => candidate.id === captureId);
      assert(capture, `${id}: unknown capture ${site.id}/${captureId}`);
      assert(fs.existsSync(path.join(skillRoot, capture.file)), `${id}: missing reference image`);
      const key = `${site.id}/${capture.id}`;
      assert(!seen.has(key), `${id}: duplicate selection ${key}`);
      seen.add(key);
      if (capture.kind === 'mobile') mobile++;
      references.push(key);
    }
  }
  assert(mobile > 0, `${id}: no mobile reference`);
  const bytes = fs.readFileSync(path.join(directory, 'hero.png'));
  const image = inspectImage(bytes);
  assert(image.format === 'png' && image.width > image.height, `${id}: hero is not a horizontal PNG`);
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  assert(!hashes.has(sha256), `${id}: duplicate hero`);
  hashes.add(sha256);
  results.push({ id, references, mobileReferences: mobile, image, sha256 });
}
console.log(JSON.stringify({ valid: true, evaluations: results.length, results,
  limits: 'Checks provenance and file integrity; visual quality and actual image-opening were reviewed separately.' }, null, 2));
