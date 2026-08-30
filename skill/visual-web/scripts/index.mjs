#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_ROOT, isMain, readCatalog, resolveLibraryPath } from './validate.mjs';

const escape = value => String(value ?? '').replace(/[\r\n]+/g, ' ').replace(/[\\`*_[\]<>|]/g, '\\$&');
const linkTarget = value => encodeURI(value).replace(/[()]/g, character => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);

/** Build a text-only directory; opening screenshots remains an explicit selection. */
export function buildIndex(catalog, { rootDir = DEFAULT_ROOT } = {}) {
  if (!catalog || catalog.schemaVersion !== 1 || !Array.isArray(catalog.sites)) throw new TypeError('Expected schemaVersion 1 catalog with sites array');
  const target = relative => {
    resolveLibraryPath(rootDir, relative);
    return linkTarget(path.posix.relative('references', relative));
  };
  const lines = ['# Visual reference library', '', `Catalog capture date: ${escape(catalog.capturedAt)}.`, '', 'Real browser captures. Choose references from this index, open the relevant images, then read their analysis. Screenshots are local study material; review rights before any redistribution.', '', `Sites: ${catalog.sites.length}. Captures: ${catalog.sites.reduce((total, site) => total + site.captures.length, 0)}.`, ''];
  for (const site of catalog.sites) {
    const source = new URL(site.url);
    if (!['http:', 'https:'].includes(source.protocol)) throw new TypeError(`Invalid source URL for ${site.id}`);
    lines.push(`## ${escape(site.name)}`, '', `[Original site](${linkTarget(site.url)}) · [Analysis](${target(site.analysis)}) · [Capture manifest](${target(`references/sites/${site.id}/source.json`)})`, '', escape(site.summary), '', `Tags: ${site.tags.map(escape).join(', ')}. Industries: ${site.industries.map(escape).join(', ')}.`, '', '| Capture | Kind | Browser viewport | Original image | What to inspect |', '| --- | --- | --- | --- | --- |');
    for (const capture of [...site.captures].sort((a, b) => a.id.localeCompare(b.id, 'en'))) lines.push(`| [${escape(capture.id)}](${target(capture.file)}) | ${escape(capture.kind)} | ${capture.viewport.width} × ${capture.viewport.height} | ${capture.imageDimensions.width} × ${capture.imageDimensions.height} | ${escape(capture.sectionLabel)} |`);
    lines.push('');
  }
  return `${lines.join('\n').replace(/\n+$/u, '')}\n`;
}

if (isMain(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length && !(args.length === 1 && ['--help', '-h', '--stdout'].includes(args[0]))) {
    console.error('Usage: node scripts/index.mjs [--stdout | --help]');
    process.exitCode = 2;
  } else if (args[0] === '--help' || args[0] === '-h') console.log('Usage: node scripts/index.mjs [--stdout]\nWrites references/INDEX.md relative to the installed skill; --stdout prints without writing.');
  else {
    try {
      const markdown = buildIndex(readCatalog());
      if (args[0] === '--stdout') process.stdout.write(markdown);
      else {
        const referencesDir = fs.realpathSync(path.join(DEFAULT_ROOT, 'references'));
        const root = fs.realpathSync(DEFAULT_ROOT);
        if (path.relative(root, referencesDir) !== 'references') throw new Error('references directory escapes the library root');
        const output = path.join(referencesDir, 'INDEX.md');
        try {
          if (fs.lstatSync(output).isSymbolicLink()) throw new Error('INDEX.md must not be a symbolic link');
          resolveLibraryPath(root, 'references/INDEX.md');
        } catch (error) { if (error.code !== 'ENOENT') throw error; }
        fs.writeFileSync(output, markdown, { encoding: 'utf8', flag: 'w' });
        console.log(output);
      }
    } catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
