// C55 (fase F8, contratto android-play R13-R14): «Segnala un problema», parte statica.
import { elencaFile, esiste, leggi, percorso, rel } from './comune.mjs';

const sorgentiApp = () =>
  elencaFile(
    percorso('src'),
    p =>
      /\.(ts|tsx)$/.test(p) &&
      !/[\\/](__tests__|__mocks__)[\\/]|\.(test|spec)\.tsx?$/.test(p)
  ).map(p => ({ nome: rel(p), testo: leggi(p) }));

const leggiSeEsiste = p => (esiste(percorso(p)) ? leggi(percorso(p)) : null);

const RISPOSTE_PLAY = 'docs/store/google-play/play-console-risposte.md';
const INFORMATIVE = ['privacy-policy.html', 'privacy-policy-en.html'];

export const RAMI_C55 = [
  'Accesso',
  'Registrazione',
  'Password dimenticata',
  'Reimposta password',
  'Cambio email',
  'Link di accesso',
  'Elimina account',
];
export const VECCHIA_DICITURA_C55 = 'nessun servizio di segnalazione errori';
export const IMPORT_VIETATI_C55 = [
  'expo-updates',
  'expo-constants',
  'react-native',
];

/** Moduli importati da un file (import statici, dinamici e require). */
export const importDi = testo =>
  [
    ...testo.matchAll(
      /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|^\s*import\s+)['"]([^'"]+)['"]/gm
    ),
  ].map(m => m[1]);

const celleDi = riga =>
  riga
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map(c => c.trim());

/** «Sì» o «No» come prima parola della cella (la ì non è un carattere di parola per `\b` senza flag `u`). */
const inizia = (cella, parola) =>
  new RegExp(`^${parola}(?![\\p{L}])`, 'u').test(cella ?? '');

/**
 * Riga «… → Diagnostica» della tabella dei tipi di dati: le colonne si leggono per NOME dall'ultima intestazione
 * sopra la riga (la tabella vera ha anche «Campi»), non per posizione.
 */
export const rigaDiagnostica = testo => {
  let intestazione = null;
  for (const r of testo.split(/\r?\n/)) {
    if (!r.trim().startsWith('|')) continue;
    const celle = celleDi(r);
    if (celle.includes('Raccolto') && celle.includes('Condiviso')) {
      intestazione = celle;
      continue;
    }
    if (
      /^Informazioni e prestazioni dell['’]app\s*→\s*Diagnostica$/.test(
        celle[0]
      ) &&
      intestazione
    ) {
      const colonne = intestazione;
      return nome => {
        const i = colonne.findIndex(c => c.startsWith(nome));
        return i < 0 ? '' : (celle[i] ?? '');
      };
    }
  }
  return null;
};

export const staticoC55 = {
  leggi() {
    const file = sorgentiApp();
    const helper = file.filter(f =>
      /export\s+(const|function|async function)\s+registraErroreAccount\b/.test(
        f.testo
      )
    );
    const report = file.filter(f =>
      /export\s+(const|function)\s+buildProblemReport\b/.test(f.testo)
    );
    const it = leggi(percorso('src', 'locales', 'it.ts'));
    const en = leggi(percorso('src', 'locales', 'en.ts'));
    return {
      risposte: leggiSeEsiste(RISPOSTE_PLAY),
      informative: Object.fromEntries(
        INFORMATIVE.map(p => [p, leggiSeEsiste(p)])
      ),
      voceIt: /reportProblem\s*:\s*['"]Segnala un problema['"]/.test(it),
      voceEn: /reportProblem\s*:\s*['"]Report a problem['"]/.test(en),
      helper: helper.map(f => ({
        nome: f.nome,
        chiama: /\bmapAuthError\(/.test(f.testo),
      })),
      chiamanti: file
        .filter(
          f =>
            /\bmapAuthError\(/.test(f.testo) &&
            !/export\s+const\s+mapAuthError\b/.test(f.testo) &&
            !helper.includes(f)
        )
        .map(f => f.nome),
      report: report.map(f => ({ nome: f.nome, import: importDi(f.testo) })),
    };
  },
  verifica({
    risposte,
    informative,
    voceIt,
    voceEn,
    helper,
    chiamanti,
    report,
  }) {
    if (risposte == null) return `${RISPOSTE_PLAY} assente`;
    const cella = rigaDiagnostica(risposte);
    if (!cella)
      return "Sicurezza dei dati senza la riga «Informazioni e prestazioni dell'app → Diagnostica» sotto un'intestazione con Raccolto, Condiviso, Facoltativo e Finalità";
    if (!inizia(cella('Raccolto'), 'Sì'))
      return 'Diagnostica: «Raccolto» non è Sì';
    if (!inizia(cella('Condiviso'), 'No'))
      return 'Diagnostica: «Condiviso» non è No';
    if (!inizia(cella('Facoltativo'), 'Sì'))
      return 'Diagnostica: «Facoltativo» non è Sì';
    if (!/(^|[^\p{L}])Analisi([^\p{L}]|$)/u.test(cella('Finalità')))
      return 'Diagnostica: finalità senza «Analisi»';
    if (risposte.includes(VECCHIA_DICITURA_C55))
      return `${RISPOSTE_PLAY} dice ancora «${VECCHIA_DICITURA_C55}»`;
    for (const [p, testo] of Object.entries(informative ?? {})) {
      if (testo == null) return `${p} assente`;
      if (!/id="segnalazione-problemi"/.test(testo))
        return `${p} senza la sezione id="segnalazione-problemi"`;
    }
    if (!voceIt) return 'it.ts senza reportProblem: «Segnala un problema»';
    if (!voceEn) return 'en.ts senza reportProblem: «Report a problem»';
    if (helper?.length !== 1)
      return `registraErroreAccount esportato da ${helper?.length ?? 0} file (atteso 1)`;
    if (!helper[0].chiama)
      return `${helper[0].nome} non chiama mapAuthError (lettore rotto?)`;
    if (chiamanti?.length)
      return `mapAuthError chiamato fuori dall'helper: ${chiamanti.join(', ')}`;
    if (report?.length !== 1)
      return `buildProblemReport esportato da ${report?.length ?? 0} file (atteso 1)`;
    const vietati = report[0].import.filter(
      m => IMPORT_VIETATI_C55.includes(m) || /(^|\/)logger$/.test(m)
    );
    if (vietati.length)
      return `${report[0].nome} importa ${vietati.join(', ')} (deve restare pura)`;
    return '';
  },
};
