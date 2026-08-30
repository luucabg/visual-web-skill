import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { DEFAULT_ROOT, inspectImage, inspectJpeg, inspectPng, validateCatalog } from '../skill/visual-web/scripts/validate.mjs';
import { FIELD_WEIGHTS, parseSearchArgs, searchCatalog } from '../skill/visual-web/scripts/search.mjs';
import { buildIndex } from '../skill/visual-web/scripts/index.mjs';

const STAMP = '2026-08-31T14:12:03.123Z';
const SCRIPT_DIR = fileURLToPath(new URL('../skill/visual-web/scripts/', import.meta.url));
const FACTUAL = ['id', 'file', 'kind', 'viewport', 'imageDimensions', 'pageUrl', 'capturedAt', 'scrollY', 'sectionLabel'];
// 3×5 RGB JPEG encoded once by System.Drawing, embedded so tests need no image library.
const JPEG = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAFAAMDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD8+qKKK+oPnD//2Q==', 'base64');

// Actual tiny RGB PNG fixtures: zlib-compressed scanlines and independently computed chunk checksums.
function chunk(type, data) {
  const name = Buffer.from(type, 'ascii');
  const checked = Buffer.concat([name, data]);
  let crc = 0xffffffff;
  for (const byte of checked) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  const result = Buffer.alloc(data.length + 12);
  result.writeUInt32BE(data.length);
  checked.copy(result, 4);
  result.writeUInt32BE((crc ^ 0xffffffff) >>> 0, result.length - 4);
  return result;
}
function png(width, height, seed = 1, { filter = 0, rawOverride, compressedOverride } = {}) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  const rows = Buffer.alloc((width * 3 + 1) * height, seed);
  for (let row = 0; row < height; row++) rows[row * (width * 3 + 1)] = filter;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', compressedOverride ?? deflateSync(rawOverride ?? rows)), chunk('IEND', Buffer.alloc(0))]);
}

function fixture(t, { siteCount = 1, captureCount = 4 } = {}) {
  const tempRoot = fs.realpathSync(os.tmpdir());
  const base = fs.mkdtempSync(path.join(tempRoot, 'visual-web-tooling-'));
  const rootDir = path.join(base, 'library');
  fs.mkdirSync(rootDir);
  t.after(() => {
    // Explicit containment check before recursive cleanup; never delete an unchecked computed path.
    const resolved = path.resolve(base);
    assert.equal(path.dirname(resolved), tempRoot);
    assert.ok(path.basename(resolved).startsWith('visual-web-tooling-'));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  const catalog = { schemaVersion: 1, capturedAt: STAMP, sites: [] };
  for (let index = 0; index < siteCount; index++) {
    const id = `site-${index + 1}`;
    const directory = `references/sites/${id}`;
    fs.mkdirSync(path.join(rootDir, directory), { recursive: true });
    const site = { id, name: `Reference ${index + 1}`, url: `https://example.com/${id}`, capturedAt: STAMP, tags: ['editorial', 'minimalist', 'serif'], industries: ['art'], summary: 'Measured typography and generous whitespace.', analysis: `${directory}/analysis.md`, captures: [] };
    fs.writeFileSync(path.join(rootDir, site.analysis), '# Observed reference\n\nReal fixture image inspected by the test.\n');
    for (let captureIndex = 0; captureIndex < captureCount; captureIndex++) {
      const kind = ['hero', 'editorial', 'closing', 'mobile'][captureIndex % 4];
      const captureId = `${kind}-${captureIndex + 1}`;
      const viewport = kind === 'mobile' ? { width: 3, height: 5 } : { width: 12 + index, height: 8 };
      const capture = { id: captureId, file: `${directory}/${captureId}.png`, kind, viewport, imageDimensions: { ...viewport }, pageUrl: site.url, capturedAt: STAMP, scrollY: kind === 'editorial' ? 800 : kind === 'closing' ? 1600 : 0, sectionLabel: `${kind} section`, observed: ['Large typography and visible whitespace'], adaptation: ['Adapt the typographic contrast'], avoid: ['Do not reproduce the brand mark'], motion: { status: 'not-tested', description: 'A still image cannot demonstrate animation.' } };
      fs.writeFileSync(path.join(rootDir, capture.file), png(viewport.width, viewport.height, index * captureCount + captureIndex + 1));
      site.captures.push(capture);
    }
    catalog.sites.push(site);
  }
  const syncSource = (index = 0) => {
    const site = catalog.sites[index];
    const source = { id: site.id, name: site.name, url: site.url, capturedAt: site.capturedAt, captures: site.captures.map(capture => Object.fromEntries(FACTUAL.map(field => [field, capture[field]]))) };
    fs.writeFileSync(path.join(rootDir, `references/sites/${site.id}/source.json`), JSON.stringify(source));
    return source;
  };
  for (let index = 0; index < siteCount; index++) syncSource(index);
  const save = () => fs.writeFileSync(path.join(rootDir, 'references/catalog.json'), JSON.stringify(catalog));
  save();
  const options = { rootDir, minSites: 1, minCapturesPerSite: 1 };
  const validate = () => validateCatalog(catalog, options);
  const sourcePath = (index = 0) => path.join(rootDir, `references/sites/${catalog.sites[index].id}/source.json`);
  const installScripts = () => {
    const directory = path.join(rootDir, 'scripts');
    fs.mkdirSync(directory, { recursive: true });
    for (const name of ['validate.mjs', 'search.mjs', 'index.mjs']) fs.copyFileSync(path.join(SCRIPT_DIR, name), path.join(directory, name));
  };
  const cli = (script, args = []) => spawnSync(process.execPath, [path.join(rootDir, 'scripts', script), ...args], { cwd: base, encoding: 'utf8', timeout: 10000 });
  return { base, rootDir, catalog, options, validate, syncSource, save, sourcePath, installScripts, cli };
}

function hasError(result, code) {
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.code === code), `Expected ${code}; got ${JSON.stringify(result.errors)}`);
}

test('validator accepts actual PNG files and matching source manifests', t => {
  const f = fixture(t);
  const result = f.validate();
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
  assert.deepEqual(result.stats, { sites: 1, captures: 4, mobileCaptures: 1, uniqueImages: 4 });
  assert.deepEqual(inspectPng(fs.readFileSync(path.join(f.rootDir, f.catalog.sites[0].captures[0].file))), { width: 12, height: 8 });
});

test('validator enforces real-library minimums by default and the portable CLI uses them', t => {
  const small = fixture(t, { captureCount: 1 });
  const rejected = validateCatalog(small.catalog, { rootDir: small.rootDir });
  for (const code of ['MIN_SITES', 'MIN_CAPTURES', 'MOBILE_MISSING']) hasError(rejected, code);
  const full = fixture(t, { siteCount: 12 });
  assert.equal(validateCatalog(full.catalog, { rootDir: full.rootDir }).valid, true);
  full.installScripts();
  const accepted = full.cli('validate.mjs');
  assert.equal(accepted.status, 0, accepted.stderr || accepted.stdout);
  assert.deepEqual(JSON.parse(accepted.stdout).stats, { sites: 12, captures: 48, mobileCaptures: 12, uniqueImages: 48 });
  small.installScripts();
  assert.equal(small.cli('validate.mjs').status, 1);
  assert.equal(small.cli('validate.mjs', ['--min-sites', '1']).status, 2);
});

test('validator safely rejects malformed catalog and nested shapes', t => {
  const f = fixture(t);
  for (const malformed of [null, [], 'catalog', 1, { schemaVersion: 1, sites: null }]) assert.equal(validateCatalog(malformed, f.options).valid, false);
  for (const change of [catalog => { catalog.schemaVersion = 2; }, catalog => { catalog.sites[0] = null; }, catalog => { catalog.sites[0].captures = null; }, catalog => { catalog.sites[0].captures[0] = null; }, catalog => { catalog.sites[0].tags = 'art'; }, catalog => { catalog.sites[0].captures[0].observed = []; }, catalog => { catalog.sites[0].captures[0].motion = { status: 'assumed', description: 'Guess' }; }]) {
    const catalog = structuredClone(f.catalog);
    change(catalog);
    assert.equal(validateCatalog(catalog, f.options).valid, false);
  }
  assert.throws(() => validateCatalog(f.catalog, { ...f.options, minSites: 0 }), /positive integer/);
  assert.throws(() => validateCatalog(f.catalog, { ...f.options, minCapturesPerSite: 1.5 }), /positive integer/);
  assert.throws(() => validateCatalog(f.catalog, { ...f.options, requireMobile: 'false' }), /boolean/);
});

test('validator rejects path traversal, absolute paths and alternate separators', t => {
  const f = fixture(t);
  for (const file of ['../escape.png', 'references/../../escape.png', '/etc/file.png', 'C:/outside.png', 'C:\\outside.png', '\\\\server\\share\\capture.png', 'references\\escape.png', 'references//capture.png', 'references/./capture.png']) {
    const catalog = structuredClone(f.catalog);
    catalog.sites[0].captures[0].file = file;
    hasError(validateCatalog(catalog, f.options), 'FILE');
  }
  const catalog = structuredClone(f.catalog);
  catalog.sites[0].analysis = '../outside.md';
  hasError(validateCatalog(catalog, f.options), 'ANALYSIS_FILE');
});

test('validator rejects a directory junction that escapes the library', t => {
  const f = fixture(t);
  const outside = path.join(f.base, 'outside');
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(outside, 'escape.png'), png(12, 8));
  fs.symlinkSync(outside, path.join(f.rootDir, 'references', 'escape'), process.platform === 'win32' ? 'junction' : 'dir');
  f.catalog.sites[0].captures[0].file = 'references/escape/escape.png';
  const result = f.validate();
  hasError(result, 'FILE');
  assert.ok(result.errors.some(error => /Symlink escapes/.test(error.message)));
});

test('validator reports missing image, analysis, empty analysis and source files', t => {
  const f = fixture(t);
  const site = f.catalog.sites[0];
  fs.unlinkSync(path.join(f.rootDir, site.captures[0].file));
  hasError(f.validate(), 'FILE');
  fs.writeFileSync(path.join(f.rootDir, site.analysis), ' \n');
  hasError(f.validate(), 'ANALYSIS_EMPTY');
  fs.unlinkSync(path.join(f.rootDir, site.analysis));
  hasError(f.validate(), 'ANALYSIS_FILE');
  fs.unlinkSync(f.sourcePath());
  hasError(f.validate(), 'SOURCE_FILE');
});

test('validator rejects invalid PNG signature, CRC, truncation and fake scanlines', t => {
  const f = fixture(t);
  const capture = f.catalog.sites[0].captures[0];
  const file = path.join(f.rootDir, capture.file);
  const original = fs.readFileSync(file);
  const badCrc = Buffer.from(original);
  badCrc[20] ^= 1;
  for (const invalid of [Buffer.from('This is not a screenshot.'), original.subarray(0, 30), badCrc, png(12, 8, 1, { filter: 5 }), png(12, 8, 1, { rawOverride: Buffer.alloc(1) }), png(12, 8, 1, { compressedOverride: Buffer.from('not deflate') }), Buffer.concat([original, Buffer.from('trailing bytes')])]) {
    fs.writeFileSync(file, invalid);
    hasError(f.validate(), 'IMAGE');
  }
});

test('validator measures dimensions from the actual PNG and checks imageDimensions', t => {
  const f = fixture(t);
  const capture = f.catalog.sites[0].captures[0];
  fs.writeFileSync(path.join(f.rootDir, capture.file), png(24, 16));
  const result = f.validate();
  hasError(result, 'IMAGE_DIMENSIONS');
  assert.match(result.errors.find(error => error.code === 'IMAGE_DIMENSIONS').message, /24×16.*imageDimensions.*12×8/);
});

test('validator accepts original JPEG bytes and measures the SOF dimensions', t => {
  const f = fixture(t);
  const capture = f.catalog.sites[0].captures[3];
  capture.file = capture.file.replace('.png', '.jpg');
  fs.writeFileSync(path.join(f.rootDir, capture.file), JPEG);
  f.syncSource();
  assert.deepEqual(inspectJpeg(JPEG), { width: 3, height: 5 });
  assert.deepEqual(inspectImage(JPEG), { format: 'jpeg', width: 3, height: 5 });
  assert.equal(f.validate().valid, true);
  capture.imageDimensions.width = 6;
  hasError(f.validate(), 'IMAGE_DIMENSIONS');
});

test('validator preserves viewport differences as warnings without inventing DPR', t => {
  const f = fixture(t);
  const capture = f.catalog.sites[0].captures[0];
  capture.viewport = { width: 1440, height: 900 };
  f.syncSource();
  const result = f.validate();
  assert.equal(result.valid, true);
  assert.equal(result.warnings.length, 1);
  assert.equal(result.warnings[0].code, 'IMAGE_VIEWPORT_DIFFERENCE');
  assert.match(result.warnings[0].message, /without inferring DPR/);
  const found = searchCatalog(f.catalog, 'hero', { rootDir: f.rootDir, kind: 'hero' })[0];
  assert.deepEqual(found.viewport, { width: 1440, height: 900 });
  assert.deepEqual(found.imageDimensions, { width: 12, height: 8 });
});

test('validator rejects extension mismatches for both JPEG and PNG originals', t => {
  const f = fixture(t);
  const capture = f.catalog.sites[0].captures[3];
  fs.writeFileSync(path.join(f.rootDir, capture.file), JPEG);
  hasError(f.validate(), 'IMAGE_EXTENSION_MISMATCH');
  capture.file = capture.file.replace('.png', '.jpeg');
  fs.writeFileSync(path.join(f.rootDir, capture.file), png(3, 5));
  f.syncSource();
  hasError(f.validate(), 'IMAGE_EXTENSION_MISMATCH');
});

test('validator rejects truncated JPEG segments, missing scans and invalid SOF headers', () => {
  const sof = JPEG.indexOf(Buffer.from([0xff, 0xc0]));
  const sos = JPEG.indexOf(Buffer.from([0xff, 0xda]));
  assert.ok(sof > 0 && sos > sof);
  const badWidth = Buffer.from(JPEG);
  badWidth.writeUInt16BE(0, sof + 7);
  const badLength = Buffer.from(JPEG);
  badLength.writeUInt16BE(0xffff, 4);
  const badComponents = Buffer.from(JPEG);
  badComponents[sof + 9] = 0;
  for (const invalid of [JPEG.subarray(0, 100), JPEG.subarray(0, JPEG.length - 2), badWidth, badLength, badComponents, Buffer.concat([JPEG.subarray(0, sos), Buffer.from([0xff, 0xd9])]), Buffer.concat([JPEG, Buffer.from([0])]), Buffer.from([0xff, 0xd8, 0xff, 0xd9])]) assert.throws(() => inspectJpeg(invalid));
});

test('validator rejects duplicate image bytes under different filenames and sites', t => {
  const f = fixture(t, { siteCount: 2 });
  const first = f.catalog.sites[0].captures[0];
  const other = f.catalog.sites[1].captures[0];
  fs.copyFileSync(path.join(f.rootDir, first.file), path.join(f.rootDir, other.file));
  hasError(f.validate(), 'DUPLICATE_IMAGE');
  f.catalog.sites[0].captures[1].file = first.file;
  hasError(f.validate(), 'DUPLICATE_PATH');
  f.catalog.sites[0].captures[1].id = first.id;
  hasError(f.validate(), 'DUPLICATE_CAPTURE');
  f.catalog.sites[1].id = f.catalog.sites[0].id;
  hasError(f.validate(), 'DUPLICATE_SITE');
});

test('validator rejects bad viewports, timestamps, URLs and scroll positions', t => {
  const f = fixture(t);
  for (const viewport of [null, { width: 0, height: 10 }, { width: -2, height: 10 }, { width: 2.5, height: 10 }, { width: 2, height: '10' }]) {
    const catalog = structuredClone(f.catalog);
    catalog.sites[0].captures[0].viewport = viewport;
    hasError(validateCatalog(catalog, f.options), 'VIEWPORT');
    catalog.sites[0].captures[0].imageDimensions = viewport;
    hasError(validateCatalog(catalog, f.options), 'IMAGE_DIMENSIONS_SHAPE');
  }
  for (const url of ['javascript:alert(1)', 'file:///secret', '/relative', 'https://user:password@example.com', 'not a URL', 'https:example.com', 'https://example.com/\nbroken']) {
    const catalog = structuredClone(f.catalog);
    catalog.sites[0].url = url;
    catalog.sites[0].captures[0].pageUrl = url;
    hasError(validateCatalog(catalog, f.options), 'URL');
  }
  for (const stamp of ['', 'yesterday', '2026-08-31', '2026-02-31T12:00:00Z', '2026-08-31T24:00:00Z', '2026-08-31T12:00:00']) {
    const catalog = structuredClone(f.catalog);
    catalog.sites[0].capturedAt = stamp;
    hasError(validateCatalog(catalog, f.options), 'TIMESTAMP');
  }
  f.catalog.sites[0].captures[0].scrollY = -1;
  hasError(f.validate(), 'SCROLL');
});

test('validator cross-checks source IDs, capture membership and factual metadata', t => {
  const f = fixture(t);
  const source = JSON.parse(fs.readFileSync(f.sourcePath(), 'utf8'));
  const mutations = [
    ['SOURCE_ID', data => { data.id = 'another-site'; }],
    ['SOURCE_URL', data => { data.url = 'https://wrong.example/'; }],
    ['SOURCE_COUNT', data => { data.captures.pop(); }],
    ['SOURCE_CAPTURE_MISSING', data => { data.captures[0].id = 'not-in-catalog'; }],
    ['SOURCE_DUPLICATE_CAPTURE', data => { data.captures[1].id = data.captures[0].id; }],
    ['SOURCE_MISMATCH', data => { data.captures[0].scrollY = 300; }],
    ['SOURCE_MISMATCH', data => { data.captures[0].viewport.width = 2; }],
    ['SOURCE_MISMATCH', data => { data.captures[0].imageDimensions.width = 2; }],
    ['SOURCE_CAPTURE', data => { data.captures[0] = null; }],
    ['SOURCE_CAPTURES', data => { data.captures = {}; }],
  ];
  for (const [code, mutate] of mutations) {
    const data = structuredClone(source);
    mutate(data);
    fs.writeFileSync(f.sourcePath(), JSON.stringify(data));
    hasError(f.validate(), code);
  }
  fs.writeFileSync(f.sourcePath(), '{');
  hasError(f.validate(), 'SOURCE_JSON');
  fs.writeFileSync(f.sourcePath(), 'null');
  hasError(f.validate(), 'SOURCE_SHAPE');
});

test('search matches Spanish and English concepts with transparent ranking and absolute paths', t => {
  const f = fixture(t, { siteCount: 2 });
  const first = f.catalog.sites[0];
  first.tags = ['dark', 'luxury'];
  first.industries = ['fashion'];
  const english = searchCatalog(f.catalog, 'dark fashion typography', { rootDir: f.rootDir, kind: 'hero' });
  const spanish = searchCatalog(f.catalog, 'oscuro moda tipografía', { rootDir: f.rootDir, kind: 'hero' });
  assert.equal(english[0].siteId, first.id);
  assert.equal(spanish[0].siteId, first.id);
  assert.equal(spanish[0].reasons.find(reason => reason.queryTerm === 'moda').field, 'industries');
  assert.equal(spanish[0].reasons.find(reason => reason.queryTerm === 'tipografia').matchedTerm, 'typography');
  assert.equal(english[0].score, FIELD_WEIGHTS.tags + FIELD_WEIGHTS.industries + FIELD_WEIGHTS.observed);
  assert.ok(spanish[0].reasons.every(reason => reason.via === 'synonym'));
  assert.equal(Math.round(spanish[0].reasons.reduce((sum, reason) => sum + reason.contribution, 0) * 100) / 100, spanish[0].score);
  for (const key of ['imagePath', 'analysisPath', 'sourcePath']) {
    assert.equal(path.isAbsolute(spanish[0][key]), true);
    assert.ok(fs.statSync(spanish[0][key]).isFile());
  }
  assert.equal(spanish[0].source.url, first.url);
  assert.equal(spanish[0].source.pageUrl, first.captures[0].pageUrl);
  assert.equal(spanish[0].source.capturedAt, STAMP);
});

test('search uses names and observations, does not score warning text or read image bytes', t => {
  const f = fixture(t);
  const site = f.catalog.sites[0];
  site.name = 'Unusual Atelier';
  site.captures[0].observed = ['Distinctive diagonal composition'];
  site.captures[0].avoid = ['Never copy zebras'];
  const byName = searchCatalog(f.catalog, 'atelier', { rootDir: f.rootDir });
  assert.equal(byName[0].reasons[0].field, 'name');
  const byObservation = searchCatalog(f.catalog, 'diagonal', { rootDir: f.rootDir });
  assert.equal(byObservation.length, 1);
  assert.equal(byObservation[0].reasons[0].field, 'observed');
  assert.deepEqual(searchCatalog(f.catalog, 'zebras', { rootDir: f.rootDir }), []);
  // Corrupt image bytes are deliberately irrelevant to metadata retrieval; validate handles them separately.
  fs.writeFileSync(path.join(f.rootDir, site.captures[0].file), 'This is not a PNG');
  assert.equal(searchCatalog(f.catalog, 'diagonal', { rootDir: f.rootDir })[0].captureId, site.captures[0].id);
  hasError(f.validate(), 'IMAGE');
});

test('search kind, limit, accents, repeated synonyms and ties behave deterministically', t => {
  const f = fixture(t);
  assert.deepEqual(searchCatalog(f.catalog, 'nohitswhatsoever', { rootDir: f.rootDir }), []);
  assert.equal(searchCatalog(f.catalog, 'minimalista', { rootDir: f.rootDir, limit: 2 }).length, 2);
  const mobile = searchCatalog(f.catalog, 'móvil', { rootDir: f.rootDir, kind: 'mobile' });
  assert.equal(mobile.length, 1);
  assert.equal(mobile[0].kind, 'mobile');
  assert.deepEqual(searchCatalog(f.catalog, 'typography', { rootDir: f.rootDir }), searchCatalog(f.catalog, 'typography tipografía', { rootDir: f.rootDir }));
  assert.deepEqual(searchCatalog(f.catalog, 'typography', { rootDir: f.rootDir }), searchCatalog(f.catalog, 'tipografía typography', { rootDir: f.rootDir }));
  const first = searchCatalog(f.catalog, 'editorial', { rootDir: f.rootDir });
  f.catalog.sites[0].captures.reverse();
  assert.deepEqual(searchCatalog(f.catalog, 'editorial', { rootDir: f.rootDir }), first);
  assert.throws(() => searchCatalog(f.catalog, '', { rootDir: f.rootDir }), /searchable term/);
  assert.throws(() => searchCatalog(f.catalog, 'para la web', { rootDir: f.rootDir }), /stopwords/);
  for (const limit of [0, -1, 1.5, 101, NaN]) assert.throws(() => searchCatalog(f.catalog, 'hero', { rootDir: f.rootDir, limit }), /limit/);
  assert.throws(() => searchCatalog(f.catalog, 'hero', { rootDir: f.rootDir, kind: 'fake' }), /kind/);
});

test('search parser accepts free query text and rejects malformed options', () => {
  assert.deepEqual(parseSearchArgs(['moda', 'de', 'lujo', '--kind', 'hero', '--limit=3']), { query: 'moda de lujo', options: { kind: 'hero', limit: 3 } });
  assert.deepEqual(parseSearchArgs(['--', 'dark', '--literal']), { query: 'dark --literal', options: {} });
  assert.deepEqual(parseSearchArgs(['--help']), { help: true });
  for (const args of [['--wat'], ['-z'], ['--limit'], ['--kind', '--limit', '2'], ['--limit', '2.5'], ['--limit', '2', '--limit', '3']]) assert.throws(() => parseSearchArgs(args));
});

test('search CLI resolves its own installed root from an unrelated working directory', t => {
  const f = fixture(t);
  f.installScripts();
  const output = f.cli('search.mjs', ['tipografía', 'grande', '--kind=hero', '--limit', '1']);
  assert.equal(output.status, 0, output.stderr);
  const parsed = JSON.parse(output.stdout);
  assert.equal(parsed.results.length, 1);
  assert.equal(parsed.results[0].imagePath, path.join(f.rootDir, f.catalog.sites[0].captures[0].file));
  assert.equal(parsed.ranking.synonymMultiplier, 0.85);
  for (const args of [[], ['--limit', '0', 'hero'], ['hero', '--kind=invalid'], ['--limit', 'no', 'hero']]) assert.equal(f.cli('search.mjs', args).status, 2);
  assert.equal(f.cli('search.mjs', ['--help']).status, 0);
  assert.deepEqual(JSON.parse(f.cli('search.mjs', ['nonexistentkeyword']).stdout).results, []);
});

test('index builds relative links without embedding screenshots and writes only its installed library', t => {
  const f = fixture(t);
  f.installScripts();
  const markdown = buildIndex(f.catalog, { rootDir: f.rootDir });
  assert.match(markdown, /Sites: 1\. Captures: 4\./);
  assert.match(markdown, /\[Analysis\]\(sites\/site-1\/analysis\.md\)/);
  assert.match(markdown, /\[hero-1\]\(sites\/site-1\/hero-1\.png\)/);
  assert.doesNotMatch(markdown, /!\[/);
  const outputPath = path.join(f.rootDir, 'references', 'INDEX.md');
  assert.equal(f.cli('index.mjs', ['--stdout']).stdout, markdown);
  assert.equal(fs.existsSync(outputPath), false);
  const output = f.cli('index.mjs');
  assert.equal(output.status, 0, output.stderr);
  assert.equal(output.stdout.trim(), outputPath);
  assert.equal(fs.readFileSync(outputPath, 'utf8'), markdown);
  assert.equal(fs.existsSync(path.join(f.base, 'references', 'INDEX.md')), false);
});

test('index refuses an output junction rather than following it outside the library', t => {
  const f = fixture(t);
  f.installScripts();
  const outside = path.join(f.base, 'outside-index');
  fs.mkdirSync(outside);
  fs.symlinkSync(outside, path.join(f.rootDir, 'references', 'INDEX.md'), process.platform === 'win32' ? 'junction' : 'dir');
  const output = f.cli('index.mjs');
  assert.equal(output.status, 1);
  assert.match(output.stderr, /symbolic link/);
  assert.deepEqual(fs.readdirSync(outside), []);
});

test('tools use only local and Node built-in imports and a root derived from import.meta.url', () => {
  assert.equal(DEFAULT_ROOT, path.resolve(SCRIPT_DIR, '..'));
  for (const name of ['validate.mjs', 'search.mjs', 'index.mjs']) {
    const code = fs.readFileSync(path.join(SCRIPT_DIR, name), 'utf8');
    for (const match of code.matchAll(/from\s+['"]([^'"]+)['"]/g)) assert.match(match[1], /^(node:|\.\/)/);
    assert.doesNotMatch(code, /(?:fetch\s*\(|node:(?:https?|net|tls)|https?\.get\s*\()/);
    assert.doesNotMatch(code, /C:\\Users|C:\/Users/);
  }
});
