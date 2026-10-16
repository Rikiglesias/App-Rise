// C35 (fase F8, contratto android-play R8-R10): chiave delle funzioni Edge e deno test letto dal report JUnit.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { elencaFile, esiste, leggi, percorso, rel } from './comune.mjs';

// Deno con un report JUnit: i nomi dei test si leggono dal file, l'exit code da solo non distingue «manca» da «rosso».
export const FUNZIONI_C35 = ['delete-account', 'purge-deletions'];
export const TEST_C35 = [
  'chiave da SUPABASE_SECRET_KEYS',
  'token assente → 401',
];

const sorgentiFunzione = nome =>
  elencaFile(
    percorso('supabase', 'functions', nome),
    p => /\.ts$/.test(p) && !/_test\.ts$/.test(p)
  ).map(p => ({ nome: rel(p), testo: leggi(p) }));

/** Righe che nominano la chiave legacy, ciascuna con le 6 righe prima (dove sta il commento del ripiego). */
export const usiChiaveLegacy = file =>
  file.flatMap(({ nome, testo }) => {
    const righe = testo.split(/\r?\n/);
    return righe
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => r.includes('SUPABASE_SERVICE_ROLE_KEY'))
      .map(({ i }) => ({
        nome,
        riga: i + 1,
        contesto: righe.slice(Math.max(0, i - 6), i + 1).join('\n'),
      }));
  });

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

const denoTest = nome => {
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
        cwd: percorso('supabase', 'functions'),
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
    return Object.fromEntries(
      FUNZIONI_C35.map(f => {
        const file = sorgentiFunzione(f);
        return [
          f,
          {
            file: file.map(x => x.nome),
            nuova: file.some(
              x =>
                /SUPABASE_SECRET_KEYS/.test(x.testo) &&
                /\bdefault\b/.test(x.testo)
            ),
            legacy: usiChiaveLegacy(file),
            deno: denoTest(f),
          },
        ];
      })
    );
  },
  verifica(dati) {
    if (!dati) return 'lettura C35 mancante';
    for (const f of FUNZIONI_C35) {
      const d = dati[f];
      if (!d?.file?.length) return `${f}: nessun sorgente (lettore rotto?)`;
      if (!d.nuova)
        return `${f}: chiave non letta da SUPABASE_SECRET_KEYS (voce default)`;
      if (d.legacy.length > 1)
        return `${f}: SUPABASE_SERVICE_ROLE_KEY in ${d.legacy.length} punti (ammesso solo il ripiego)`;
      const fuori = d.legacy.filter(u => !/ripiego/i.test(u.contesto));
      if (fuori.length)
        return `${f}: SUPABASE_SERVICE_ROLE_KEY fuori dal ripiego documentato (${fuori
          .map(u => `${u.nome}:${u.riga}`)
          .join(', ')})`;
      if (d.deno?.errore) return `${f}: ${d.deno.errore}`;
      if (!d.deno?.casi)
        return `${f}: report di deno test assente (exit ${d.deno?.exit}: ${d.deno?.coda})`;
      if (!d.deno.casi.length)
        return `${f}: deno test senza casi (lettore rotto?)`;
      for (const t of TEST_C35) {
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
