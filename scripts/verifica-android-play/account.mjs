// C30 (R21-R23): account fuori dalla barra. Statico sul codice (intestazione unica montata dal navigatore,
// inset superiore solo lì, niente scheda Profilo) e sui documenti per Google e per la sede USA.
import { elencaFile, leggi, percorso, rel } from './comune.mjs';
import { caricaLocale, leggiSezioni } from './documenti-cancellazione.mjs';

const DOC_PLAY = 'docs/store/google-play';
const NAVIGATORE = 'src/navigation/BottomTabNavigator.tsx';
const INTESTAZIONE = 'src/navigation/TabHeader.tsx';
export const RADICI_C30 = [
  'src/features/home/screens/HomeScreen.tsx',
  'src/features/impact/screens/ImpactTabScreen.tsx',
  'src/features/actions/screens/ContributeTabScreen.tsx',
];
export const FRASI_VIETATE_C30 = [
  'quarta scheda',
  '4ª scheda',
  'fourth tab',
  'barra in basso',
  'bottom bar',
  'scheda profilo',
  'profile tab',
];
// Prima di cercare: via tag, virgolette e asterischi, spazi compattati («la scheda <strong>Profilo</strong>»).
export const normalizzaC30 = testo =>
  testo
    .replace(/<[^>]+>/g, ' ')
    .replace(/[«»"*]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
export const frasiVietate = testo =>
  FRASI_VIETATE_C30.filter(fr => normalizzaC30(testo).includes(fr));

const sorgentiApp = () =>
  elencaFile(
    percorso('src'),
    p =>
      /\.(ts|tsx)$/.test(p) &&
      !/[\\/](__tests__|__mocks__)[\\/]|\.(test|spec)\.tsx?$/.test(p)
  ).map(p => ({ nome: rel(p), testo: leggi(p) }));

const sezioneMd = (testo, titolo) => {
  const da = testo.indexOf(titolo);
  if (da < 0) return null;
  const resto = testo.slice(da + titolo.length);
  const fine = resto.search(/^## /m);
  return fine < 0 ? resto : resto.slice(0, fine);
};

const etichette = l => ({
  ospite: l?.auth?.login?.title ?? null,
  collegato: l?.auth?.profile?.title ?? null,
  home: l?.navigation?.home ?? null,
  profilo: l?.navigation?.profile ?? null,
});

export const staticoC30 = {
  leggi() {
    const sorgenti = sorgentiApp();
    const con = re => sorgenti.filter(f => re.test(f.testo)).map(f => f.nome);
    const file = elencaFile(percorso(DOC_PLAY), p =>
      /\.(md|html)$/.test(p)
    ).map(p => ({ nome: rel(p), testo: leggi(p) }));
    const doc = n => file.find(f => f.nome === `${DOC_PLAY}/${n}`)?.testo;
    const html = (n, id) => {
      const t = doc(n);
      return t == null ? null : (leggiSezioni(t)[id]?.html ?? null);
    };
    const play = doc('play-console-risposte.md');
    return {
      importaIntestazione: con(/import[^;]*\bTabHeader\b[^;]*from/),
      testID: con(/account-header-button/),
      schedaProfilo: con(/\bProfileTab\b/),
      schedaAzioni: con(/\bInfoTab\b/),
      radici: RADICI_C30.map(nome => {
        const testo = sorgenti.find(f => f.nome === nome)?.testo ?? null;
        return {
          nome,
          edges:
            testo == null
              ? null
              : [...testo.matchAll(/edges=\{\[([^\]]*)\]\}/g)].map(m => m[1]),
          insetsTop: testo != null && /insets\.top/.test(testo),
        };
      }),
      locali: {
        it: etichette(caricaLocale('src/locales/it.ts')),
        en: etichette(caricaLocale('src/locales/en.ts')),
      },
      file,
      accessoPlay: play == null ? null : sezioneMd(play, "## Accesso all'app"),
      passi: {
        it: html('web/elimina-account.html', 'dall-app'),
        en: html('web/delete-account.html', 'in-the-app'),
      },
      runbook: doc('rilascio.md') ?? null,
    };
  },
  verifica(d) {
    return verificaCodice(d) || verificaDocumenti(d);
  },
};

const verificaCodice = d => {
  if (!d.schedaAzioni?.length) return 'nessun InfoTab in src/ (lettore rotto?)';
  if (d.schedaProfilo?.length)
    return `ProfileTab ancora in: ${d.schedaProfilo.join(', ')}`;
  if (d.importaIntestazione?.join() !== NAVIGATORE)
    return `TabHeader importato da: ${d.importaIntestazione?.join(', ') || 'nessuno'} (atteso solo ${NAVIGATORE})`;
  if (d.testID?.join() !== INTESTAZIONE)
    return `account-header-button in: ${d.testID?.join(', ') || 'nessuno'} (atteso solo ${INTESTAZIONE})`;
  for (const r of d.radici ?? []) {
    if (!r.edges?.length)
      return `${r.nome}: nessun edges trovato (lettore rotto?)`;
    if (r.edges.some(e => /['"]top['"]/.test(e)))
      return `${r.nome}: 'top' negli edges (l'inset superiore spetta all'intestazione)`;
    if (r.insetsTop) return `${r.nome}: usa insets.top`;
  }
  if ((d.radici ?? []).length !== RADICI_C30.length)
    return 'radici delle schede incomplete';
  for (const lingua of ['it', 'en']) {
    const l = d.locali?.[lingua];
    if (!l?.home)
      return `navigation.home assente in ${lingua}.ts (lettore rotto?)`;
    if (l.profilo != null) return `navigation.profile ancora in ${lingua}.ts`;
    if (!l.ospite || !l.collegato)
      return `auth.login.title o auth.profile.title assente in ${lingua}.ts`;
  }
  return '';
};

const verificaDocumenti = d => {
  const { it, en } = d.locali;
  if (!d.file?.length)
    return `nessun documento in ${DOC_PLAY} (lettore rotto?)`;
  const vietate = d.file.flatMap(f =>
    frasiVietate(f.testo).map(fr => `${f.nome}: «${fr}»`)
  );
  if (vietate.length)
    return `istruzioni con la vecchia scheda: ${vietate.join(', ')}`;
  const play = d.accessoPlay;
  if (play == null)
    return "play-console-risposte.md senza «## Accesso all'app»";
  for (const atteso of [`«${it.ospite}»`, `«${en.ospite}»`, 'in alto a destra'])
    if (!play.includes(atteso))
      return `play-console-risposte.md, Accesso all'app: manca ${atteso}`;
  const PASSI = [
    [
      'it',
      'web/elimina-account.html#dall-app',
      it,
      'in alto a destra',
      'icona',
    ],
    ['en', 'web/delete-account.html#in-the-app', en, 'top right', 'icon'],
  ];
  for (const [lingua, dove, l, posizione, icona] of PASSI) {
    const sezione = d.passi?.[lingua];
    if (sezione == null) return `${dove} assente`;
    for (const atteso of [
      `<strong>${l.ospite}</strong>`,
      `<strong>${l.collegato}</strong>`,
      posizione,
      icona,
    ])
      if (!sezione.includes(atteso)) return `${dove}: manca ${atteso}`;
  }
  const runbook = d.runbook;
  if (runbook == null) return `${DOC_PLAY}/rilascio.md assente`;
  if (
    !/sostitu/i.test(runbook) ||
    !runbook.includes('web/elimina-account.html') ||
    !runbook.includes('web/delete-account.html')
  )
    return "rilascio.md (C20) senza l'istruzione di sostituire le pagine web/ già consegnate";
  return '';
};
