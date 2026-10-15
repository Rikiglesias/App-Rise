// C8: link di conferma o recupero scaduto (contratto del goal android-play, emendamento R6-R7).
// Android oscura il fragment degli URI nei log di sistema (Uri.toSafeString), quindi il logcat
// prova solo che l'intent è arrivato alla nostra activity; che il fragment arrivi almeno fino a
// `error_code` lo prova l'avviso a schermo, che l'app mostra solo con `error_code` (test Jest
// sull'URL troncato al primo «&»).
// Prove in docs/store/google-play/verifica/, prese con la build di build.json (quella di C10):
//   link-scaduto-it.png/.xml, link-scaduto-en.png/.xml   giri a freddo, app in it e in en
//   link-scaduto-caldo-it.xml                             giro a caldo, app già aperta
//   link-scaduto.log   per ogni giro una sezione «=== giro: <freddo-it|freddo-en|caldo-it>» con
//                      dumpsys package, output di `am start -W`, «lingua: <tag>», la riga START
//                      del logcat e «sha256 <hash> <file>» calcolato sul dispositivo.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { testoTraduzione } from './app.mjs';
import {
  PACKAGE,
  ROOT,
  VERIFICA_DIR,
  esegui,
  esiste,
  leggi,
  normalizzaSpazi,
  percorso,
  sha256File,
} from './comune.mjs';

const FILE_PROVA = [
  'link-scaduto-it.png',
  'link-scaduto-en.png',
  'link-scaduto-it.xml',
  'link-scaduto-en.xml',
  'link-scaduto-caldo-it.xml',
  'link-scaduto.log',
];
const FILE_CON_HASH = FILE_PROVA.filter(n => n !== 'link-scaduto.log');
const GIRI = [
  { nome: 'freddo-it', lingua: 'it', freddo: true },
  { nome: 'freddo-en', lingua: 'en', freddo: true },
  { nome: 'caldo-it', lingua: 'it', freddo: false },
];
const FILE_TEST = 'src/__tests__/shared/auth/useAuthDeepLink.test.ts';
export const TEST_ATTESI = [
  'link scaduto (it): reset password',
  'link scaduto (en): reset password',
  'link scaduto (it): conferma email',
  'link scaduto: URL troncato al primo & (senza error_code) non mostra l’avviso',
];

const decodifica = s =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&');

/** Nodi di un dump di uiautomator con testo e pacchetto. */
const nodiDump = xml =>
  [...xml.matchAll(/<node [^>]*>/g)].map(([n]) => {
    const a = k =>
      decodifica(n.match(new RegExp(`\\s${k}="([^"]*)"`))?.[1] ?? '');
    return {
      testo: normalizzaSpazi(a('text') || a('content-desc')),
      pkg: a('package'),
    };
  });

/** Sezioni del log per giro: { 'freddo-it': '...', ... }. */
const sezioniLog = log =>
  Object.fromEntries(
    log
      .split(/^=== giro: /m)
      .slice(1)
      .map(s => [s.slice(0, s.indexOf('\n')).trim(), s])
  );

const eseguiJest = () => {
  const r = spawnSync(
    'npx',
    ['jest', '--json', '--silent', '-t', 'link scaduto', FILE_TEST],
    {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      shell: process.platform === 'win32',
    }
  );
  try {
    const j = JSON.parse(r.stdout);
    return j.testResults.flatMap(t =>
      t.assertionResults.map(a => ({ titolo: a.title, stato: a.status }))
    );
  } catch {
    return null;
  }
};

export const criteri = {
  C8: {
    leggi() {
      const f = nome => join(VERIFICA_DIR, nome);
      const build = esiste(f('build.json'))
        ? JSON.parse(leggi(f('build.json')))
        : null;
      const eas = build
        ? JSON.parse(esegui('npx', ['eas', 'build:view', build.id, '--json']))
        : null;
      return {
        mancanti: FILE_PROVA.filter(n => !esiste(f(n))),
        dump: {
          it: esiste(f('link-scaduto-it.xml'))
            ? leggi(f('link-scaduto-it.xml'))
            : '',
          en: esiste(f('link-scaduto-en.xml'))
            ? leggi(f('link-scaduto-en.xml'))
            : '',
          caldo: esiste(f('link-scaduto-caldo-it.xml'))
            ? leggi(f('link-scaduto-caldo-it.xml'))
            : '',
        },
        log: esiste(f('link-scaduto.log')) ? leggi(f('link-scaduto.log')) : '',
        hash: Object.fromEntries(
          FILE_CON_HASH.filter(n => esiste(f(n))).map(n => [
            n,
            sha256File(f(n)),
          ])
        ),
        versionCode: eas?.appBuildVersion ?? null,
        attesi: Object.fromEntries(
          ['it', 'en'].map(l => {
            const src = leggi(percorso('src', 'locales', `${l}.ts`));
            return [
              l,
              [
                testoTraduzione(src, 'auth.linkExpired.title'),
                testoTraduzione(src, 'auth.linkExpired.reset'),
              ].map(t => (t ? normalizzaSpazi(t) : t)),
            ];
          })
        ),
        jest: eseguiJest(),
      };
    },
    verifica({ mancanti, dump, log, hash, versionCode, attesi, jest }) {
      if (mancanti.length) return `manca ${mancanti.join(', ')}`;
      if (!versionCode)
        return 'versionCode della build di build.json (C10) non letto';
      for (const l of ['it', 'en'])
        if (attesi[l].some(t => !t))
          return `testo auth.linkExpired non trovato in src/locales/${l}.ts`;

      const controllaDump = (nome, xml, lingua) => {
        const nodi = nodiDump(xml);
        for (const t of attesi[lingua]) {
          const n = nodi.find(v => v.testo === t);
          if (!n) return `${nome}: a schermo manca «${t.slice(0, 50)}…»`;
          if (n.pkg !== PACKAGE)
            return `${nome}: «${t.slice(0, 30)}…» viene da ${n.pkg || 'un pacchetto ignoto'}, non da ${PACKAGE}`;
        }
        const altra = lingua === 'it' ? 'en' : 'it';
        const intruso = attesi[altra].find(t => nodi.some(v => v.testo === t));
        if (intruso)
          return `${nome}: contiene il testo ${altra} «${intruso.slice(0, 30)}…»`;
        return null;
      };
      const dumpErr =
        controllaDump('link-scaduto-it.xml', dump.it, 'it') ??
        controllaDump('link-scaduto-en.xml', dump.en, 'en') ??
        controllaDump('link-scaduto-caldo-it.xml', dump.caldo, 'it');
      if (dumpErr) return dumpErr;

      const sezioni = sezioniLog(log);
      for (const g of GIRI) {
        const s = sezioni[g.nome];
        if (!s) return `link-scaduto.log: manca il giro ${g.nome}`;
        if (!/versionName=1\.3\.0\b/.test(s))
          return `giro ${g.nome}: versionName 1.3.0 assente`;
        if (!new RegExp(`versionCode=${versionCode}\\b`).test(s))
          return `giro ${g.nome}: versionCode diverso da ${versionCode} (build di C10)`;
        if (/DEBUGGABLE/.test(s)) return `giro ${g.nome}: pacchetto DEBUGGABLE`;
        if (!/Status: ok/.test(s))
          return `giro ${g.nome}: am start senza Status: ok`;
        if (g.freddo && !/LaunchState: COLD/.test(s))
          return `giro ${g.nome}: manca LaunchState: COLD`;
        if (
          !g.freddo &&
          !/delivered to currently running top-most instance/.test(s)
        )
          return `giro ${g.nome}: l'intent non risulta consegnato all'istanza già aperta`;
        if (!new RegExp(`^lingua: ${g.lingua}\\b`, 'm').test(s))
          return `giro ${g.nome}: lingua dell'app non ${g.lingua}`;
        const start = s
          .split('\n')
          .find(
            r =>
              /START u0 \{act=android\.intent\.action\.VIEW/.test(r) &&
              r.includes('dat=rahitalia://reset-password') &&
              r.includes(`cmp=${PACKAGE}/.MainActivity`)
          );
        if (!start)
          return `giro ${g.nome}: nessuna riga START con dat=rahitalia://reset-password e cmp=${PACKAGE}/.MainActivity`;
      }
      const dichiarati = Object.fromEntries(
        [...log.matchAll(/^sha256 ([0-9a-f]{64}) (\S+)\s*$/gm)].map(m => [
          m[2],
          m[1],
        ])
      );
      for (const n of FILE_CON_HASH) {
        if (!dichiarati[n]) return `link-scaduto.log: manca lo sha256 di ${n}`;
        if (dichiarati[n] !== hash[n])
          return `${n}: sha256 diverso da quello calcolato sul dispositivo`;
      }

      if (!jest) return 'Jest non eseguito o output illeggibile';
      const rossi = jest.filter(t => t.stato === 'failed');
      if (rossi.length) return `test Jest rosso: ${rossi[0].titolo}`;
      for (const titolo of TEST_ATTESI) {
        const t = jest.find(v => v.titolo.startsWith(titolo));
        if (!t) return `test Jest assente: «${titolo}»`;
        if (t.stato !== 'passed') return `test Jest non verde: «${titolo}»`;
      }
      return null;
    },
  },
};
