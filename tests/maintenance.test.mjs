import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { rebuildCatalog } from '../scripts/rebuild-catalog.mjs';
import { validateCatalog } from '../skill/visual-web/scripts/validate.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const STAMP = '2026-08-31T12:00:00.000Z';
const CAPTURE_STAMP = '2026-08-31T12:01:02.345Z';
const JPEG = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAFAAMDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD8+qKKK+oPnD//2Q==', 'base64');

function temporary(t, prefix = 'visual-web-maintenance-') {
  const tempRoot = fs.realpathSync(os.tmpdir());
  const base = fs.mkdtempSync(path.join(tempRoot, prefix));
  t.after(() => {
    const resolved = path.resolve(base);
    assert.equal(path.dirname(resolved), tempRoot);
    assert.ok(path.basename(resolved).startsWith(prefix));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  return base;
}

function library(t) {
  const base = temporary(t);
  const skillRoot = path.join(base, 'skill');
  const directory = path.join(skillRoot, 'references', 'sites', 'sample');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'capture.jpg'), JPEG);
  const source = {
    id: 'sample', name: 'Sample Site', url: 'https://example.com/sample', capturedAt: STAMP,
    captures: [{ id: 'hero-mobile', file: 'references/sites/sample/capture.jpg', kind: 'mobile', viewport: { width: 390, height: 844 }, pageUrl: 'https://example.com/sample', capturedAt: CAPTURE_STAMP, scrollY: 0, sectionLabel: 'Real mobile viewport' }],
  };
  const analysis = {
    id: 'sample', tags: ['editorial', 'minimalist'], industries: ['culture'], summary: 'A concise factual fixture.',
    captures: [{ id: 'hero-mobile', observed: ['Centered serif title'], adaptation: ['Preserve the quiet hierarchy'], avoid: ['Do not reproduce the source identity'], motion: { status: 'not-tested', description: 'Static fixture.' } }],
  };
  const sourcePath = path.join(directory, 'source.json');
  const analysisPath = path.join(directory, 'analysis.json');
  fs.writeFileSync(sourcePath, JSON.stringify(source, null, 2));
  fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
  fs.writeFileSync(path.join(directory, 'analysis.md'), '# Sample analysis\n\nAll fixture captures were inspected.\n');
  return { base, skillRoot, directory, source, analysis, sourcePath, analysisPath };
}

test('rebuild check measures bytes, merges by capture ID and remains read-only', t => {
  const f = library(t);
  const before = fs.readFileSync(f.sourcePath, 'utf8');
  const result = rebuildCatalog({ skillRoot: f.skillRoot, write: false });
  assert.equal(result.written, false);
  assert.equal(result.siteCount, 1);
  assert.equal(result.captureCount, 1);
  assert.equal(result.catalog.capturedAt, CAPTURE_STAMP);
  const capture = result.catalog.sites[0].captures[0];
  assert.deepEqual(capture.viewport, { width: 390, height: 844 });
  assert.deepEqual(capture.imageDimensions, { width: 3, height: 5 });
  assert.deepEqual(capture.observed, f.analysis.captures[0].observed);
  assert.equal(result.validation.valid, true);
  assert.equal(result.validation.warnings[0].code, 'IMAGE_VIEWPORT_DIFFERENCE');
  assert.equal(fs.readFileSync(f.sourcePath, 'utf8'), before);
  assert.equal(fs.existsSync(path.join(f.skillRoot, 'references', 'catalog.json')), false);
  assert.equal(fs.existsSync(path.join(f.skillRoot, 'references', 'INDEX.md')), false);
});

test('rebuild writes measured sources, validated catalog and text-only index', t => {
  const f = library(t);
  const result = rebuildCatalog({ skillRoot: f.skillRoot });
  assert.equal(result.written, true);
  const source = JSON.parse(fs.readFileSync(f.sourcePath, 'utf8'));
  const catalogPath = path.join(f.skillRoot, 'references', 'catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const index = fs.readFileSync(path.join(f.skillRoot, 'references', 'INDEX.md'), 'utf8');
  assert.deepEqual(source.captures[0].imageDimensions, { width: 3, height: 5 });
  assert.deepEqual(catalog, result.catalog);
  assert.equal(validateCatalog(catalog, { rootDir: f.skillRoot, minSites: 1, minCapturesPerSite: 1, requireMobile: false }).valid, true);
  assert.match(index, /Browser viewport \| Original image/);
  assert.match(index, /390 × 844 \| 3 × 5/);
  assert.doesNotMatch(index, /!\[/);
  assert.deepEqual(fs.readdirSync(f.directory).filter(file => file.endsWith('.tmp')), []);
  const repeated = rebuildCatalog({ skillRoot: f.skillRoot });
  assert.equal(repeated.validation.valid, true);
  assert.deepEqual(JSON.parse(fs.readFileSync(catalogPath, 'utf8')), result.catalog);
});

test('rebuild joins analysis by ID instead of array order', t => {
  const f = library(t);
  const original = f.source.captures[0];
  const second = { ...original, id: 'closing', file: 'references/sites/sample/closing.jpg', kind: 'closing', sectionLabel: 'Closing', capturedAt: '2026-08-31T12:02:00.000Z', scrollY: 800 };
  fs.writeFileSync(path.join(f.directory, 'closing.jpg'), Buffer.from(JPEG.map((byte, index) => index === JPEG.length - 4 ? byte ^ 1 : byte)));
  f.source.captures.push(second);
  f.analysis.captures.unshift({ id: 'closing', observed: ['Footer'], adaptation: ['Adapt footer'], avoid: ['Avoid marks'] });
  fs.writeFileSync(f.sourcePath, JSON.stringify(f.source));
  fs.writeFileSync(f.analysisPath, JSON.stringify(f.analysis));
  const result = rebuildCatalog({ skillRoot: f.skillRoot, write: false });
  assert.deepEqual(result.catalog.sites[0].captures.map(capture => capture.id), ['hero-mobile', 'closing']);
  assert.deepEqual(result.catalog.sites[0].captures.map(capture => capture.observed[0]), ['Centered serif title', 'Footer']);
});

test('rebuild rejects missing, foreign and duplicate analysis IDs without writing', async t => {
  const cases = [
    ['missing analysis', f => { f.analysis.captures = []; }, /missing analyses/],
    ['foreign analysis', f => { f.analysis.captures[0].id = 'foreign'; }, /unknown capture id/],
    ['duplicate analysis', f => { f.analysis.captures.push(structuredClone(f.analysis.captures[0])); }, /duplicate capture id/],
    ['wrong site', f => { f.analysis.id = 'wrong'; }, /analysis id must equal/],
  ];
  for (const [name, mutate, expected] of cases) await t.test(name, child => {
    const f = library(child);
    mutate(f);
    fs.writeFileSync(f.analysisPath, JSON.stringify(f.analysis));
    assert.throws(() => rebuildCatalog({ skillRoot: f.skillRoot }), expected);
    assert.equal(JSON.parse(fs.readFileSync(f.sourcePath, 'utf8')).captures[0].imageDimensions, undefined);
    assert.equal(fs.existsSync(path.join(f.skillRoot, 'references', 'catalog.json')), false);
  });
});

test('rebuild rejects duplicate source IDs, missing analysis files and mismatched image extensions', async t => {
  const cases = [
    ['duplicate source capture', f => { f.source.captures.push(structuredClone(f.source.captures[0])); fs.writeFileSync(f.sourcePath, JSON.stringify(f.source)); }, /duplicate capture id/],
    ['foreign source site id', f => { f.source.id = 'foreign'; fs.writeFileSync(f.sourcePath, JSON.stringify(f.source)); }, /source id must equal/],
    ['missing analysis json', f => fs.unlinkSync(f.analysisPath), /analysis\.json/],
    ['missing analysis markdown', f => fs.unlinkSync(path.join(f.directory, 'analysis.md')), /analysis\.md/],
    ['wrong extension', f => { f.source.captures[0].file = 'references/sites/sample/capture.png'; fs.renameSync(path.join(f.directory, 'capture.jpg'), path.join(f.directory, 'capture.png')); fs.writeFileSync(f.sourcePath, JSON.stringify(f.source)); }, /extension does not match/],
  ];
  for (const [name, mutate, expected] of cases) await t.test(name, child => {
    const f = library(child);
    mutate(f);
    assert.throws(() => rebuildCatalog({ skillRoot: f.skillRoot }), expected);
  });
});

function powershell(script, args, codexHome) {
  return spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, ...args], { encoding: 'utf8', timeout: 20000, env: { ...process.env, CODEX_HOME: codexHome } });
}

test('installer copies only the skill, verifies hashes and treats identical destination as a no-op', t => {
  const base = temporary(t, 'visual-web-install-');
  const project = path.join(base, 'project with spaces');
  const source = path.join(project, 'skill', 'visual-web');
  const codexHome = path.join(base, 'codex home with spaces');
  fs.mkdirSync(path.join(source, 'nested'), { recursive: true });
  fs.writeFileSync(path.join(source, 'a.txt'), 'alpha');
  fs.writeFileSync(path.join(source, 'nested', 'b.txt'), 'beta');
  fs.writeFileSync(path.join(project, 'secret.txt'), 'must not install');
  const script = path.join(project, 'install.ps1');
  fs.copyFileSync(path.join(ROOT, 'install.ps1'), script);
  const first = powershell(script, [], codexHome);
  assert.equal(first.status, 0, first.stderr);
  const destination = path.join(codexHome, 'skills', 'visual-web');
  const updatesRoot = path.join(codexHome, 'skill-backups', 'visual-web');
  assert.equal(fs.readFileSync(path.join(destination, 'a.txt'), 'utf8'), 'alpha');
  assert.equal(fs.readFileSync(path.join(destination, 'nested', 'b.txt'), 'utf8'), 'beta');
  assert.equal(fs.existsSync(path.join(destination, 'secret.txt')), false);
  assert.deepEqual(fs.readdirSync(path.join(codexHome, 'skills')), ['visual-web']);
  const updatesBeforeNoOp = fs.readdirSync(updatesRoot);
  const before = fs.statSync(path.join(destination, 'a.txt')).mtimeMs;
  const second = powershell(script, [], codexHome);
  assert.equal(second.status, 0, second.stderr);
  assert.match(second.stdout, /Already installed and hash-verified/);
  assert.equal(fs.statSync(path.join(destination, 'a.txt')).mtimeMs, before);
  assert.deepEqual(fs.readdirSync(updatesRoot), updatesBeforeNoOp);
});

test('installer preserves a differing destination unless Force creates a verified backup', t => {
  const base = temporary(t, 'visual-web-install-');
  const project = path.join(base, 'project with spaces');
  const source = path.join(project, 'skill', 'visual-web');
  const codexHome = path.join(base, 'codex home with spaces');
  fs.mkdirSync(source, { recursive: true });
  fs.writeFileSync(path.join(source, 'version.txt'), 'version one');
  const script = path.join(project, 'install.ps1');
  fs.copyFileSync(path.join(ROOT, 'install.ps1'), script);
  assert.equal(powershell(script, [], codexHome).status, 0);
  const destination = path.join(codexHome, 'skills', 'visual-web');
  fs.writeFileSync(path.join(source, 'version.txt'), 'version two');
  const refused = powershell(script, [], codexHome);
  assert.notEqual(refused.status, 0, `stdout=${refused.stdout}\nstderr=${refused.stderr}`);
  assert.match(refused.stderr, /Existing files were preserved/);
  assert.equal(fs.readFileSync(path.join(destination, 'version.txt'), 'utf8'), 'version one');
  assert.deepEqual(fs.readdirSync(path.join(codexHome, 'skills')), ['visual-web']);
  const forced = powershell(script, ['-Force'], codexHome);
  assert.equal(forced.status, 0, forced.stderr);
  assert.match(forced.stdout, /Installed and hash-verified/);
  assert.equal(fs.readFileSync(path.join(destination, 'version.txt'), 'utf8'), 'version two');
  assert.deepEqual(fs.readdirSync(path.join(codexHome, 'skills')), ['visual-web']);
  const updatesRoot = path.join(codexHome, 'skill-backups', 'visual-web');
  const previous = fs.readdirSync(updatesRoot).map(name => path.join(updatesRoot, name, 'previous')).filter(directory => fs.existsSync(directory));
  assert.equal(previous.length, 1);
  assert.equal(fs.readFileSync(path.join(previous[0], 'version.txt'), 'utf8'), 'version one');
  assert.equal(path.relative(path.join(codexHome, 'skills'), previous[0]).startsWith('..'), true);
  for (const update of fs.readdirSync(updatesRoot)) {
    assert.equal(fs.existsSync(path.join(updatesRoot, update, 'incoming')), false);
    assert.equal(fs.existsSync(path.join(updatesRoot, update, 'failed')), false);
  }
});

test('installer rejects destination and backup-root junctions before moving directories', async t => {
  for (const target of ['destination', 'backup-root']) await t.test(target, child => {
    const base = temporary(child, 'visual-web-install-');
    const project = path.join(base, 'project with spaces');
    const source = path.join(project, 'skill', 'visual-web');
    const codexHome = path.join(base, 'codex home with spaces');
    const outside = path.join(base, 'outside');
    fs.mkdirSync(source, { recursive: true });
    fs.mkdirSync(path.join(codexHome, 'skills'), { recursive: true });
    fs.mkdirSync(outside);
    fs.writeFileSync(path.join(source, 'version.txt'), 'new version');
    fs.writeFileSync(path.join(outside, 'sentinel.txt'), 'untouched');
    const script = path.join(project, 'install.ps1');
    fs.copyFileSync(path.join(ROOT, 'install.ps1'), script);
    const link = target === 'destination' ? path.join(codexHome, 'skills', 'visual-web') : path.join(codexHome, 'skill-backups');
    fs.symlinkSync(outside, link, process.platform === 'win32' ? 'junction' : 'dir');
    const output = powershell(script, [], codexHome);
    assert.notEqual(output.status, 0);
    assert.match(output.stderr, /symbolic link or junction/);
    assert.deepEqual(fs.readdirSync(outside), ['sentinel.txt']);
    assert.equal(fs.existsSync(path.join(codexHome, 'skills', 'visual-web', 'version.txt')), false);
  });
});

test('maintenance scripts are local, root-resolved and contain no recursive deletion', () => {
  const rebuild = fs.readFileSync(path.join(ROOT, 'scripts', 'rebuild-catalog.mjs'), 'utf8');
  const installer = fs.readFileSync(path.join(ROOT, 'install.ps1'), 'utf8');
  assert.doesNotMatch(rebuild, /(?:fetch\s*\(|node:(?:https?|net|tls))/);
  assert.match(rebuild, /import\.meta\.url/);
  assert.doesNotMatch(rebuild, /C:\\Users|C:\/Users/);
  assert.doesNotMatch(installer, /Remove-Item/i);
  assert.match(installer, /Join-Path \$PSScriptRoot 'skill\\visual-web'/);
  assert.match(installer, /Security\.Cryptography\.SHA256/);
  assert.match(installer, /Previous installation preserved/);
  assert.match(installer, /Join-Path \$codexRoot 'skill-backups'/);
  assert.match(installer, /Assert-RealDirectory \$destination/);
  assert.doesNotMatch(installer, /Join-Path \$skillsRoot ["']visual-web\.(?:backup|failed|install)/i);
});
