#!/usr/bin/env node

/**
 * Script di Conteggio RIGOROSO dei Problemi
 * ZERO TOLLERANZA: tutti gli errori E warnings sono bloccanti
 *
 * Nota: usa CommonJS per compatibilità Node senza type: module
 */

const { execSync } = require('child_process');

/**
 * Legge l'output di un comando fallito, da ENTRAMBI i canali e senza colori.
 *
 * Perché serve: gli strumenti qui sotto non scrivono tutti nello stesso posto —
 * `tsc` ed ESLint riportano su stdout, `markdownlint`, Prettier e Jest su stderr.
 * `execSync` con `stdio: 'pipe'` popola SEMPRE entrambi i campi, anche quando uno
 * è vuoto, e un Buffer vuoto è truthy: il vecchio `error.stdout ? … : error.stderr`
 * non raggiungeva MAI il secondo ramo, quindi i tre controlli che scrivono su stderr
 * contavano zero problemi qualunque fosse la realtà — e lo script chiudeva con
 * «STATO: PERFETTO» mentre 23 file fallivano Prettier (misurato il 2026-08-15).
 *
 * I codici colore vanno tolti perché i marcatori cercati più sotto (`[warn]`) nel
 * testo reale sono spezzati dalle sequenze ANSI: `[` + ESC[33m + `warn` + ESC[39m + `]`.
 */
const SEQUENZE_ANSI = /\u001b\[[0-9;]*m/g;
const leggiOutput = error =>
  `${error.stdout ?? ''}${error.stderr ?? ''}`.replace(SEQUENZE_ANSI, '');

/**
 * Opzioni comuni a ogni comando lanciato qui.
 *
 * `maxBuffer` esplicito perché il default di execSync è 1 MiB e oltre quella soglia
 * l'output viene TRONCATO IN SILENZIO. Non è teorico: prima di questa correzione lo
 * script contava 7565 rilievi markdownlint dove il comando lanciato a mano sullo
 * stesso perimetro ne produceva 24.533 — 7565 righe stanno appunto attorno al MiB,
 * cioè era il tetto del buffer, non il numero vero. Su Jest sarebbe peggio: la riga
 * «Tests: N failed» sta in CODA all'output, quindi verrebbe tagliata proprio quando i
 * test falliti sono tanti, e il conteggio ripiegherebbe su 1 qualunque sia la realtà.
 */
const OPZIONI_ESEC = { stdio: 'pipe', maxBuffer: 32 * 1024 * 1024 };

/**
 * Un comando FALLITO deve contare almeno un problema.
 *
 * Ogni blocco cerca un marcatore nel testo (`error TS`, `MD0`, `[warn]`). Se il
 * comando fallisce per un motivo che quel marcatore non descrive — un file di
 * configurazione malformato, un crash dello strumento, un percorso inesistente — il
 * conteggio uscirebbe 0 e lo script chiuderebbe con «STATO: PERFETTO» ed exit 0:
 * esattamente la classe di bugia che questo script esiste per non dire.
 */
const almenoUno = (conteggio, nome) => {
  if (conteggio > 0) return conteggio;
  console.log(
    `   ⚠️ ${nome} è fallito senza righe riconoscibili: conto 1 problema.`
  );
  return 1;
};

console.log('🚨 CONTEGGIO RIGOROSO - ZERO TOLLERANZA\n');
console.log('='.repeat(60));

let criticalErrors = 0;
let acceptableWarnings = 0;
let typescriptErrors = 0;
let eslintErrors = 0;
let eslintWarnings = 0;
let jestFailures = 0;
let markdownlintErrors = 0;
let prettierErrors = 0;

// 1. Conta errori TypeScript
console.log('\n🔥 ERRORI TYPESCRIPT:');
try {
  execSync('npx tsc --noEmit --skipLibCheck', OPZIONI_ESEC);
  console.log('✅ Nessun errore TypeScript!');
} catch (error) {
  const output = leggiOutput(error);
  const lines = output.split('\n').filter(line => line.includes('error TS'));
  typescriptErrors = almenoUno(lines.length, 'TypeScript');
  console.log(`❌ ${typescriptErrors} errori TypeScript trovati`);
  criticalErrors += typescriptErrors;
}

// 2. Conta problemi ESLint - ZERO TOLLERANZA REALE
//
// Formato JSON e non `compact`, perché i conteggi arrivano come NUMERI
// (`errorCount`/`warningCount`) invece di essere dedotti da una stringa. La versione
// precedente cercava `',Error -'` (senza spazio) e `' error '` minuscolo, mentre il
// formatter compact stampa `<file>: line 3, col 7, Error - messaggio (regola)`:
// nessuno dei due filtri agganciava mai nulla. Il risultato era doppiamente sbagliato
// — un errore vero finiva sotto «WARNINGS BLOCCANTI» con «ESLint: 0» fra gli errori
// critici, e se ESLint andava in crash ogni riga dello stack che contenesse `.ts`
// veniva contata come un problema di lint.
console.log('\n⚠️ PROBLEMI ESLINT:');
try {
  execSync(
    'npx eslint "**/*.{ts,tsx}" --ignore-pattern "node_modules/**" --ignore-pattern ".expo/**" --ignore-pattern "android/**" --ignore-pattern "ios/**" --ignore-pattern "coverage/**" --format json --max-warnings 0',
    { ...OPZIONI_ESEC, encoding: 'utf8' }
  );
  console.log('✅ Nessun problema ESLint!');
} catch (error) {
  const output = leggiOutput(error);

  // Il JSON e' un array di risultati per file: si sommano i conteggi dichiarati da
  // ESLint stesso. Se il parse fallisce, ESLint non ha prodotto un report — e' andato
  // in errore per altro (configurazione, percorso, crash): allora conta 1, perche' il
  // comando e' comunque fallito e tacere sarebbe la bugia che questo script evita.
  const inizio = output.indexOf('[');
  let risultati = null;
  if (inizio >= 0) {
    try {
      risultati = JSON.parse(output.slice(inizio, output.lastIndexOf(']') + 1));
    } catch {
      risultati = null;
    }
  }

  if (Array.isArray(risultati)) {
    eslintErrors = risultati.reduce((n, f) => n + (f.errorCount || 0), 0);
    eslintWarnings = risultati.reduce((n, f) => n + (f.warningCount || 0), 0);
    if (eslintErrors === 0 && eslintWarnings === 0) {
      eslintErrors = almenoUno(0, 'ESLint');
    }
  } else {
    eslintErrors = almenoUno(0, 'ESLint');
  }

  if (eslintErrors > 0) {
    console.log(`❌ ${eslintErrors} errori ESLint (BLOCCANTI)`);
    criticalErrors += eslintErrors;
  }

  if (eslintWarnings > 0) {
    console.log(`🚫 ${eslintWarnings} warnings ESLint (BLOCCANTI)`);
    acceptableWarnings += eslintWarnings;
  }

  console.log(`📊 ${eslintErrors + eslintWarnings} problemi ESLint totali`);
}

// 3. Conta errori Markdownlint (esclude docs/ per evitare warning su documentazione)
//
// Gli `--ignore` vogliono il glob RICORSIVO, e per due motivi distinti misurati il
// 2026-08-15: `--ignore node_modules` non esclude il CONTENUTO della cartella, e
// soprattutto non esiste una sola cartella di dipendenze — c'è anche
// `ExpoGoInstaller/node_modules`, che nessun pattern ancorato alla radice raggiunge.
// Con la forma vecchia il conteggio era 24.533 righe di errori appartenenti a
// librerie di terzi; con `**/node_modules/**` scende a 454, tutte di file nostri.
// `graphify-out/` è escluso perché è output rigenerabile del grafo, non documentazione.
console.log('\n📝 MARKDOWNLINT:');
try {
  execSync(
    'npx markdownlint "**/*.md" --ignore "**/node_modules/**" --ignore "docs/**" --ignore "graphify-out/**"',
    OPZIONI_ESEC
  );
  console.log('✅ Nessun problema Markdownlint!');
} catch (error) {
  const output = leggiOutput(error);
  const lines = output.split('\n').filter(line => line.includes('MD0'));
  markdownlintErrors = almenoUno(lines.length, 'Markdownlint');
  console.log(
    `❌ ${markdownlintErrors} errori Markdownlint trovati (BLOCCANTI)`
  );
  criticalErrors += markdownlintErrors;
}

// 4. Conta errori Prettier (esclude docs/ per evitare warning su documentazione)
console.log('\n🎨 PRETTIER:');
try {
  execSync(
    'npx prettier --check . --ignore-path .gitignore --ignore-path .prettierignore',
    OPZIONI_ESEC
  );
  console.log('✅ Nessun problema Prettier!');
} catch (error) {
  const output = leggiOutput(error);
  // Prettier marca con `[warn]` sia ogni file non formattato sia la riga di riepilogo
  // finale («Code style issues found in the above file(s)…»). Contarle tutte darebbe
  // sempre un file in più del vero: il riepilogo va escluso.
  const lines = output
    .split('\n')
    .filter(
      line =>
        line.includes('[warn]') && !line.includes('Code style issues found')
    );
  prettierErrors = almenoUno(lines.length, 'Prettier');
  console.log(`❌ ${prettierErrors} errori Prettier trovati (BLOCCANTI)`);
  criticalErrors += prettierErrors;
}

// 5. Conta test Jest falliti
console.log('\n🧪 TEST JEST:');
try {
  execSync('npm test -- --passWithNoTests --silent', OPZIONI_ESEC);
  console.log('✅ Tutti i test Jest passano!');
} catch (error) {
  const output = leggiOutput(error);

  // Parse output per contare i test falliti.
  // Si ancora alla riga «Tests:» e non al primo «N failed» del testo: il riepilogo di
  // Jest apre con «Test Suites: 1 failed, …» e un match libero prenderebbe quello,
  // riportando il numero di SUITE fallite al posto dei test.
  // Se il riepilogo manca (crash prima di scriverlo) resta 1: fallire in modo
  // rumoroso è corretto, perché qui il comando è comunque uscito con errore.
  const failedMatch = output.match(/^Tests:.*?(\d+) failed/m);
  jestFailures = failedMatch ? parseInt(failedMatch[1], 10) : 1;

  console.log(`❌ ${jestFailures} test Jest falliti (BLOCCANTI)`);
  console.log('📄 Dettagli errori visibili in VS Code Problems tab');
  criticalErrors += jestFailures;
}

// 6. Riepilogo finale RIGOROSO
console.log('\n' + '='.repeat(60));
console.log('🚨 RIEPILOGO RIGOROSO - ZERO TOLLERANZA:');
console.log('='.repeat(60));
console.log(`❌ ERRORI CRITICI: ${criticalErrors}`);
console.log(`  └─ TypeScript: ${typescriptErrors}`);
console.log(`  └─ ESLint: ${eslintErrors}`);
console.log(`  └─ Markdownlint: ${markdownlintErrors}`);
console.log(`  └─ Prettier: ${prettierErrors}`);
console.log(`  └─ Jest: ${jestFailures}`);
console.log(`🚫 WARNINGS BLOCCANTI: ${acceptableWarnings}`);
console.log('―'.repeat(30));
const totalProblems = criticalErrors + acceptableWarnings;
console.log(`🚨 PROBLEMI TOTALI: ${totalProblems}`);

// 7. Status finale
if (totalProblems === 0) {
  console.log('✅ STATO: PERFETTO - COMMIT E DEPLOY PERMESSI!');
  console.log('🎯 Qualità: STANDARD MASSIMO RAGGIUNTO');
} else {
  console.log('🚫 STATO: PROBLEMI PRESENTI - SVILUPPO BLOCCATO');
  console.log('⚠️ AZIONE RICHIESTA: Correggere TUTTI i problemi');
}

console.log('='.repeat(60));

// 8. ZERO TOLLERANZA ASSOLUTA - Nessun warning accettabile
console.log('\n📊 VERIFICA SOGLIE:');
if (acceptableWarnings === 0) {
  console.log('✅ ZERO WARNINGS - Standard di eccellenza raggiunto!');
} else {
  console.log(`🚫 ${acceptableWarnings} warnings rilevati - BLOCCO ASSOLUTO`);
  console.log('⚠️ ZERO TOLLERANZA: Ogni warning deve essere corretto');
}

// ZERO TOLLERANZA: nessun warning accettabile
// const warningLimit = ADVANCED_CONFIG.quality.maxAcceptableWarnings; // eslint-disable-line @typescript-eslint/no-unused-vars
const isWithinAcceptableRange = acceptableWarnings === 0;

// 9. Piano d'azione ZERO TOLLERANZA
console.log("\n📋 PIANO D'AZIONE:");
if (criticalErrors > 0) {
  console.log('🔥 PRIORITÀ CRITICA - ERRORI BLOCCANTI:');
  console.log('1. Correggi errori TypeScript bloccanti MANUALMENTE');
  console.log("2. Correggi errori ESLint di livello ERROR nell'editor");
  console.log('3. Verifica con npm run conta-problemi');
  console.log('4. Ripeti finché criticalErrors = 0');
} else if (acceptableWarnings > 0) {
  console.log('🚫 WARNINGS BLOCCANTI - ZERO TOLLERANZA:');
  console.log(`1. Correggi TUTTI i ${acceptableWarnings} warnings manualmente`);
  console.log('2. max-lines-per-function: Dividi funzioni grandi');
  console.log('3. jsx-no-bind: Usa useCallback per event handlers');
  console.log('4. Altri: Segui suggerimenti ESLint');
  console.log('5. Riesegui npm run conta-problemi');
  console.log('6. Ripeti finché warnings = 0');
} else {
  console.log('✅ ECCELLENZA RAGGIUNTA - SVILUPPO LIBERO:');
  console.log('1. Commit e deploy permessi');
  console.log('2. Standard di qualità massimo mantenuto');
  console.log('3. Focus su nuove feature con qualità garantita');
}

console.log('\n💡 COMANDI UTILI:');
console.log('📊 Questo conteggio: npm run conta-problemi');
console.log('🚫 Correzioni automatiche: DISABILITATE');
console.log('📋 Analisi completa: npm run analisi-completa');
console.log('🔍 Verifica stato: npm run conta-problemi');
console.log("✋ Correzioni: SOLO MANUALI nell'editor");

// EXIT CODE: 0 se zero errori critici E warnings sotto soglia, 1 altrimenti
const shouldBlock = criticalErrors > 0 || !isWithinAcceptableRange;
process.exit(shouldBlock ? 1 : 0);

// const eslintOutput = error.stdout
//   ? error.stdout.toString()
//   : error.stderr.toString();
// const warningLimit = ADVANCED_CONFIG.quality.maxAcceptableWarnings;
