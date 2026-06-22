#!/usr/bin/env node
/**
 * Legacy import guard — multi-line aware.
 *
 * Vieta gli import DIRETTI di `Text`/`Image` da 'react-native' fuori
 * dall'allowlist: nell'app vanno usati `PerfectText`/`PerfectImage`.
 *
 * Sostituisce il vecchio check `grep -E` single-line del workflow legacy-guard:
 * grep è line-oriented, quindi NON catturava gli import MULTI-LINEA da
 * react-native (bypass reale). Questo parser legge l'intero blocco import e
 * funziona indipendentemente dal numero di righe.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');

// File legittimamente esentati:
// - PerfectText/PerfectImage: DEFINISCONO il wrapper su Text/Image.
// - __tests__: i test possono importare i primitivi react-native diretti.
// - ErrorBoundary: class component, UI di fallback last-resort che NON deve
//   dipendere dal Perfect/theme system (che potrebbe essere proprio ciò che è
//   rotto quando l'ErrorBoundary scatta) → allowlist permanente.
// - OTAUpdateScreen: esenzione TEMPORANEA. TODO: migrare Text → PerfectText
//   (refactor UI da validare visivamente, tracciato in improvements-proposed).
const ALLOWLIST = new Set([
  'src/components/ui/PerfectText.tsx',
  'src/components/ui/PerfectImage.tsx',
  'src/shared/components/ErrorBoundary.tsx',
  'src/shared/OTAUpdateScreen.tsx',
]);

const isAllowlisted = rel => rel.includes('__tests__') || ALLOWLIST.has(rel);

const walk = dir => {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
};

// `[^}]*` attraversa i newline in JS → cattura anche gli import multi-linea.
const RN_IMPORT = /import\s*\{([^}]*)\}\s*from\s*['"]react-native['"]/g;
const importsNamed = (clause, name) =>
  new RegExp(`(^|[,\\s])${name}([,\\s]|$)`).test(clause);

const violations = [];
for (const file of walk(SRC)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (isAllowlisted(rel)) continue;
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = RN_IMPORT.exec(content)) !== null) {
    const clause = match[1];
    if (importsNamed(clause, 'Text')) {
      violations.push(
        `${rel}: import { Text } da 'react-native' → usa PerfectText`
      );
    }
    if (importsNamed(clause, 'Image')) {
      violations.push(
        `${rel}: import { Image } da 'react-native' → usa PerfectImage`
      );
    }
  }
}

if (violations.length > 0) {
  console.error(
    '❌ Import legacy vietati (Text/Image diretti da react-native):'
  );
  for (const v of violations) console.error('  - ' + v);
  console.error(
    '\n💡 Usa PerfectText/PerfectImage (o aggiungi all’allowlist se legittimo).'
  );
  process.exit(1);
}
console.log(
  '✅ Nessun import diretto Text/Image da react-native (fuori allowlist).'
);
