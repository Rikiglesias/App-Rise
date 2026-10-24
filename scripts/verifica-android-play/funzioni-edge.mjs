// C35 (fase F8, contratto android-play R8-R10, emendato R17): chiave delle funzioni Edge, verify_jwt e deno test
// letto dal report JUnit.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { elencaFile, esiste, leggi, percorso, rel } from './comune.mjs';

// Deno con un report JUnit: i nomi dei test si leggono dal file, l'exit code da solo non distingue «manca» da «rosso».
export const FUNZIONI_C35 = ['delete-account', 'purge-deletions'];
// Nomi esatti per funzione (R17): `purge-deletions` non ha token utente, il suo cancello è il segreto del cron.
export const TEST_C35 = {
  'delete-account': [
    'chiave da SUPABASE_SECRET_KEYS',
    'chiave assente → 500',
    'token assente → 401',
    'token non valido → 401',
  ],
  'purge-deletions': [
    'chiave da SUPABASE_SECRET_KEYS',
    'chiave assente → 500',
    'segreto cron assente → 403',
  ],
};

/** Codice senza commenti: una chiave nominata in un commento non conta come letta (R16-CRITICA punto 11). */
export const senzaCommenti = testo =>
  testo.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

const LETTURA_NUOVA =
  /JSON\.parse\(\s*Deno\.env\.get\(\s*['"]SUPABASE_SECRET_KEYS['"]\s*\)/;

/** `verify_jwt` di una sezione `[functions.<nome>]` di config.toml, `null` se manca. */
export const verifyJwt = (toml, nome) => {
  const sezione = toml
    .split(/^\[/m)
    .find(s => s.startsWith(`functions.${nome}]`));
  const m = sezione?.match(/^verify_jwt\s*=\s*(true|false)\s*$/m);
  return m ? m[1] === 'true' : null;
};

const sorgentiFunzione = nome =>
  elencaFile(
    percorso('supabase', 'functions', nome),
    p => /\.ts$/.test(p) && !/_test\.ts$/.test(p)
  ).map(p => ({ nome: rel(p), testo: leggi(p) }));

/** Righe che nominano la chiave legacy, ovunque in `supabase/functions/` (test compresi): R17 la vuole assente. */
export const usiChiaveLegacy = file =>
  file.flatMap(({ nome, testo }) =>
    testo
      .split(/\r?\n/)
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => r.includes('SUPABASE_SERVICE_ROLE_KEY'))
      .map(({ i }) => ({ nome, riga: i + 1 }))
  );

const tuttiIFile = () =>
  elencaFile(percorso('supabase', 'functions'), p =>
    /\.(ts|js|json)$/.test(p)
  ).map(p => ({
    nome: rel(p),
    testo: leggi(p),
  }));

/** Casi del report JUnit di Deno: nome e se hanno fallito o sono stati saltati. */
export const casiJunit = xml =>
  [...xml.matchAll(/<testcase\b([^>]*?)(\/>|>([\s\S]*?)<\/testcase>)/g)].map(
    m => {
      const nome = /\bname="([^"]*)"/.exec(m[1])?.[1] ?? '';
      const corpo = m[3] ?? '';
      return {
        nome: nome
          .replaceAll('&gt;', '>')
          .replaceAll('&lt;', '<')
          .replaceAll('&quot;', '"')
          .replaceAll('&apos;', "'")
          .replaceAll('&amp;', '&'),
        verde: !/<(failure|error|skipped)\b/.test(corpo),
      };
    }
  );

/** `deno test` di una funzione in `cwd` (la cartella delle funzioni del repo, o una sua copia per C60). */
export const denoTest = (nome, cwd = percorso('supabase', 'functions')) => {
  const dir = mkdtempSync(join(tmpdir(), 'c35-'));
  const junit = join(dir, 'junit.xml');
  try {
    const r = spawnSync(
      'deno',
      [
        'test',
        '--allow-env',
        '--allow-net',
        '--allow-read',
        `--junit-path=${junit}`,
        nome,
      ],
      {
        cwd,
        encoding: 'utf8',
        shell: process.platform === 'win32',
      }
    );
    if (r.error) return { errore: `deno: ${r.error.message}` };
    return {
      exit: r.status,
      casi: esiste(junit) ? casiJunit(leggi(junit)) : null,
      coda: String(r.stderr || r.stdout || '')
        .trim()
        .split(/\r?\n/)
        .slice(-3)
        .join(' | '),
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

export const staticoC35 = {
  leggi() {
    const config = percorso('supabase', 'config.toml');
    return {
      legacy: usiChiaveLegacy(tuttiIFile()),
      config: esiste(config) ? leggi(config) : null,
      funzioni: Object.fromEntries(
        FUNZIONI_C35.map(f => {
          const file = sorgentiFunzione(f);
          return [
            f,
            {
              file: file.map(x => x.nome),
              nuova: file.some(x => LETTURA_NUOVA.test(senzaCommenti(x.testo))),
              deno: denoTest(f),
            },
          ];
        })
      ),
    };
  },
  verifica(dati) {
    if (!dati?.funzioni) return 'lettura C35 mancante';
    if (dati.legacy?.length)
      return `SUPABASE_SERVICE_ROLE_KEY ancora in supabase/functions/ (${dati.legacy
        .map(u => `${u.nome}:${u.riga}`)
        .join(', ')})`;
    if (!dati.config) return 'supabase/config.toml assente';
    if (/DEVE validare il JWT/.test(dati.config))
      return 'config.toml: il commento dice ancora che la piattaforma DEVE validare il JWT';
    for (const f of FUNZIONI_C35) {
      const v = verifyJwt(dati.config, f);
      if (v !== false)
        return `config.toml: verify_jwt di ${f} = ${v}, atteso false`;
    }
    for (const f of FUNZIONI_C35) {
      const d = dati.funzioni[f];
      if (!d?.file?.length) return `${f}: nessun sorgente (lettore rotto?)`;
      if (!d.nuova)
        return `${f}: chiave non letta con JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')) nel codice`;
      if (d.deno?.errore) return `${f}: ${d.deno.errore}`;
      if (!d.deno?.casi)
        return `${f}: report di deno test assente (exit ${d.deno?.exit}: ${d.deno?.coda})`;
      if (!d.deno.casi.length)
        return `${f}: deno test senza casi (lettore rotto?)`;
      for (const t of TEST_C35[f]) {
        const trovati = d.deno.casi.filter(c => c.nome === t);
        if (!trovati.length) return `${f}: manca il test «${t}»`;
        if (trovati.some(c => !c.verde)) return `${f}: test «${t}» non verde`;
      }
      if (d.deno.exit !== 0)
        return `${f}: deno test exit ${d.deno.exit} (${d.deno.coda})`;
    }
    return '';
  },
};
