// C60 (R24-R25, rilievo C1 di F13): le funzioni Edge non mettono il `.message` di un errore nelle risposte
// HTTP. Test Deno letti dal JUnit come C35, verdi su HEAD e rossi con il codice delle funzioni di BASE_R24
// (regola della controprova R25 per Deno: il rosso si prova sul file della base, qui ricostruito ogni volta).
import {
  cpSync,
  mkdtempSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { elencaFile, esegui, esiste, leggi, percorso } from './comune.mjs';
import { FUNZIONI_C35, denoTest } from './funzioni-edge.mjs';
import { bilanciato } from './f13-statici.mjs';
import { BASE_R24 } from './titoli-jest.mjs';

export const TEST_C60 = {
  'delete-account': 'delete-account: errore senza dettagli interni',
  'purge-deletions': 'purge-deletions: errore senza dettagli interni',
};

/** Chiamate che diventano una risposta HTTP (`json(…)`, `new Response(…)`) e contengono un `.message`. */
export const risposteConMessaggio = (nome, testo) =>
  [...testo.matchAll(/\b(?:json|new\s+Response)\s*\(/g)]
    .filter(m =>
      /\.message\b/.test(bilanciato(testo, m.index + m[0].length - 1))
    )
    .map(m => `${nome}:${testo.slice(0, m.index).split('\n').length}`);

/** Copia di `supabase/functions` con il codice (non i test né la config Deno) di BASE_R24. */
const copiaAllaBase = () => {
  const dir = mkdtempSync(join(tmpdir(), 'c60-'));
  cpSync(percorso('supabase', 'functions'), dir, { recursive: true });
  const codice = elencaFile(
    dir,
    p => /\.(ts|js)$/.test(p) && !/_test\.ts$/.test(p)
  );
  for (const p of codice) {
    const relativo = relative(dir, p).split(sep).join('/');
    try {
      writeFileSync(
        p,
        esegui('git', ['show', `${BASE_R24}:supabase/functions/${relativo}`])
      );
    } catch {
      unlinkSync(p); // il file non c'era alla base
    }
  }
  return dir;
};

const indice = f => percorso('supabase', 'functions', f, 'index.ts');

export const C60 = {
  leggi() {
    const dir = copiaAllaBase();
    try {
      return {
        sorgenti: Object.fromEntries(
          FUNZIONI_C35.map(f => [
            f,
            esiste(indice(f)) ? leggi(indice(f)) : null,
          ])
        ),
        oggi: Object.fromEntries(FUNZIONI_C35.map(f => [f, denoTest(f)])),
        base: Object.fromEntries(FUNZIONI_C35.map(f => [f, denoTest(f, dir)])),
      };
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
  verifica({ sorgenti, oggi, base }) {
    for (const f of FUNZIONI_C35) {
      if (sorgenti?.[f] == null) return `${f}/index.ts assente`;
      const [dove] = risposteConMessaggio(`${f}/index.ts`, sorgenti[f]);
      if (dove) return `risposta HTTP con il .message di un errore: ${dove}`;
      const nome = TEST_C60[f];
      const h = oggi?.[f];
      if (h?.errore) return `${f}: ${h.errore}`;
      if (!h?.casi)
        return `${f}: JUnit di deno test assente (${h?.coda ?? ''})`;
      const suo = h.casi.filter(c => c.nome === nome);
      if (!suo.length) return `${f}: manca il test «${nome}»`;
      if (suo.some(c => !c.verde)) return `${f}: «${nome}» rosso su HEAD`;
      const b = base?.[f];
      const allaBase = (b?.casi ?? []).filter(c => c.nome === nome);
      if (!allaBase.length)
        return `${f}: «${nome}» assente col codice di ${BASE_R24} (il test deve passare da un punto d'ingresso che esiste lì; ${b?.errore ?? b?.coda ?? ''})`;
      if (allaBase.every(c => c.verde))
        return `${f}: «${nome}» verde anche col codice di ${BASE_R24}`;
    }
    return '';
  },
};
