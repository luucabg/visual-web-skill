#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIndex } from '../skill/visual-web/scripts/index.mjs';
import { inspectImage, isMain, resolveLibraryPath, validateCatalog } from '../skill/visual-web/scripts/validate.mjs';

export const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_SKILL_ROOT = path.join(PROJECT_ROOT, 'skill', 'visual-web');
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isId = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(value);
const readJson = file => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')); }
  catch (error) { throw new Error(`${file}: ${error.message}`); }
};
const stringify = value => `${JSON.stringify(value, null, 2)}\n`;
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function siteDirectories(skillRoot) {
  const sitesRoot = fs.realpathSync(path.join(skillRoot, 'references', 'sites'));
  const root = fs.realpathSync(skillRoot);
  const relative = path.relative(root, sitesRoot);
  assert(relative === path.join('references', 'sites'), 'references/sites must be a real directory inside the skill root');
  const entries = fs.readdirSync(sitesRoot, { withFileTypes: true });
  for (const entry of entries) if (entry.isSymbolicLink()) throw new Error(`Site entry must not be a symbolic link: ${entry.name}`);
  const directories = entries.filter(entry => entry.isDirectory()).map(entry => entry.name).sort((left, right) => left.localeCompare(right, 'en'));
  assert(directories.length > 0, 'No site directories found');
  return directories;
}

function mergeSite(skillRoot, directory, sourceDocuments) {
  assert(isId(directory), `Invalid site directory ID: ${directory}`);
  const sourcePath = resolveLibraryPath(skillRoot, `references/sites/${directory}/source.json`);
  const analysisPath = resolveLibraryPath(skillRoot, `references/sites/${directory}/analysis.json`);
  // analysis.md is required by the final catalog and index even though its contents are not merged.
  resolveLibraryPath(skillRoot, `references/sites/${directory}/analysis.md`);
  const source = readJson(sourcePath);
  const analysis = readJson(analysisPath);
  assert(isRecord(source) && source.id === directory, `${sourcePath}: source id must equal directory ${directory}`);
  assert(isRecord(analysis) && analysis.id === directory, `${analysisPath}: analysis id must equal directory ${directory}`);
  assert(Array.isArray(source.captures), `${sourcePath}: captures must be an array`);
  assert(Array.isArray(analysis.captures), `${analysisPath}: captures must be an array`);
  const sourceIds = new Set();
  const measuredCaptures = source.captures.map((capture, index) => {
    assert(isRecord(capture) && isId(capture.id), `${sourcePath}: invalid capture at index ${index}`);
    assert(!sourceIds.has(capture.id), `${sourcePath}: duplicate capture id ${capture.id}`);
    sourceIds.add(capture.id);
    const imagePath = resolveLibraryPath(skillRoot, capture.file);
    const { format, width, height } = inspectImage(fs.readFileSync(imagePath));
    const extension = path.extname(capture.file).toLowerCase();
    assert(format === (extension === '.png' ? 'png' : ['.jpg', '.jpeg'].includes(extension) ? 'jpeg' : null), `${sourcePath}: ${capture.file} extension does not match ${format} bytes`);
    return { ...capture, imageDimensions: { width, height } };
  });
  const analysisById = new Map();
  analysis.captures.forEach((capture, index) => {
    assert(isRecord(capture) && isId(capture.id), `${analysisPath}: invalid capture at index ${index}`);
    assert(!analysisById.has(capture.id), `${analysisPath}: duplicate capture id ${capture.id}`);
    assert(sourceIds.has(capture.id), `${analysisPath}: unknown capture id ${capture.id}`);
    analysisById.set(capture.id, capture);
  });
  const missing = [...sourceIds].filter(id => !analysisById.has(id));
  assert(missing.length === 0, `${analysisPath}: missing analyses for ${missing.join(', ')}`);
  const measuredSource = { ...source, captures: measuredCaptures };
  sourceDocuments.set(directory, measuredSource);
  return {
    id: source.id,
    name: source.name,
    url: source.url,
    capturedAt: source.capturedAt,
    tags: analysis.tags,
    industries: analysis.industries,
    summary: analysis.summary,
    analysis: `references/sites/${directory}/analysis.md`,
    captures: measuredCaptures.map(capture => {
      const notes = analysisById.get(capture.id);
      return { ...capture, observed: notes.observed, adaptation: notes.adaptation, avoid: notes.avoid, ...(notes.motion === undefined ? {} : { motion: notes.motion }) };
    }),
  };
}

function atomicWrites(documents) {
  const staged = [];
  try {
    for (const { target, contents } of documents) {
      const temporary = `${target}.rebuild-${process.pid}-${Math.random().toString(16).slice(2)}.tmp`;
      fs.writeFileSync(temporary, contents, { encoding: 'utf8', flag: 'wx' });
      assert(fs.readFileSync(temporary, 'utf8') === contents, `Staged write verification failed: ${temporary}`);
      staged.push({ target, temporary });
    }
    for (const { target, temporary } of staged) fs.renameSync(temporary, target);
  } finally {
    for (const { temporary } of staged) try { fs.unlinkSync(temporary); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}

/** Build all derived metadata in memory first. write=false is a read-only integration check. */
export function rebuildCatalog({ skillRoot = DEFAULT_SKILL_ROOT, write = true } = {}) {
  if (typeof write !== 'boolean') throw new TypeError('write must be boolean');
  const root = fs.realpathSync(skillRoot);
  const sourceDocuments = new Map();
  const sites = siteDirectories(root).map(directory => mergeSite(root, directory, sourceDocuments));
  const timestamps = sites.flatMap(site => [site.capturedAt, ...site.captures.map(capture => capture.capturedAt)]).map(value => Date.parse(value));
  assert(timestamps.every(Number.isFinite), 'All source and capture timestamps must be parseable');
  const catalog = { schemaVersion: 1, capturedAt: new Date(Math.max(...timestamps)).toISOString(), sites };
  const validation = validateCatalog(catalog, { rootDir: root, minSites: 1, minCapturesPerSite: 1, requireMobile: false, sourceDocuments });
  if (!validation.valid) throw new Error(`Rebuilt catalog is invalid:\n${validation.errors.map(error => `${error.code} ${error.path}: ${error.message}`).join('\n')}`);
  const index = buildIndex(catalog, { rootDir: root });
  if (write) {
    const documents = [...sourceDocuments.entries()].map(([id, source]) => ({ target: path.join(root, 'references', 'sites', id, 'source.json'), contents: stringify(source) }));
    documents.push({ target: path.join(root, 'references', 'catalog.json'), contents: stringify(catalog) });
    documents.push({ target: path.join(root, 'references', 'INDEX.md'), contents: index });
    atomicWrites(documents);
    const diskCatalog = readJson(path.join(root, 'references', 'catalog.json'));
    const diskValidation = validateCatalog(diskCatalog, { rootDir: root, minSites: 1, minCapturesPerSite: 1, requireMobile: false });
    if (!diskValidation.valid) throw new Error(`Written catalog verification failed:\n${diskValidation.errors.map(error => `${error.code} ${error.path}: ${error.message}`).join('\n')}`);
  }
  return { catalog, index, sources: sourceDocuments, validation, written: write, siteCount: sites.length, captureCount: sites.reduce((total, site) => total + site.captures.length, 0) };
}

if (isMain(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && !['--check', '--help', '-h'].includes(args[0]))) {
    console.error('Usage: node scripts/rebuild-catalog.mjs [--check | --help]');
    process.exitCode = 2;
  } else if (['--help', '-h'].includes(args[0])) console.log('Usage: node scripts/rebuild-catalog.mjs [--check]\nMeasures original image bytes, requires complete analysis metadata, rebuilds catalog.json and INDEX.md. --check performs no writes.');
  else {
    try {
      const result = rebuildCatalog({ write: args[0] !== '--check' });
      console.log(JSON.stringify({ written: result.written, sites: result.siteCount, captures: result.captureCount, warnings: result.validation.warnings }, null, 2));
    } catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
