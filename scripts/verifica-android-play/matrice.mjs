// C47 (fase F12): matrice dei dispositivi sulla build di C10, con le azioni nominate dell'emendamento R28.
// Prove in docs/store/google-play/verifica/:
//   matrice-<avd>-<variante>-<schermata>.png  una schermata per casella della matrice
//   matrice-<avd>-<variante>.log              `wm size`, `wm density`, `font_scale: <x>`, `orientamento:
//                                             verticale|orizzontale`, `boot_id: <id>`, `navigation_mode: <n>`
//                                             (Pixel_8), `Night mode: yes` (variante scura)
//   matrice-chiama-scrivi-<api>.log           logcat del tocco su «Chiama» e «Scrivi» di Chi siamo; se nessuna
//                                             app gestisce il link, dump `matrice-chiama-scrivi-<api>-<tel|mailto>.xml`
//   matrice-<avd>-azione<N>-<nome>*.{png,xml,log}  le 6 azioni nominate R28-R29 (nomi in testi-criteri.mjs)
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
const AVD_API = { 29: 'phone_small_29', 36: 'pixel_8' };
const [CHIUDI, HOME_2, TASTIERA, MAPPA_2, FINESTRA, SFONDI] = AZIONI_C47;
const MODALE_DONARE = ['Come Donare', 'How to Donate'];
const INVIO_REGISTRAZIONE = ['Registrati', 'Sign up'];
const PICCOLO_2 = { ...PICCOLO, scala: '2.0' };
/** Azione 6 (C94): finestra → segno nel dump che è davvero aperta (titolo o testID). */
const FINESTRE_SFONDI = {
  storia: ['La Nostra Storia', 'Our Story'],
  'come-donare': MODALE_DONARE,
  'avviso-partner': ['partner-disclosure-content'],
};

const riga = (log, chiave) =>
  new RegExp(`^${chiave}:\\s*(.+?)\\s*$`, 'm').exec(log ?? '')?.[1] ?? null;
const contiene = (testi, voci) => voci.some(v => testi.includes(v));
/** Nodi di un dump di uiautomator, nell'ordine del documento. */
export const nodiDump = xml =>
  [...(xml ?? '').matchAll(/<node\b[^>]*>/g)].map(([n]) => {
    const att = k => new RegExp(`\\s${k}="([^"]*)"`).exec(n)?.[1] ?? '';
    const [x1 = 0, y1 = 0, x2 = 0, y2 = 0] = (
      att('bounds').match(/\d+/g) ?? []
    ).map(Number);
    return {
      classe: att('class'),
      vuoto: !att('text') && !att('content-desc'),
      fuoco: att('focused') === 'true',
      cliccabile: att('clickable') === 'true',
      area: Math.max(0, x2 - x1) * Math.max(0, y2 - y1),
    };
  });
const senzaImmagine = (immagini, nome) =>
  immagini.includes(nome) ? '' : `manca l'immagine ${nome}`;

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

// (1) tocco sulla X di Come Donare su API 29 e 36 → dump senza la finestra.
const controllaChiudi = (file, immagini) => {
  for (const api of API_C47) {
    const nome = `matrice-${AVD_API[api]}-${CHIUDI}`;
    const dump = file[`${nome}.xml`];
    if (!dump)
      return `manca ${nome}.xml (dump dopo il tocco sulla X, API ${api})`;
    const testi = testiDump(dump);
    if (!testi.length) return `${nome}.xml: dump vuoto`;
    if (contiene(testi, MODALE_DONARE))
      return `${nome}.xml: la finestra «Come Donare» è ancora aperta`;
    const foto = senzaImmagine(immagini, `${nome}.png`);
    if (foto) return foto;
  }
  return '';
};
// (2) Home scorsa fino a «Risultati» e «Supporta» a scala 2,0 su Phone_Small_29.
const controllaHome2 = (file, immagini) => {
  const nome = `matrice-phone_small_29-${HOME_2}`;
  const home = Object.entries(file)
    .filter(([n]) => n.startsWith(`${nome}-`) && n.endsWith('.xml'))
    .flatMap(([, x]) => testiDump(x));
  if (
    !contiene(home, ['Risultati', 'Results']) ||
    !contiene(home, ['Supporta', 'Support'])
  )
    return `${nome}-*.xml: la Home a scala 2,0 non arriva a «Risultati» e «Supporta»`;
  if (!immagini.some(i => i.startsWith(`${nome}-`)))
    return `manca l'immagine ${nome}-*.png`;
  return controllaLogVariante(`${nome}.log`, file[`${nome}.log`], PICCOLO_2);
};
// (3) Registrazione a scala 2,0 su Phone_Small_29, fuoco sull'ultimo campo e tastiera aperta → invio raggiungibile.
const controllaTastiera = (file, immagini) => {
  const nome = `matrice-phone_small_29-${TASTIERA}`;
  const dump = file[`${nome}.xml`];
  if (!dump || !contiene(testiDump(dump), INVIO_REGISTRAZIONE))
    return `${nome}.xml: il pulsante d'invio non è raggiungibile con la tastiera aperta`;
  const campi = nodiDump(dump).filter(
    n => n.classe === 'android.widget.EditText'
  );
  if (!campi.at(-1)?.fuoco)
    return `${nome}.xml: il fuoco non è sull'ultimo campo`;
  const log = file[`${nome}.log`];
  if (!/mInputShown=true/.test(log ?? ''))
    return `${nome}.log: tastiera non aperta (manca mInputShown=true)`;
  return (
    controllaLogVariante(`${nome}.log`, log, PICCOLO_2) ||
    senzaImmagine(immagini, `${nome}.png`)
  );
};
// (4) MapLocationModal con la scheda più lunga a scala 2,0 su Pixel_8 e Phone_Small_29 (il resto lo giudica il critico).
const controllaMappa2 = (file, immagini) => {
  for (const [avd, schermo] of [
    ['pixel_8', PIXEL_8],
    ['phone_small_29', PICCOLO],
  ]) {
    const nome = `matrice-${avd}-${MAPPA_2}`;
    const errore =
      controllaLogVariante(`${nome}.log`, file[`${nome}.log`], {
        ...schermo,
        scala: '2.0',
      }) || senzaImmagine(immagini, `${nome}.png`);
    if (errore) return errore;
  }
  return '';
};
// (5) Pixel_8 con la finestra piccola, poi ingrandita SENZA riavvio → Home.
const controllaFinestra = (file, immagini) => {
  const nome = `matrice-pixel_8-${FINESTRA}`;
  const log = file[`${nome}.log`] ?? '';
  if (!/^metodo:\s*(schermo diviso|wm size ridotto)\s*$/m.test(log))
    return `${nome}.log: manca «metodo: schermo diviso» o «metodo: wm size ridotto»`;
  const avvii = [...log.matchAll(/^boot_id:\s*(\S+)/gm)].map(m => m[1]);
  if (avvii.length < 2 || new Set(avvii).size !== 1)
    return `${nome}.log: servono due boot_id uguali (piccola e ingrandita, senza riavvio)`;
  if (log.slice(log.lastIndexOf('Physical size')).includes('Override size'))
    return `${nome}.log: l'ultimo \`wm size\` ha ancora l'override (finestra non ingrandita)`;
  const manca = ['piccola', 'ingrandita'].find(
    s => !immagini.includes(`${nome}-${s}.png`)
  );
  return manca ? `manca l'immagine ${nome}-${manca}.png` : '';
};
// (6) C94: Storia, Come Donare e avviso partner aperti → nessun nodo cliccabile vuoto grande come lo schermo.
const controllaSfondi = (file, immagini) => {
  for (const [finestra, segni] of Object.entries(FINESTRE_SFONDI)) {
    const coda = `-${SFONDI}-${finestra}.xml`;
    const nome = Object.keys(file).find(
      n => n.startsWith('matrice-') && n.endsWith(coda)
    );
    if (!nome) return `manca matrice-<avd>${coda}`;
    if (!segni.some(s => file[nome].includes(s)))
      return `${nome}: la finestra non è aperta nel dump`;
    const nodi = nodiDump(file[nome]);
    const schermo = Math.max(0, ...nodi.map(n => n.area));
    if (nodi.some(n => n.cliccabile && n.vuoto && n.area >= 0.9 * schermo))
      return `${nome}: nodo cliccabile senza testo né descrizione grande come lo schermo`;
    const foto = senzaImmagine(immagini, nome.replace(/\.xml$/, '.png'));
    if (foto) return foto;
  }
  return '';
};
const controllaAzioni = (file, immagini) =>
  controllaChiudi(file, immagini) ||
  controllaHome2(file, immagini) ||
  controllaTastiera(file, immagini) ||
  controllaMappa2(file, immagini) ||
  controllaFinestra(file, immagini) ||
  controllaSfondi(file, immagini);

export const C47 = {
  leggi() {
    const nomi = esiste(VERIFICA_DIR)
      ? readdirSync(VERIFICA_DIR).filter(n => n.startsWith('matrice-'))
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
