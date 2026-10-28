// C22 per C47 (matrice dei dispositivi + azioni R28): dati sintetici, ogni fixture negativa è il positivo con UNA
// mutazione, sul suo ramo.
import { MATRICE_C47 } from './matrice.mjs';
import { AZIONI_C47 } from './testi-criteri.mjs';
import { casi } from './selftest-f13-esterni.mjs';

const [CHIUDI, HOME_2, TASTIERA, MAPPA_2, DIVISO] = AZIONI_C47;
const dump = (...testi) =>
  `<hierarchy>${testi.map(t => `<node text="${t}" content-desc="" />`).join('')}</hierarchy>`;
const logDi = a =>
  [
    `Physical size: ${a.schermo}`,
    `Physical density: ${a.densita}`,
    a.scala && `font_scale: ${a.scala}`,
    a.orientamento && `orientamento: ${a.orientamento}`,
    a.navigazione && `navigation_mode: ${a.navigazione}`,
    a.notte && 'Night mode: yes',
    'boot_id: b1',
  ]
    .filter(Boolean)
    .join('\n');
const PICCOLO_2 = logDi({ schermo: '720x1280', densita: 320, scala: '2.0' });

const FILE = {
  ...Object.fromEntries(
    Object.entries(MATRICE_C47).map(([v, a]) => [`matrice-${v}.log`, logDi(a)])
  ),
  'matrice-chiama-scrivi-29.log':
    'START u0 {act=android.intent.action.DIAL dat=tel:xxx}\nSTART u0 {dat=mailto:xxx}',
  'matrice-chiama-scrivi-36.log':
    'START u0 {act=android.intent.action.DIAL dat=tel:xxx}\nSTART u0 {dat=mailto:xxx}',
  [`${CHIUDI}-29.xml`]: dump('Azioni', 'Dona ora'),
  [`${CHIUDI}-36.xml`]: dump('Azioni', 'Dona ora'),
  [`${HOME_2}-1.xml`]: dump('Risultati'),
  [`${HOME_2}-2.xml`]: dump('Supporta'),
  [`${HOME_2}.log`]: PICCOLO_2,
  [`${TASTIERA}.xml`]: dump('Email', 'Registrati'),
  [`${TASTIERA}.log`]: 'mInputShown=true',
  [`${MAPPA_2}-pixel_8.log`]: logDi({
    schermo: '1080x2400',
    densita: 420,
    scala: '2.0',
  }),
  [`${MAPPA_2}-phone_small_29.log`]: PICCOLO_2,
  [`${DIVISO}.log`]: 'metodo: wm size a metà altezza\nboot_id: b1\nboot_id: b1',
};
const IMMAGINI = [
  ...Object.entries(MATRICE_C47).flatMap(([v, a]) =>
    a.schermate.map(s => `matrice-${v}-${s}.png`)
  ),
  `${HOME_2}-1.png`,
  `${TASTIERA}.png`,
  `${MAPPA_2}-pixel_8.png`,
  `${MAPPA_2}-phone_small_29.png`,
  `${DIVISO}-home.png`,
  `${DIVISO}-accesso.png`,
].sort();
const verdettoDi = (immagini, esito = 'PASS') => ({
  agente: 'critico-1',
  criterio: 'C47',
  verdetto: esito,
  giudicate: immagini.map(nome => ({ nome, hash: 'h', attuale: 'h' })),
});
const OK = { file: FILE, immagini: IMMAGINI, verdetto: verdettoDi(IMMAGINI) };
const conFile = (nome, testo) => ({ file: { ...FILE, [nome]: testo } });
const senzaFile = nome => ({
  file: Object.fromEntries(Object.entries(FILE).filter(([n]) => n !== nome)),
});
const senzaImmagine = nome => {
  const immagini = IMMAGINI.filter(n => n !== nome);
  return { immagini, verdetto: verdettoDi(immagini) };
};
const TABLET_O = 'matrice-pixel_tablet_36-orizzontale.log';

export const FIXTURE_MATRICE = {
  C47: casi(
    OK,
    [
      senzaFile('matrice-pixel_8-scuro.log'),
      conFile(
        'matrice-phone_small_29-scala2.log',
        PICCOLO_2.replace('2.0', '1.0')
      ),
      conFile(
        'matrice-pixel_8-tre-pulsanti.log',
        FILE['matrice-pixel_8-tre-pulsanti.log'].replace(
          'navigation_mode: 0',
          'navigation_mode: 2'
        )
      ),
      conFile(
        'matrice-pixel_8-scuro.log',
        FILE['matrice-pixel_8-scuro.log'].replace('Night mode: yes', '')
      ),
      conFile(TABLET_O, FILE[TABLET_O].replace('orizzontale', 'verticale')),
      conFile(TABLET_O, FILE[TABLET_O].replace('boot_id: b1', 'boot_id: b2')),
      conFile(
        TABLET_O,
        FILE[TABLET_O].replace('Physical density: 320', 'Physical density: 240')
      ),
      conFile(TABLET_O, `${FILE[TABLET_O]}\nOverride size: 1280x800`),
      senzaImmagine('matrice-pixel_tablet_36-orizzontale-mappa-paese.png'),
      conFile('matrice-chiama-scrivi-36.log', 'START u0 {dat=tel:xxx}'),
      conFile(`${CHIUDI}-36.xml`, dump('Come Donare', 'Chiudi')),
      conFile(`${HOME_2}-2.xml`, dump('Risultati del 2025')),
      conFile(`${TASTIERA}.xml`, dump('Email')),
      conFile(`${TASTIERA}.log`, 'mInputShown=false'),
      conFile(
        `${MAPPA_2}-pixel_8.log`,
        FILE[`${MAPPA_2}-pixel_8.log`].replace('2.0', '1.0')
      ),
      conFile(
        `${DIVISO}.log`,
        'metodo: wm size a metà altezza\nboot_id: b1\nboot_id: b2'
      ),
      conFile(`${DIVISO}.log`, 'boot_id: b1\nboot_id: b1'),
      senzaImmagine(`${DIVISO}-accesso.png`),
      { verdetto: verdettoDi(IMMAGINI, 'REVISE') },
      { verdetto: verdettoDi(IMMAGINI.slice(1)) },
    ],
    [conFile('matrice-chiama-scrivi-36.log', 'START u0 {dat=tel:xxx}')].map(
      m => ({
        ...m,
        file: {
          ...m.file,
          'matrice-chiama-scrivi-36-mailto.xml': dump(
            'Scrivi a info@example.org'
          ),
        },
      })
    )
  ),
};
