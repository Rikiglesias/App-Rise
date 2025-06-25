#!/usr/bin/env node

/**
 * Script di Conteggio RIGOROSO dei Problemi
 * ZERO TOLLERANZA: tutti gli errori E warnings sono bloccanti
 */

import { execSync } from 'child_process';

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
  execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
  console.log('✅ Nessun errore TypeScript!');
} catch (error) {
  const output = error.stdout
    ? error.stdout.toString()
    : error.stderr.toString();
  const lines = output.split('\n').filter(line => line.includes('error TS'));
  typescriptErrors = lines.length;
  console.log(`❌ ${typescriptErrors} errori TypeScript trovati`);
  criticalErrors += typescriptErrors;
}

// 2. Conta problemi ESLint (formato compact) - ZERO TOLLERANZA REALE
console.log('\n⚠️ PROBLEMI ESLINT:');
try {
  execSync(
    'npx eslint "**/*.{ts,tsx,js}" --ignore-pattern "node_modules/**" --ignore-pattern ".expo/**" --ignore-pattern "android/**" --ignore-pattern "ios/**" --ignore-pattern "coverage/**" --format compact --max-warnings 0',
    {
      stdio: 'pipe',
      encoding: 'utf8',
    }
  );
  console.log('✅ Nessun problema ESLint!');
} catch (error) {
  // const eslintOutput = error.stdout
  //   ? error.stdout.toString()
  //   : error.stderr.toString();

  // Parse output ESLint per contare errori e warnings
  const lines = (
    error.stdout ? error.stdout.toString() : error.stderr.toString()
  )
    .split('\n')
    .filter(line => line.trim());

  // Conta righe con errori/warnings (formato: file:line:col: severity message)
  eslintErrors = lines.filter(
    line => line.includes(' error ') || line.includes(',Error -')
  ).length;

  eslintWarnings = lines.filter(
    line => line.includes(' warning ') || line.includes(',Warning -')
  ).length;

  // Se non riesce a parsare, cerca nel summary finale
  if (eslintErrors === 0 && eslintWarnings === 0) {
    const summaryMatch = (
      error.stdout ? error.stdout.toString() : error.stderr.toString()
    ).match(/✖ (\d+) problems? \((\d+) errors?, (\d+) warnings?\)/);
    if (summaryMatch) {
      eslintErrors = parseInt(summaryMatch[2]) || 0;
      eslintWarnings = parseInt(summaryMatch[3]) || 0;
    } else {
      // Fallback: se c'è output ma non riusciamo a parsare, assumiamo che ci siano problemi
      const problemLines = lines.filter(
        line =>
          line.includes('.tsx') || line.includes('.ts') || line.includes('.js')
      ).length;
      eslintWarnings = problemLines > 0 ? problemLines : 1;
    }
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
console.log('\n📝 MARKDOWNLINT:');
try {
  execSync('npx markdownlint "**/*.md" --ignore node_modules --ignore docs', {
    stdio: 'pipe',
  });
  console.log('✅ Nessun problema Markdownlint!');
} catch (error) {
  const output = error.stdout
    ? error.stdout.toString()
    : error.stderr.toString();
  const lines = output.split('\n').filter(line => line.includes('MD0'));
  markdownlintErrors = lines.length;
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
    { stdio: 'pipe' }
  );
  console.log('✅ Nessun problema Prettier!');
} catch (error) {
  const output = error.stdout
    ? error.stdout.toString()
    : error.stderr.toString();
  const lines = output.split('\n').filter(line => line.includes('[warn]'));
  prettierErrors = lines.length;
  console.log(`❌ ${prettierErrors} errori Prettier trovati (BLOCCANTI)`);
  criticalErrors += prettierErrors;
}

// 5. Conta test Jest falliti
console.log('\n🧪 TEST JEST:');
try {
  execSync('npm test -- --passWithNoTests --silent', { stdio: 'pipe' });
  console.log('✅ Tutti i test Jest passano!');
} catch (error) {
  const output = error.stdout
    ? error.stdout.toString()
    : error.stderr.toString();

  // Parse output per contare i test falliti
  const failedMatch = output.match(/(\d+) failed/);
  jestFailures = failedMatch ? parseInt(failedMatch[1]) : 1;

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
