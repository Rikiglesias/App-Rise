// C47 (fase F12): matrice dei dispositivi sulla build di C10, con le azioni nominate dell'emendamento R28.
// Prove in docs/store/google-play/verifica/:
//   matrice-<avd>-<variante>-<schermata>.png  una schermata per casella della matrice
//   matrice-<avd>-<variante>.log              `wm size`, `wm density`, `font_scale: <x>`, `orientamento:
//                                             verticale|orizzontale`, `boot_id: <id>`, `navigation_mode: <n>`
//                                             (Pixel_8), `Night mode: yes` (variante scura)
//   matrice-chiama-scrivi-<api>.log           logcat del tocco su «Chiama» e «Scrivi» di Chi siamo; se nessuna
//                                             app gestisce il link, dump `matrice-chiama-scrivi-<api>-<tel|mailto>.xml`
//   c47-<n>-<azione>*.{png,xml,log}           le azioni nominate (nomi in testi-criteri.mjs)
//   visivo-C47.txt                            verdetto del critico su TUTTE le immagini (nulla tagliato, coperto,
//                                             sovrapposto o fuori schermo; pulsante account sulle 3 radici)
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  VERIFICA_DIR,
  controllaSchermo,
  esiste,
  leggi,
  testiDump,
} from './comune.mjs';
import { AZIONI_C47 } from './testi-criteri.mjs';
import { controllaVerdetto, leggiVerdetto } from './visivo.mjs';

const SCHERMATE = [
  'home',
  'impatto',
  'dettaglio',
  'azioni-partner',
  'azioni-donazioni',
  'mappa',
  'profilo-ospite',
  'accesso',
  'registrazione-tastiera',
];
const PICCOLO = { schermo: '720x1280', densita: 320 };
const PIXEL_8 = { schermo: '1080x2400', densita: 420, scala: '1.0' };
const TABLET = { schermo: '2560x1600', densita: 320, scala: '1.0' };
/** Variante della matrice → atteso nel suo log e schermate richieste. */
export const MATRICE_C47 = {
  'phone_small_29-scala1': { ...PICCOLO, scala: '1.0', schermate: SCHERMATE },
  'phone_small_29-scala2': { ...PICCOLO, scala: '2.0', schermate: SCHERMATE },
  'pixel_8-tre-pulsanti': {
    ...PIXEL_8,
    navigazione: '0',
    schermate: SCHERMATE,
  },
  'pixel_8-scuro': {
    ...PIXEL_8,
    notte: true,
    schermate: ['home', 'azioni', 'accesso'],
  },
  'pixel_tablet_36-verticale': {
    ...TABLET,
    orientamento: 'verticale',
    schermate: SCHERMATE,
  },
  'pixel_tablet_36-orizzontale': {
    ...TABLET,
    orientamento: 'orizzontale',
    schermate: [...SCHERMATE, 'mappa-paese'],
  },
};
const API_C47 = ['29', '36'];
const [CHIUDI, HOME_2, TASTIERA, MAPPA_2, DIVISO] = AZIONI_C47;
const MODALE_DONARE = ['Come Donare', 'How to Donate'];
const INVIO_REGISTRAZIONE = ['Registrati', 'Sign up'];

const riga = (log, chiave) =>
  new RegExp(`^${chiave}:\\s*(.+?)\\s*$`, 'm').exec(log ?? '')?.[1] ?? null;
const contiene = (testi, voci) => voci.some(v => testi.includes(v));

/** Motivo di FAIL del log di una variante della matrice (o di un'azione), o ''. */
export const controllaLogVariante = (nome, log, a) => {
  if (!log) return `manca ${nome}`;
  const schermo = controllaSchermo(log, a.schermo);
  if (schermo) return `${nome}: ${schermo}`;
  if (!new RegExp(`Physical density:\\s*${a.densita}\\b`).test(log))
    return `${nome}: densità diversa da ${a.densita}`;
  if (a.scala && riga(log, 'font_scale') !== a.scala)
    return `${nome}: font_scale ${riga(log, 'font_scale')}, atteso ${a.scala}`;
  if (a.orientamento && riga(log, 'orientamento') !== a.orientamento)
    return `${nome}: orientamento ${riga(log, 'orientamento')}, atteso ${a.orientamento}`;
  if (a.navigazione && riga(log, 'navigation_mode') !== a.navigazione)
    return `${nome}: navigation_mode ${riga(log, 'navigation_mode')}, attesa la navigazione a 3 pulsanti (0)`;
  if (a.notte && !/Night mode:\s*yes/i.test(log))
    return `${nome}: il sistema non è in tema scuro (manca «Night mode: yes»)`;
  if (!riga(log, 'boot_id')) return `${nome}: manca boot_id`;
  return '';
};

const controllaChiamaScrivi = file => {
  for (const api of API_C47) {
    const log = file[`matrice-chiama-scrivi-${api}.log`] ?? '';
    for (const [schema, prova] of [
      ['tel', /\+?\d[\d\s]{6,}\d/],
      ['mailto', /[\w.+-]+@[\w-]+\.[\w.]+/],
    ]) {
      if (new RegExp(`START\\b.*dat=${schema}:`).test(log)) continue;
      const dump = file[`matrice-chiama-scrivi-${api}-${schema}.xml`];
      if (!dump || !testiDump(dump).some(t => prova.test(t)))
        return `API ${api}: né logcat «START … dat=${schema}:» né il dump col messaggio di C23`;
    }
  }
  return '';
};

const controllaAzioni = (file, immagini) => {
  for (const api of API_C47) {
    const dump = file[`${CHIUDI}-${api}.xml`];
    if (!dump) return `manca ${CHIUDI}-${api}.xml (dump dopo il tocco sulla X)`;
    const testi = testiDump(dump);
    if (!testi.length) return `${CHIUDI}-${api}.xml: dump vuoto`;
    if (contiene(testi, MODALE_DONARE))
      return `${CHIUDI}-${api}.xml: la finestra «Come Donare» è ancora aperta`;
  }
  const home = Object.entries(file)
    .filter(([n]) => n.startsWith(`${HOME_2}-`) && n.endsWith('.xml'))
    .flatMap(([, x]) => testiDump(x));
  if (
    !contiene(home, ['Risultati', 'Results']) ||
    !contiene(home, ['Supporta', 'Support'])
  )
    return `${HOME_2}-*.xml: la Home a scala 2,0 non arriva a «Risultati» e «Supporta»`;
  const log2 = controllaLogVariante(`${HOME_2}.log`, file[`${HOME_2}.log`], {
    ...PICCOLO,
    scala: '2.0',
  });
  if (log2) return log2;
  const tastiera = file[`${TASTIERA}.xml`];
  if (!tastiera || !contiene(testiDump(tastiera), INVIO_REGISTRAZIONE))
    return `${TASTIERA}.xml: il pulsante d'invio non è raggiungibile con la tastiera aperta`;
  if (!/mInputShown=true/.test(file[`${TASTIERA}.log`] ?? ''))
    return `${TASTIERA}.log: tastiera non aperta (manca mInputShown=true)`;
  for (const avd of ['pixel_8', 'phone_small_29']) {
    const log = controllaLogVariante(
      `${MAPPA_2}-${avd}.log`,
      file[`${MAPPA_2}-${avd}.log`],
      { ...(avd === 'pixel_8' ? PIXEL_8 : PICCOLO), scala: '2.0' }
    );
    if (log) return log;
  }
  const diviso = file[`${DIVISO}.log`] ?? '';
  if (!/^metodo:\s*(schermo diviso|wm size a metà altezza)\s*$/m.test(diviso))
    return `${DIVISO}.log: manca «metodo: schermo diviso» o «metodo: wm size a metà altezza»`;
  const avvii = [...diviso.matchAll(/^boot_id:\s*(\S+)/gm)].map(m => m[1]);
  if (avvii.length < 2 || new Set(avvii).size !== 1)
    return `${DIVISO}.log: servono due boot_id uguali (prima e dopo, senza riavvio)`;
  const attese = [
    `${HOME_2}-`,
    `${TASTIERA}.png`,
    `${MAPPA_2}-pixel_8.png`,
    `${MAPPA_2}-phone_small_29.png`,
    `${DIVISO}-home.png`,
    `${DIVISO}-accesso.png`,
  ];
  const manca = attese.find(a => !immagini.some(i => i.startsWith(a)));
  return manca
    ? `manca l'immagine ${manca}${manca.endsWith('-') ? '*.png' : ''}`
    : '';
};

export const C47 = {
  leggi() {
    const nomi = esiste(VERIFICA_DIR)
      ? readdirSync(VERIFICA_DIR).filter(n => /^(matrice-|c47-)/.test(n))
      : [];
    return {
      file: Object.fromEntries(
        nomi
          .filter(n => /\.(log|xml)$/.test(n))
          .map(n => [n, leggi(join(VERIFICA_DIR, n))])
      ),
      immagini: nomi.filter(n => n.endsWith('.png')).sort(),
      verdetto: leggiVerdetto('C47'),
    };
  },
  verifica({ file, immagini, verdetto }) {
    for (const [v, a] of Object.entries(MATRICE_C47)) {
      const log = controllaLogVariante(
        `matrice-${v}.log`,
        file[`matrice-${v}.log`],
        a
      );
      if (log) return log;
      const manca = a.schermate.find(
        s => !immagini.includes(`matrice-${v}-${s}.png`)
      );
      if (manca) return `manca matrice-${v}-${manca}.png`;
    }
    const avvio = v =>
      riga(file[`matrice-pixel_tablet_36-${v}.log`], 'boot_id');
    if (avvio('verticale') !== avvio('orizzontale'))
      return 'tablet: boot_id diverso fra verticale e orizzontale (ruotato con un riavvio)';
    return (
      controllaChiamaScrivi(file) ||
      controllaAzioni(file, immagini) ||
      (controllaVerdetto('C47', verdetto, immagini) ?? '')
    );
  },
};
