#!/usr/bin/env node

/**
 * WORKFLOW PRE-MODIFICHE - VERIFICHE RIGOROSE
 * Controlla errori E warnings - ZERO TOLLERANZA
 */

import { execSync } from 'child_process';

console.log('🔍 WORKFLOW PRE-MODIFICHE - ZERO TOLLERANZA ERRORI+WARNINGS\n');

let hasErrors = false;

// FASE 1: Controllo iniziale rigido
console.log('🎯 FASE 1: CONTROLLO RIGIDO INIZIALE');
console.log('=====================================');

try {
  execSync('npm run conta-problemi', { stdio: 'inherit' });
} catch (error) {
  console.log('\n❌ PROGETTO NON PRONTO - Problemi rilevati');
  hasErrors = true;
}

// FASE 2: Verifiche dettagliate (errori E warnings)
console.log('\n🔍 FASE 2: VERIFICA DETTAGLIATA - ZERO TOLLERANZA');
console.log('==================================================');

console.log('📋 Verificando sintassi TypeScript...');
try {
  execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'inherit' });
  console.log('✅ TypeScript: PULITO');
} catch (error) {
  console.log('❌ TypeScript: ERRORI TROVATI');
  hasErrors = true;
}

console.log('\n📝 Verificando ESLint (errori + warnings)...');
try {
  // ZERO warnings tollerati
  execSync('npx eslint "src/**/*.{ts,tsx}" --max-warnings 0', {
    stdio: 'inherit',
  });
  console.log('✅ ESLint: PULITO');
} catch (error) {
  console.log('❌ ESLint: ERRORI/WARNINGS TROVATI');
  hasErrors = true;
}

console.log('\n🎨 Verificando formatting...');
try {
  execSync('npx prettier --check "src/**/*.{ts,tsx}"', { stdio: 'inherit' });
  console.log('✅ Prettier: PULITO');
} catch (error) {
  console.log('❌ Prettier: PROBLEMI FORMATTING');
  hasErrors = true;
}

console.log('\n🧪 Verificando test...');
try {
  execSync('npm test', { stdio: 'inherit' });
  console.log('✅ Test: TUTTI PASSANO');
} catch (error) {
  console.log('❌ Test: FALLIMENTI RILEVATI');
  hasErrors = true;
}

// FASE 3: Decisione finale
console.log('\n✅ FASE 3: DECISIONE FINALE');
console.log('=====================================');

if (hasErrors) {
  console.log('\n🚫 SVILUPPO BLOCCATO!');
  console.log('==================');
  console.log('❌ Errori e/o warnings rilevati');
  console.log('🔧 CORREZIONE MANUALE OBBLIGATORIA:');
  console.log('   1. Apri editor con supporto ESLint/TypeScript');
  console.log('   2. Correggi TUTTI gli errori evidenziati');
  console.log('   3. Correggi TUTTI i warnings evidenziati');
  console.log('   4. Formatta codice manualmente');
  console.log('   5. Riesegui npm run pre-modifiche');
  console.log('\n💡 HELPER: npm run helper-manuali per guida dettagliata');

  process.exit(1);
} else {
  console.log('\n🎉 CODICE PERFETTAMENTE PULITO!');
  console.log('================================');
  console.log('✅ Zero errori TypeScript');
  console.log('✅ Zero errori ESLint');
  console.log('✅ Zero warnings ESLint');
  console.log('✅ Formatting perfetto');
  console.log('✅ Tutti i test passano');
  console.log('\n🚀 PRONTO PER SVILUPPO!');
  console.log('📝 Procedi con le modifiche, poi: npm run post-modifiche');

  process.exit(0);
}
