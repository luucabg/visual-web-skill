#!/usr/bin/env node
import { CAPTURE_KINDS, DEFAULT_ROOT, isMain, readCatalog, resolveLibraryPath } from './validate.mjs';

export const FIELD_WEIGHTS = Object.freeze({ tags: 12, industries: 10, name: 8, kind: 7, sectionLabel: 6, observed: 5, summary: 4, adaptation: 3 });
const normalize = text => String(text).normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();
const tokenize = text => normalize(text).match(/[a-z0-9]+/g) ?? [];
const STOPWORDS = new Set('a al con de del el en es la las lo los para por que un una unos unas y the and of for in with to an website websites sitio sitios web quiero busco referencia referencias diseno design'.split(' '));
const GROUPS = [
  'oscuro oscura oscuros oscuras dark darkness', 'claro clara claros claras light',
  'lujo lujoso lujosa luxury luxurious premium', 'minimal minimalista minimalistas minimalismo minimalist minimalism',
  'editorial revista magazine', 'moda fashion clothing apparel ropa',
  'tienda tiendas comercio ecommerce commerce shop shopping retail store',
  'tecnologia tecnologico tecnologica technology technological tech', 'software saas',
  'portafolio portfolio portfolios', 'agencia agency agencies estudio studio studios',
  'arquitectura architecture architectural', 'inmobiliario inmobiliaria realestate property',
  'viaje viajes travel tourism turismo', 'hotel hoteles hotels hospitality hospedaje',
  'comida food restaurante restaurant restaurants gastronomia', 'naturaleza natural nature outdoor outdoors',
  'deporte deportes sport sports deportivo sportswear', 'salud health healthcare wellness bienestar',
  'cultura culture cultural', 'arte art arts artistico artistica', 'musica music musical',
  'fotografia fotografico fotografica photography photographic foto photo photos',
  'tipografia tipografico tipografica typography typographic type', 'serifa serif',
  'grande grandes gigante gigantes large big huge giant oversized', 'pequeno pequena small compact',
  'colorido colorida colorful colourful vivid vibrante vibrant',
  'rojo roja red', 'azul blue', 'verde green', 'naranja orange', 'amarillo amarilla yellow',
  'blanco blanca white', 'negro negra black', 'rosa pink', 'morado morada purple violet',
  'heroe portada hero', 'movil moviles mobile responsive', 'producto productos product products',
  'galeria gallery galleries', 'cierre closing footer', 'navegacion navigation menu',
  'interaccion interaction interactive interactivo interactiva', 'animacion animation motion movimiento',
  'video videos film cinematic cinematografico cinematografica', 'rejilla reticula grid',
  'asimetria asimetrico asimetrica asymmetric asymmetrical', 'geometrico geometrica geometric geometry',
  'redondeado redondeada rounded', 'textura textured texture', 'espacio espaciado whitespace spacious space',
  'horizontal horizontal', 'vertical vertical', 'boton botones button buttons',
];
const DICTIONARY = new Map();
for (const group of GROUPS) {
  const words = [...new Set(tokenize(group))];
  for (const word of words) DICTIONARY.set(word, words);
}

function conceptsFor(query) {
  if (typeof query !== 'string' || !query.trim()) throw new TypeError('Query must contain at least one searchable term');
  const concepts = [];
  const seen = new Map();
  for (const term of tokenize(query).filter(token => !STOPWORDS.has(token))) {
    const synonyms = DICTIONARY.get(term) ?? [term];
    const key = [...synonyms].sort().join('|');
    if (!seen.has(key)) {
      const concept = { synonyms, queryTerms: [term] };
      seen.set(key, concept);
      concepts.push(concept);
    } else if (!seen.get(key).queryTerms.includes(term)) seen.get(key).queryTerms.push(term);
  }
  if (!concepts.length) throw new TypeError('Query must contain at least one searchable term besides stopwords');
  for (const concept of concepts) concept.queryTerms.sort();
  return concepts;
}

/** Rank metadata only; no PNG files are loaded. Each query concept scores its strongest matching field once. */
export function searchCatalog(catalog, query, { rootDir = DEFAULT_ROOT, kind, limit = 6 } = {}) {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new RangeError('limit must be an integer from 1 to 100');
  if (kind !== undefined && !CAPTURE_KINDS.includes(kind)) throw new TypeError(`kind must be one of: ${CAPTURE_KINDS.join(', ')}`);
  if (!catalog || catalog.schemaVersion !== 1 || !Array.isArray(catalog.sites)) throw new TypeError('Expected schemaVersion 1 catalog with sites array');
  const concepts = conceptsFor(query);
  const results = [];
  for (const site of catalog.sites) {
    if (!site || !Array.isArray(site.captures)) throw new TypeError('Each site must have a captures array; run validate.mjs');
    for (const capture of site.captures) {
      if (!capture || (kind !== undefined && capture.kind !== kind)) continue;
      const fields = { tags: site.tags, industries: site.industries, name: site.name, kind: capture.kind, sectionLabel: capture.sectionLabel, observed: capture.observed, summary: site.summary, adaptation: capture.adaptation };
      const tokenFields = Object.fromEntries(Object.entries(fields).map(([field, value]) => [field, new Set(tokenize(Array.isArray(value) ? value.join(' ') : value ?? ''))]));
      const reasons = [];
      for (const { queryTerms, synonyms } of concepts) {
        let strongest;
        for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
          const exactTerm = queryTerms.find(term => tokenFields[field].has(term));
          const matchedTerm = exactTerm ?? synonyms.find(synonym => tokenFields[field].has(synonym));
          if (!matchedTerm) continue;
          const via = exactTerm ? 'exact' : 'synonym';
          const contribution = Math.round(weight * (via === 'exact' ? 1 : 0.85) * 100) / 100;
          if (!strongest || contribution > strongest.contribution) strongest = { queryTerm: exactTerm ?? queryTerms[0], matchedTerm, field, via, contribution };
        }
        if (strongest) reasons.push(strongest);
      }
      if (reasons.length) results.push({ site, capture, score: Math.round(reasons.reduce((sum, reason) => sum + reason.contribution, 0) * 100) / 100, matchedConcepts: reasons.length, reasons });
    }
  }
  results.sort((left, right) => right.score - left.score || right.matchedConcepts - left.matchedConcepts || `${left.site.id}/${left.capture.id}`.localeCompare(`${right.site.id}/${right.capture.id}`, 'en'));
  return results.slice(0, limit).map(({ site, capture, score, matchedConcepts, reasons }) => ({
    siteId: site.id, siteName: site.name, captureId: capture.id, kind: capture.kind,
    score, matchedConcepts, reasons,
    source: { url: site.url, pageUrl: capture.pageUrl, capturedAt: capture.capturedAt },
    imagePath: resolveLibraryPath(rootDir, capture.file),
    analysisPath: resolveLibraryPath(rootDir, site.analysis),
    sourcePath: resolveLibraryPath(rootDir, `references/sites/${site.id}/source.json`),
    viewport: capture.viewport, imageDimensions: capture.imageDimensions, sectionLabel: capture.sectionLabel,
    observed: capture.observed, adaptation: capture.adaptation, avoid: capture.avoid,
    ...(capture.motion ? { motion: capture.motion } : {}),
  }));
}

export function parseSearchArgs(args) {
  const words = [];
  const options = {};
  let literal = false;
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (!literal && argument === '--') { literal = true; continue; }
    if (!literal && ['--help', '-h'].includes(argument)) return { help: true };
    if (!literal && argument.startsWith('--')) {
      const [flag, ...inline] = argument.split('=');
      if (!['--kind', '--limit'].includes(flag)) throw new TypeError(`Unknown option: ${flag}`);
      const key = flag.slice(2);
      if (key in options) throw new TypeError(`Repeated option: ${flag}`);
      const value = inline.length ? inline.join('=') : args[++index];
      if (!value || value.startsWith('--')) throw new TypeError(`Missing value for ${flag}`);
      if (key === 'limit' && !/^\d+$/.test(value)) throw new TypeError('--limit must be a positive integer');
      options[key] = key === 'limit' ? Number(value) : value;
    } else if (!literal && argument.startsWith('-')) throw new TypeError(`Unknown option: ${argument}`);
    else words.push(argument);
  }
  return { query: words.join(' '), options };
}

if (isMain(import.meta.url)) {
  const usage = 'Usage: node scripts/search.mjs "tipografía grande editorial" [--kind hero] [--limit 6]\nReturns JSON with transparent metadata scores, source URLs and absolute paths. Does not read image bytes. English and Spanish terms are supported.';
  try {
    const { help, query, options } = parseSearchArgs(process.argv.slice(2));
    if (help) console.log(usage);
    else {
      // Validate arguments before attempting to read the installed library.
      conceptsFor(query);
      if (options.kind !== undefined && !CAPTURE_KINDS.includes(options.kind)) throw new TypeError('Invalid --kind');
      if (options.limit !== undefined && (!Number.isSafeInteger(options.limit) || options.limit < 1 || options.limit > 100)) throw new RangeError('--limit must be from 1 to 100');
      const results = searchCatalog(readCatalog(), query, options);
      console.log(JSON.stringify({ query, kind: options.kind ?? null, limit: options.limit ?? 6, ranking: { weights: FIELD_WEIGHTS, synonymMultiplier: 0.85, formula: 'Sum of the strongest matching field per distinct query concept. Warning/avoid text is not scored.' }, results }, null, 2));
    }
  } catch (error) {
    console.error(`${error.message}\n${usage}`);
    process.exitCode = error instanceof TypeError || error instanceof RangeError ? 2 : 1;
  }
}
