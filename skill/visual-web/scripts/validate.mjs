#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';

export const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CAPTURE_KINDS = Object.freeze(['hero', 'editorial', 'product', 'gallery', 'closing', 'navigation', 'interaction', 'mobile']);
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const isId = value => nonempty(value) && /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(value);
const isTimestamp = value => {
  if (!nonempty(value)) return false;
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
  if (!parts) return false;
  const [, year, month, day, hour, minute, second, , zoneHour = '00', zoneMinute = '00'] = parts;
  const lastDay = new Date(`${year}-${month}-01T00:00:00Z`);
  lastDay.setUTCMonth(lastDay.getUTCMonth() + 1, 0);
  return +month >= 1 && +month <= 12 && +day >= 1 && +day <= lastDay.getUTCDate() && +hour < 24 && +minute < 60 && +second < 60 && +zoneHour < 24 && +zoneMinute < 60 && Number.isFinite(Date.parse(value));
};
const isUrl = value => {
  if (!nonempty(value) || !/^https?:\/\//i.test(value) || /\s/.test(value)) return false;
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password; }
  catch { return false; }
};
const inside = (root, target) => {
  const relative = path.relative(root, target);
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
};

/** Resolve a regular file without permitting traversal or symlink escape. */
export function resolveLibraryPath(rootDir, relativePath) {
  if (!nonempty(relativePath) || relativePath.includes('\\') || relativePath.includes('\0') || relativePath.includes(':') || path.isAbsolute(relativePath) || path.win32.isAbsolute(relativePath) || relativePath.split('/').some(part => ['', '.', '..'].includes(part))) {
    throw new Error('Expected a canonical, relative library path using forward slashes');
  }
  const root = fs.realpathSync(rootDir);
  const target = path.resolve(root, relativePath);
  if (!inside(root, target)) throw new Error('Path escapes the library root');
  const realTarget = fs.realpathSync(target);
  if (!inside(root, realTarget)) throw new Error('Symlink escapes the library root');
  if (!fs.statSync(realTarget).isFile()) throw new Error('Path is not a regular file');
  return realTarget;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, number) => {
  let crc = number;
  for (let bit = 0; bit < 8; bit++) crc = (crc & 1) ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  return crc >>> 0;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function validateScanlines(compressed, { width, height, bitDepth, colorType, interlace }) {
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  const passes = interlace ? [[0, 0, 8, 8], [4, 0, 8, 8], [0, 4, 4, 8], [2, 0, 4, 4], [0, 2, 2, 4], [1, 0, 2, 2], [0, 1, 1, 2]] : [[0, 0, 1, 1]];
  const rows = passes.map(([startX, startY, stepX, stepY]) => {
    const passWidth = Math.max(0, Math.ceil((width - startX) / stepX));
    const passHeight = Math.max(0, Math.ceil((height - startY) / stepY));
    return { count: passWidth ? passHeight : 0, bytes: Math.ceil(passWidth * channels * bitDepth / 8) + 1 };
  });
  const expectedLength = rows.reduce((total, row) => total + row.count * row.bytes, 0);
  if (!Number.isSafeInteger(expectedLength) || expectedLength > 256 * 1024 * 1024) throw new Error('PNG raster exceeds the safe 256 MiB viewport limit');
  const inflated = inflateSync(Buffer.concat(compressed), { maxOutputLength: expectedLength });
  if (inflated.length !== expectedLength) throw new Error('PNG scanline data length differs from IHDR');
  let offset = 0;
  for (const row of rows) for (let index = 0; index < row.count; index++) {
    if (inflated[offset] > 4) throw new Error('Invalid PNG scanline filter');
    offset += row.bytes;
  }
}

/** Inspect actual PNG bytes, including chunk boundaries and CRCs. */
export function inspectPng(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 45 || !bytes.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error('Invalid PNG signature or truncated PNG');
  let offset = 8;
  let dimensions;
  let hasData = false;
  let sawIdat = false;
  let dataEnded = false;
  let hasPalette = false;
  const compressed = [];
  while (offset < bytes.length) {
    if (bytes.length - offset < 12) throw new Error('Truncated PNG chunk');
    const length = bytes.readUInt32BE(offset);
    const end = offset + length + 12;
    if (end > bytes.length) throw new Error('PNG chunk exceeds the file length');
    const type = bytes.toString('latin1', offset + 4, offset + 8);
    if (!/^[A-Za-z]{2}[A-Z][A-Za-z]$/.test(type)) throw new Error('Invalid PNG chunk type or reserved bit');
    if (crc32(bytes.subarray(offset + 4, end - 4)) !== bytes.readUInt32BE(end - 4)) throw new Error(`Invalid PNG CRC in ${type}`);
    if (!dimensions && type !== 'IHDR') throw new Error('PNG must start with IHDR');
    if (type === 'IHDR') {
      if (dimensions || length !== 13) throw new Error('Invalid or repeated PNG IHDR');
      const width = bytes.readUInt32BE(offset + 8);
      const height = bytes.readUInt32BE(offset + 12);
      const bitDepth = bytes[offset + 16];
      const colorType = bytes[offset + 17];
      const depths = { 0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16] };
      if (!width || !height || width > 0x7fffffff || height > 0x7fffffff || !depths[colorType]?.includes(bitDepth) || bytes[offset + 18] !== 0 || bytes[offset + 19] !== 0 || bytes[offset + 20] > 1) throw new Error('Invalid PNG IHDR dimensions or encoding');
      dimensions = { width, height, bitDepth, colorType, interlace: bytes[offset + 20] };
    } else if (type === 'PLTE') {
      if (hasPalette || sawIdat || [0, 4].includes(dimensions.colorType) || length === 0 || length % 3 !== 0 || length > 768 || (dimensions.colorType === 3 && length / 3 > 2 ** dimensions.bitDepth)) throw new Error('Invalid PNG palette');
      hasPalette = true;
    } else if (type === 'IDAT') {
      if (dataEnded || (dimensions.colorType === 3 && !hasPalette)) throw new Error('Invalid PNG image data order');
      sawIdat = true;
      hasData ||= length > 0;
      compressed.push(bytes.subarray(offset + 8, end - 4));
    } else if (type === 'IEND') {
      if (length !== 0 || !hasData || end !== bytes.length) throw new Error('Invalid PNG ending or missing image data');
      validateScanlines(compressed, dimensions);
      return { width: dimensions.width, height: dimensions.height };
    } else {
      if (type[0] === type[0].toUpperCase()) throw new Error(`Unsupported critical PNG chunk ${type}`);
      if (sawIdat) dataEnded = true;
    }
    offset = end;
  }
  throw new Error('PNG is missing IEND');
}

const SOF_MARKERS = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

/** Validate JPEG framing and scan boundaries, then read dimensions from SOF (no image conversion). */
export function inspectJpeg(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('Invalid JPEG SOI signature');
  let offset = 2;
  let dimensions;
  let componentIds;
  let scanCount = 0;
  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) throw new Error('JPEG marker prefix is missing');
    while (bytes[offset] === 0xff) offset++;
    if (offset >= bytes.length) throw new Error('Truncated JPEG marker');
    const marker = bytes[offset++];
    if (marker === 0xd9) {
      if (!dimensions || !scanCount || offset !== bytes.length) throw new Error('Invalid JPEG ending, missing scan or trailing bytes');
      return dimensions;
    }
    if (marker === 0x00 || marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7)) throw new Error('Unexpected standalone JPEG marker');
    if (marker === 0x01) continue;
    if (marker < 0xc0 || offset + 2 > bytes.length) throw new Error('Invalid or truncated JPEG segment');
    const length = bytes.readUInt16BE(offset);
    const start = offset + 2;
    const end = offset + length;
    if (length < 2 || end > bytes.length) throw new Error('JPEG segment exceeds the file length');
    if (SOF_MARKERS.has(marker)) {
      if (dimensions || length < 11) throw new Error('Invalid or repeated JPEG SOF');
      const precision = bytes[start];
      const height = bytes.readUInt16BE(start + 1);
      const width = bytes.readUInt16BE(start + 3);
      const components = bytes[start + 5];
      if (!width || !height || components < 1 || components > 4 || length !== 8 + 3 * components || precision < 2 || precision > 16 || (marker === 0xc0 && precision !== 8)) throw new Error('Invalid JPEG SOF dimensions or components');
      componentIds = new Set();
      for (let index = 0; index < components; index++) {
        const id = bytes[start + 6 + index * 3];
        const sampling = bytes[start + 7 + index * 3];
        const table = bytes[start + 8 + index * 3];
        if (componentIds.has(id) || (sampling >>> 4) < 1 || (sampling >>> 4) > 4 || (sampling & 15) < 1 || (sampling & 15) > 4 || table > 3) throw new Error('Invalid JPEG frame component');
        componentIds.add(id);
      }
      dimensions = { width, height };
    } else if (marker === 0xdb) {
      let cursor = start;
      while (cursor < end) {
        const table = bytes[cursor++];
        if ((table >>> 4) > 1 || (table & 15) > 3) throw new Error('Invalid JPEG quantization table');
        cursor += 64 * ((table >>> 4) + 1);
      }
      if (cursor !== end || cursor === start) throw new Error('Truncated JPEG quantization table');
    } else if (marker === 0xc4) {
      let cursor = start;
      while (cursor < end) {
        const table = bytes[cursor++];
        if ((table >>> 4) > 1 || (table & 15) > 3 || cursor + 16 > end) throw new Error('Invalid JPEG Huffman table');
        let symbols = 0;
        for (let index = 0; index < 16; index++) symbols += bytes[cursor++];
        if (symbols === 0 || symbols > 256) throw new Error('Invalid JPEG Huffman symbol count');
        cursor += symbols;
      }
      if (cursor !== end || cursor === start) throw new Error('Truncated JPEG Huffman table');
    } else if (marker === 0xdd && length !== 4) throw new Error('Invalid JPEG restart interval');
    offset = end;
    if (marker === 0xda) {
      if (!dimensions || length < 6) throw new Error('JPEG scan precedes its frame header');
      const components = bytes[start];
      if (!components || components > componentIds.size || length !== 6 + 2 * components) throw new Error('Invalid JPEG scan component count');
      const scanIds = new Set();
      for (let index = 0; index < components; index++) {
        const id = bytes[start + 1 + index * 2];
        const table = bytes[start + 2 + index * 2];
        if (!componentIds.has(id) || scanIds.has(id) || (table >>> 4) > 3 || (table & 15) > 3) throw new Error('Invalid JPEG scan component');
        scanIds.add(id);
      }
      if (bytes[end - 3] > 63 || bytes[end - 2] > 63 || (bytes[end - 1] >>> 4) > 13 || (bytes[end - 1] & 15) > 13) throw new Error('Invalid JPEG scan parameters');
      let dataBytes = 0;
      while (offset < bytes.length) {
        if (bytes[offset] !== 0xff) { offset++; dataBytes++; continue; }
        const markerStart = offset++;
        while (bytes[offset] === 0xff) offset++;
        if (offset >= bytes.length) throw new Error('Truncated JPEG entropy marker');
        const next = bytes[offset];
        if (next === 0x00) { offset++; dataBytes++; continue; }
        if (next >= 0xd0 && next <= 0xd7) { offset++; continue; }
        offset = markerStart;
        break;
      }
      if (!dataBytes) throw new Error('JPEG scan has no entropy data');
      scanCount++;
    }
  }
  throw new Error('JPEG is missing EOI');
}

export function inspectImage(bytes) {
  if (Buffer.isBuffer(bytes) && bytes.subarray(0, 8).equals(PNG_SIGNATURE)) return { format: 'png', ...inspectPng(bytes) };
  if (Buffer.isBuffer(bytes) && bytes[0] === 0xff && bytes[1] === 0xd8) return { format: 'jpeg', ...inspectJpeg(bytes) };
  throw new Error('Expected original PNG or JPEG bytes; extension alone does not identify the format');
}

export function readCatalog(rootDir = DEFAULT_ROOT) {
  return JSON.parse(fs.readFileSync(resolveLibraryPath(rootDir, 'references/catalog.json'), 'utf8').replace(/^\uFEFF/, ''));
}

/** Minimums may be lowered for small test fixtures; the CLI always uses real-library minimums. */
export function validateCatalog(catalog, { rootDir = DEFAULT_ROOT, minSites = 12, minCapturesPerSite = 4, requireMobile = true, sourceDocuments } = {}) {
  for (const [name, value] of Object.entries({ minSites, minCapturesPerSite })) if (!Number.isSafeInteger(value) || value < 1) throw new RangeError(`${name} must be a positive integer`);
  if (typeof requireMobile !== 'boolean') throw new TypeError('requireMobile must be boolean');
  if (sourceDocuments !== undefined && !(sourceDocuments instanceof Map)) throw new TypeError('sourceDocuments must be a Map when provided');
  const errors = [];
  const warnings = [];
  const stats = { sites: 0, captures: 0, mobileCaptures: 0, uniqueImages: 0 };
  const add = (code, at, message) => errors.push({ code, path: at, message });
  const check = (condition, code, at, message) => { if (!condition) add(code, at, message); return condition; };
  const result = () => ({ valid: errors.length === 0, errors, warnings, stats });
  try { if (!fs.statSync(rootDir).isDirectory()) throw new Error('Not a directory'); }
  catch (error) { add('ROOT', 'rootDir', error.message); return result(); }
  if (!check(isRecord(catalog), 'SHAPE', '$', 'Catalog must be an object')) return result();
  check(catalog.schemaVersion === 1, 'SCHEMA_VERSION', 'schemaVersion', 'Expected schemaVersion 1');
  check(isTimestamp(catalog.capturedAt), 'TIMESTAMP', 'capturedAt', 'Expected an ISO timestamp with timezone');
  if (!check(Array.isArray(catalog.sites), 'SHAPE', 'sites', 'Expected sites array')) return result();
  stats.sites = catalog.sites.length;
  check(stats.sites >= minSites, 'MIN_SITES', 'sites', `Expected at least ${minSites} sites, found ${stats.sites}`);
  const siteIds = new Set();
  const hashes = new Map();
  const filePaths = new Set();
  const stringArray = (value, at) => check(Array.isArray(value) && value.length > 0 && value.every(nonempty), 'STRING_ARRAY', at, 'Expected a nonempty array of nonempty strings');
  const file = (value, at, code = 'FILE') => {
    try { return resolveLibraryPath(rootDir, value); }
    catch (error) { add(code, at, error.message); return null; }
  };
  catalog.sites.forEach((site, siteIndex) => {
    const at = `sites[${siteIndex}]`;
    if (!check(isRecord(site), 'SHAPE', at, 'Site must be an object')) return;
    const validId = check(isId(site.id), 'ID', `${at}.id`, 'Expected a nonempty portable ID');
    check(!siteIds.has(site.id), 'DUPLICATE_SITE', `${at}.id`, `Duplicate site ID: ${site.id}`);
    siteIds.add(site.id);
    check(nonempty(site.name), 'TEXT', `${at}.name`, 'Expected site name');
    check(isUrl(site.url), 'URL', `${at}.url`, 'Expected an HTTP(S) source URL without credentials');
    check(isTimestamp(site.capturedAt), 'TIMESTAMP', `${at}.capturedAt`, 'Expected an ISO timestamp with timezone');
    check(nonempty(site.summary), 'TEXT', `${at}.summary`, 'Expected site summary');
    stringArray(site.tags, `${at}.tags`);
    stringArray(site.industries, `${at}.industries`);
    if (validId) check(site.analysis === `references/sites/${site.id}/analysis.md`, 'ANALYSIS_PATH', `${at}.analysis`, 'analysis must identify this site’s analysis.md');
    const analysisPath = file(site.analysis, `${at}.analysis`, 'ANALYSIS_FILE');
    if (analysisPath) {
      try { check(nonempty(fs.readFileSync(analysisPath, 'utf8')), 'ANALYSIS_EMPTY', `${at}.analysis`, 'analysis.md must not be empty'); }
      catch (error) { add('ANALYSIS_FILE', `${at}.analysis`, error.message); }
    }
    let source;
    if (validId) {
      const sourcePath = file(`references/sites/${site.id}/source.json`, `${at}.source`, 'SOURCE_FILE');
      if (sourcePath) {
        try { source = sourceDocuments?.get(site.id) ?? JSON.parse(fs.readFileSync(sourcePath, 'utf8').replace(/^\uFEFF/, '')); }
        catch (error) { add('SOURCE_JSON', `${at}.source`, error.message); }
        if (sourceDocuments && !sourceDocuments.has(site.id)) add('SOURCE_JSON', `${at}.source`, 'sourceDocuments is missing this site ID');
        if (source !== undefined && check(isRecord(source), 'SOURCE_SHAPE', `${at}.source`, 'source.json must be an object')) {
          check(source.id === site.id, 'SOURCE_ID', `${at}.source.id`, 'Source ID differs from catalog');
          check(source.name === site.name, 'SOURCE_NAME', `${at}.source.name`, 'Source name differs from catalog');
          check(source.url === site.url && isUrl(source.url), 'SOURCE_URL', `${at}.source.url`, 'Source URL differs from catalog or is invalid');
          check(source.capturedAt === site.capturedAt, 'SOURCE_TIMESTAMP', `${at}.source.capturedAt`, 'Source timestamp differs from catalog');
          check(Array.isArray(source.captures), 'SOURCE_CAPTURES', `${at}.source.captures`, 'Expected source captures array');
        }
      }
    }
    if (!check(Array.isArray(site.captures), 'SHAPE', `${at}.captures`, 'Expected captures array')) return;
    check(site.captures.length >= minCapturesPerSite, 'MIN_CAPTURES', `${at}.captures`, `Expected at least ${minCapturesPerSite} captures, found ${site.captures.length}`);
    if (requireMobile) check(site.captures.some(capture => capture?.kind === 'mobile'), 'MOBILE_MISSING', `${at}.captures`, 'Expected at least one mobile capture');
    const captureIds = new Set();
    const sourceCaptures = new Map();
    if (isRecord(source) && Array.isArray(source.captures)) {
      source.captures.forEach((capture, index) => {
        const sourceAt = `${at}.source.captures[${index}]`;
        if (!check(isRecord(capture) && isId(capture.id), 'SOURCE_CAPTURE', sourceAt, 'Expected source capture with a portable ID')) return;
        check(!sourceCaptures.has(capture.id), 'SOURCE_DUPLICATE_CAPTURE', `${sourceAt}.id`, 'Duplicate capture in source.json');
        sourceCaptures.set(capture.id, capture);
      });
      check(source.captures.length === site.captures.length, 'SOURCE_COUNT', `${at}.source.captures`, 'Source and catalog capture counts differ');
    }
    site.captures.forEach((capture, captureIndex) => {
      const captureAt = `${at}.captures[${captureIndex}]`;
      stats.captures++;
      if (!check(isRecord(capture), 'SHAPE', captureAt, 'Capture must be an object')) return;
      check(isId(capture.id), 'ID', `${captureAt}.id`, 'Expected a nonempty portable ID');
      check(!captureIds.has(capture.id), 'DUPLICATE_CAPTURE', `${captureAt}.id`, 'Duplicate capture ID within site');
      captureIds.add(capture.id);
      check(CAPTURE_KINDS.includes(capture.kind), 'KIND', `${captureAt}.kind`, `Expected one of ${CAPTURE_KINDS.join(', ')}`);
      if (capture.kind === 'mobile') stats.mobileCaptures++;
      check(isUrl(capture.pageUrl), 'URL', `${captureAt}.pageUrl`, 'Expected an HTTP(S) page URL without credentials');
      check(isTimestamp(capture.capturedAt), 'TIMESTAMP', `${captureAt}.capturedAt`, 'Expected an ISO timestamp with timezone');
      check(Number.isFinite(capture.scrollY) && capture.scrollY >= 0, 'SCROLL', `${captureAt}.scrollY`, 'Expected a nonnegative scroll offset');
      check(nonempty(capture.sectionLabel), 'TEXT', `${captureAt}.sectionLabel`, 'Expected section label');
      for (const field of ['observed', 'adaptation', 'avoid']) stringArray(capture[field], `${captureAt}.${field}`);
      if (capture.motion !== undefined) check(isRecord(capture.motion) && ['observed', 'not-tested'].includes(capture.motion.status) && nonempty(capture.motion.description), 'MOTION', `${captureAt}.motion`, 'Expected motion status observed/not-tested and description');
      const validViewport = check(isRecord(capture.viewport) && ['width', 'height'].every(key => Number.isSafeInteger(capture.viewport[key]) && capture.viewport[key] > 0), 'VIEWPORT', `${captureAt}.viewport`, 'Expected positive integer viewport width and height');
      const validImageDimensions = check(isRecord(capture.imageDimensions) && ['width', 'height'].every(key => Number.isSafeInteger(capture.imageDimensions[key]) && capture.imageDimensions[key] > 0), 'IMAGE_DIMENSIONS_SHAPE', `${captureAt}.imageDimensions`, 'Expected positive integer imageDimensions width and height measured from original bytes');
      if (validViewport && validImageDimensions && (capture.viewport.width !== capture.imageDimensions.width || capture.viewport.height !== capture.imageDimensions.height)) warnings.push({ code: 'IMAGE_VIEWPORT_DIFFERENCE', path: captureAt, message: `Browser viewport ${capture.viewport.width}×${capture.viewport.height} differs from original image ${capture.imageDimensions.width}×${capture.imageDimensions.height}; both measurements are preserved without inferring DPR` });
      const extension = typeof capture.file === 'string' ? path.extname(capture.file).toLowerCase() : '';
      check(['.png', '.jpg', '.jpeg'].includes(extension), 'IMAGE_EXTENSION', `${captureAt}.file`, 'Capture file must end with .png, .jpg or .jpeg');
      const imagePath = file(capture.file, `${captureAt}.file`);
      if (imagePath) {
        check(!filePaths.has(imagePath), 'DUPLICATE_PATH', `${captureAt}.file`, 'Capture path is already used');
        filePaths.add(imagePath);
        try {
          const bytes = fs.readFileSync(imagePath);
          const digest = createHash('sha256').update(bytes).digest('hex');
          check(!hashes.has(digest), 'DUPLICATE_IMAGE', `${captureAt}.file`, `Image bytes duplicate ${hashes.get(digest) ?? ''}`);
          if (!hashes.has(digest)) hashes.set(digest, capture.file);
          const actual = inspectImage(bytes);
          check(actual.format === (extension === '.png' ? 'png' : ['.jpg', '.jpeg'].includes(extension) ? 'jpeg' : null), 'IMAGE_EXTENSION_MISMATCH', `${captureAt}.file`, `Actual ${actual.format.toUpperCase()} bytes do not match the ${extension || '(missing)'} extension`);
          if (validImageDimensions) check(actual.width === capture.imageDimensions.width && actual.height === capture.imageDimensions.height, 'IMAGE_DIMENSIONS', `${captureAt}.imageDimensions`, `${actual.format.toUpperCase()} is ${actual.width}×${actual.height}; recorded imageDimensions are ${capture.imageDimensions.width}×${capture.imageDimensions.height}`);
        } catch (error) { add('IMAGE', `${captureAt}.file`, error.message); }
      }
      if (isRecord(source) && Array.isArray(source.captures)) {
        const original = sourceCaptures.get(capture.id);
        if (check(Boolean(original), 'SOURCE_CAPTURE_MISSING', captureAt, 'Capture ID is absent from source.json')) {
          for (const field of ['file', 'kind', 'pageUrl', 'capturedAt', 'scrollY', 'sectionLabel']) check(original[field] === capture[field], 'SOURCE_MISMATCH', `${captureAt}.${field}`, `${field} differs from source.json`);
          check(isRecord(original.viewport) && original.viewport.width === capture.viewport?.width && original.viewport.height === capture.viewport?.height, 'SOURCE_MISMATCH', `${captureAt}.viewport`, 'viewport differs from source.json');
          check(isRecord(original.imageDimensions) && original.imageDimensions.width === capture.imageDimensions?.width && original.imageDimensions.height === capture.imageDimensions?.height, 'SOURCE_MISMATCH', `${captureAt}.imageDimensions`, 'imageDimensions differs from source.json');
        }
      }
    });
  });
  stats.uniqueImages = hashes.size;
  return result();
}

export function isMain(metaUrl) {
  return typeof process !== 'undefined' && Boolean(process.argv?.[1]) && metaUrl === pathToFileURL(path.resolve(process.argv[1])).href;
}

if (isMain(import.meta.url)) {
  if (process.argv.slice(2).some(argument => !['--help', '-h'].includes(argument))) {
    console.error('Usage: node scripts/validate.mjs [--help]\nValidates references/catalog.json relative to the installed skill. Minimums: 12 sites, 4 captures/site, including mobile.');
    process.exitCode = 2;
  } else if (process.argv.length > 2) {
    console.log('Usage: node scripts/validate.mjs\nChecks catalog, source manifests, analysis files, path containment, original PNG/JPEG files, matching extensions, duplicates and measured imageDimensions. The reported browser viewport is preserved separately; differences are warnings.');
  } else {
    try {
      const result = validateCatalog(readCatalog());
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = result.valid ? 0 : 1;
    } catch (error) {
      console.error(JSON.stringify({ valid: false, errors: [{ code: 'CATALOG', path: 'references/catalog.json', message: error.message }] }, null, 2));
      process.exitCode = 1;
    }
  }
}
