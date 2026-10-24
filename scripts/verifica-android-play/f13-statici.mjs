// Controlli statici sul codice dei criteri R24-R26 (fase F13 del contratto android-play): C56, C58, C65, C73,
// C77, C82. Ogni statico ha un positivo noto (scritto nel criterio) che a `63352bc` lo fa fallire.
import {
  ROOT,
  elencaFile,
  esegui,
  esiste,
  leggi,
  percorso,
  rel,
} from './comune.mjs';
import { leggiControprova, shaFile } from './titoli-jest.mjs';

const leggiSeEsiste = p => (esiste(percorso(p)) ? leggi(percorso(p)) : null);
const rigaDi = (testo, indice) => testo.slice(0, indice).split('\n').length;
const sorgente = p =>
  /\.(ts|tsx|js|jsx)$/.test(p) && !/__tests__|\.test\./.test(p);
const sorgentiApp = () =>
  [...elencaFile(percorso('src'), sorgente), percorso('App.tsx')]
    .filter(esiste)
    .map(p => ({ nome: rel(p), testo: leggi(p) }));

/** Testo fra la parentesi aperta in `da` e quella che la chiude (stringhe con parentesi non gestite). */
export const bilanciato = (testo, da) => {
  const apre = '([{';
  const chiude = ')]}';
  let livello = 0;
  for (let i = da; i < testo.length; i++) {
    if (apre.includes(testo[i])) livello++;
    else if (chiude.includes(testo[i]) && --livello === 0)
      return testo.slice(da, i + 1);
  }
  return testo.slice(da);
};

// --- C56: filtro degli anni della mappa ---------------------------------------------------------------
export const MAPPA_C56 = 'src/features/impact/screens/MapModalScreen.tsx';
const NOME_FILTRO = /[\w]*(?:[Ff]ilter|[Yy]ear)[\w]*/;

/** Blocchi di stile del filtro: voci dello StyleSheet e array `style={[…]}` che le richiamano. */
export const stiliDelFiltro = testo => {
  const blocchi = [];
  for (const m of testo.matchAll(
    new RegExp(`\\b(${NOME_FILTRO.source})\\s*:\\s*\\{`, 'g')
  ))
    blocchi.push({
      riga: rigaDi(testo, m.index),
      testo: bilanciato(testo, m.index + m[0].length - 1),
    });
  for (const m of testo.matchAll(
    new RegExp(`styles\\.${NOME_FILTRO.source}`, 'g')
  )) {
    const inizio = testo.lastIndexOf('style={', m.index);
    if (inizio < 0) continue;
    const blocco = bilanciato(testo, inizio + 'style='.length);
    if (inizio + 'style='.length + blocco.length > m.index)
      blocchi.push({ riga: rigaDi(testo, inizio), testo: blocco });
  }
  return blocchi;
};

export const staticoC56 = {
  leggi: () => ({ testo: leggiSeEsiste(MAPPA_C56) }),
  verifica({ testo }) {
    if (testo == null) return `${MAPPA_C56} assente`;
    const m = /scaleSpacing\(\s*56\s*\)/.exec(testo);
    if (m)
      return `scaleSpacing(56) ancora in ${MAPPA_C56}:${rigaDi(testo, m.index)}`;
    const conTop = stiliDelFiltro(testo).find(b => /\btop\s*:/.test(b.testo));
    if (conTop)
      return `top calcolato nello stile del filtro (${MAPPA_C56}:${conTop.riga})`;
    return '';
  },
};

// --- C58: elenco dei punti multiriga --------------------------------------------------------------------
export const SONDA_C58 = 'scripts/verifica-android-play/conta-multiriga.py';
export const ELENCO_C58 = 'docs/store/google-play/verifica/testo-multiriga.md';

/** Uscita della sonda: `totale N in M file; positivo noto D6 visto: True` e poi `<n> <file>` per riga. */
export const leggiUscitaSonda = uscita => {
  const [testa = '', ...righe] = uscita.trim().split(/\r?\n/);
  const m =
    /^totale (\d+) in (\d+) file; positivo noto D6 visto: (True|False)/.exec(
      testa
    );
  if (!m) return null;
  return {
    totale: Number(m[1]),
    noto: m[3] === 'True',
    file: righe
      .map(r => /^(\d+) (\S+)$/.exec(r.trim()))
      .filter(Boolean)
      .map(x => ({ n: Number(x[1]), file: x[2] })),
  };
};

export const staticoC58 = {
  leggi: () => ({
    sonda: leggiUscitaSonda(esegui('python', [percorso(SONDA_C58), ROOT])),
    elenco: leggiSeEsiste(ELENCO_C58),
  }),
  verifica({ sonda, elenco }) {
    if (!sonda) return 'uscita della sonda conta-multiriga illeggibile';
    if (!sonda.noto)
      return 'la sonda non vede il positivo noto (MapLocationModal): sonda rotta';
    if (elenco == null) return `${ELENCO_C58} assente`;
    const righe = elenco.split(/\r?\n/);
    for (const { n, file } of sonda.file) {
      const r = righe.find(x => x.includes(`\`${file}\``));
      if (!r) return `${file} (${n} punti) manca da ${ELENCO_C58}`;
      if (!r.split('|').some(c => c.trim() === String(n)))
        return `${file}: in ${ELENCO_C58} il numero dei punti non è ${n}`;
      if (!/C47|residuo non fotografato/i.test(r))
        return `${file}: la riga non dice né C47 né «residuo non fotografato»`;
    }
    const tot = /totale\D*(\d+)/i.exec(elenco);
    if (!tot || Number(tot[1]) !== sonda.totale)
      return `totale di ${ELENCO_C58} diverso dalla sonda (${sonda.totale})`;
    return '';
  },
};

// --- C65: errori d'invio solo da AuthSubmitError ---------------------------------------------------------
const SCHERMATE = 'src/features/auth/screens';
export const FILE_C65 = {
  Accesso: `${SCHERMATE}/LoginScreen.tsx`,
  Registrazione: `${SCHERMATE}/SignUpScreen.tsx`,
  'Password dimenticata': `${SCHERMATE}/ForgotPasswordScreen.tsx`,
  'Reimposta password': `${SCHERMATE}/ResetPasswordScreen.tsx`,
  'Completa profilo': `${SCHERMATE}/CompleteProfileScreen.tsx`,
  'Modifica profilo': `${SCHERMATE}/ProfileEditScreen.tsx`,
  'Elimina account': `${SCHERMATE}/DeleteAccountScreen.tsx`,
  'Ri-consenso': `${SCHERMATE}/ReConsentScreen.tsx`,
  Profilo: `${SCHERMATE}/ProfileScreen.tsx`,
  'Reinvio conferma': 'src/features/auth/components/ConfirmationResend.tsx',
};
// Errore d'invio = variabile che finisce in Error/error. Esclusi gli errori di LETTURA del profilo
// (`profileError`, `profileReadError`): arrivano col caricamento, non da un invio della persona.
const ERRORE_INVIO = /\b(?!profile)[A-Za-z_.]*?[Ee]rror\b/;

/** Righe dove un errore d'invio è mostrato come testo figlio di un elemento JSX. */
export const erroriMostrati = testo => {
  const righe = testo.split(/\r?\n/);
  const trovati = [];
  righe.forEach((r, i) => {
    const t = r.trim();
    const prima = righe
      .slice(0, i)
      .reverse()
      .find(x => x.trim());
    const figlio =
      t.startsWith('{') &&
      t.endsWith('}') &&
      /[^/]>$/.test(prima?.trim() ?? '');
    const inLinea = />\s*\{[^{}]*\}\s*</.test(t);
    if ((figlio || inLinea) && ERRORE_INVIO.test(t)) trovati.push(i + 1);
  });
  return trovati;
};

export const staticoC65 = {
  leggi: () => ({
    file: Object.fromEntries(
      Object.values(FILE_C65).map(f => [f, leggiSeEsiste(f)])
    ),
  }),
  verifica({ file }) {
    for (const f of Object.values(FILE_C65)) {
      if (file?.[f] == null) return `${f} assente`;
      const [riga] = erroriMostrati(file[f]);
      if (riga)
        return `errore d'invio mostrato fuori da AuthSubmitError: ${f}:${riga}`;
    }
    return '';
  },
};

// --- C73: tempo massimo dell'attesa OTA -----------------------------------------------------------------
const NOME_TEMPO =
  /^(?=.*(?:OTA|AGGIORNAMENTO|UPDATE))(?=.*(?:MAX|MASSIM|TIMEOUT|ATTESA|SCADENZA|LIMITE))[A-Z0-9_]+$/;
const DICHIARAZIONE =
  /\bconst\s+([A-Z][A-Z0-9_]*)\s*=\s*([\d_]+(?:\s*\*\s*[\d_]+)*)\s*;/g;

/** Costanti nominate per il tempo massimo dell'attesa OTA, in millisecondi, usate almeno una volta. */
export const tempiOta = file =>
  file.flatMap(({ nome, testo }) =>
    [...testo.matchAll(DICHIARAZIONE)]
      .filter(m => NOME_TEMPO.test(m[1]))
      .filter(
        m => (testo.match(new RegExp(`\\b${m[1]}\\b`, 'g')) ?? []).length > 1
      )
      .map(m => {
        const valore = m[2]
          .split('*')
          .reduce((a, x) => a * Number(x.replace(/_/g, '').trim()), 1);
        const secondi = /_(S|SEC|SECONDI)$/.test(m[1]);
        return { nome, costante: m[1], ms: secondi ? valore * 1000 : valore };
      })
  );

export const staticoC73 = {
  leggi() {
    const registro = leggiControprova('C27');
    return {
      tempi: tempiOta(sorgentiApp().filter(f => /expo-updates/.test(f.testo))),
      c27: {
        registro,
        shaAttuali: shaFile(Object.keys(registro?.fileTest ?? {})),
      },
    };
  },
  verifica({ tempi, c27 }) {
    if (!tempi?.length)
      return "nessuna costante nominata per il tempo massimo dell'attesa OTA";
    const troppo = tempi.find(t => !(t.ms > 0 && t.ms <= 30_000));
    if (troppo)
      return `${troppo.costante} (${troppo.nome}) = ${troppo.ms} ms, atteso fra 1 e 30000`;
    const file = Object.keys(c27?.registro?.fileTest ?? {});
    if (!file.length)
      return 'controprova di C27 mancante: i suoi test non si possono confrontare';
    const cambiato = file.find(
      f => c27.shaAttuali?.[f] !== c27.registro.fileTest[f]
    );
    if (cambiato)
      return `${cambiato} cambiato: i test di C27 devono restare invariati`;
    return '';
  },
};

// --- C77: oracolo tautologico del test visivo -------------------------------------------------------------
export const VISUAL_C77 = 'src/__tests__/visual/visual-diff.test.tsx';
const TAUTOLOGIA =
  /expect\(\s*[\w.]*lineCount\s*\)\s*\.toBe\(\s*testCase\.lines\s*\)/;

export const staticoC77 = {
  leggi: () => ({ testo: leggiSeEsiste(VISUAL_C77) }),
  verifica({ testo }) {
    if (testo == null) return '';
    const m = TAUTOLOGIA.exec(testo);
    return m
      ? `asserzione tautologica in ${VISUAL_C77}:${rigaDi(testo, m.index)}`
      : '';
  },
};

// --- C82: app in chiaro ----------------------------------------------------------------------------------
// Chi può cambiare il tema: il provider stesso e l'adattatore di `useTheme` (che lo riespone).
export const ESENTI_C82 = [
  'src/shared/theme/UniversalTheme.tsx',
  'src/shared/hooks/useTheme.tsx',
];
const TEMI_AMMESSI = ['light', 'system'];

export const staticoC82 = {
  leggi: () => ({
    config: leggiSeEsiste('app.config.js'),
    file: sorgentiApp(),
  }),
  verifica({ config, file }) {
    if (config == null) return 'app.config.js assente';
    const stili = [
      ...config.matchAll(/userInterfaceStyle\s*:\s*['"]?([\w-]+)/g),
    ].map(m => m[1]);
    if (!stili.length) return 'userInterfaceStyle assente in app.config.js';
    if (stili.some(s => s !== 'light'))
      return `userInterfaceStyle = ${stili.join(', ')}, atteso solo 'light'`;
    for (const { nome, testo } of file ?? []) {
      if (!ESENTI_C82.includes(nome)) {
        const m = /\b(setTheme|toggleTheme)\s*\(/.exec(testo);
        if (m) return `${m[1]} chiamato in ${nome}:${rigaDi(testo, m.index)}`;
      }
      for (const p of testo.matchAll(/<UniversalThemeProvider\b([^>]*)>/g)) {
        if (!/\binitialTheme\b/.test(p[1])) continue;
        const v = /\binitialTheme\s*=\s*\{?\s*['"](\w+)['"]/.exec(p[1]);
        if (!v || !TEMI_AMMESSI.includes(v[1]))
          return `UniversalThemeProvider con initialTheme ${v?.[1] ?? 'non letterale'} in ${nome}:${rigaDi(testo, p.index)}`;
      }
    }
    return '';
  },
};
