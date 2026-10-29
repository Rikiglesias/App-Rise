// C22 per C47 (matrice dei dispositivi + azioni R28-R29): dati sintetici, ogni fixture negativa è il positivo con UNA
// mutazione, sul suo ramo.
import { MATRICE_C47 } from './matrice.mjs';
import { AZIONI_C47 } from './testi-criteri.mjs';
import { casi } from './selftest-f13-esterni.mjs';

const [CHIUDI, HOME_2, TASTIERA, MAPPA_2, FINESTRA, SFONDI] = AZIONI_C47;
const dump = (...testi) =>
  `<hierarchy>${testi.map(t => `<node text="${t}" content-desc="" />`).join('')}</hierarchy>`;
/** Nodo con gli attributi che legge nodiDump (classe, fuoco, cliccabile, bounds). */
const nodo = ({
  testo = '',
  classe = 'android.view.ViewGroup',
  fuoco = false,
  cliccabile = false,
  bounds = '[0,0][100,100]',
  id = '',
}) =>
  `<node text="${testo}" resource-id="${id}" class="${classe}" content-desc="" focused="${fuoco}" clickable="${cliccabile}" bounds="${bounds}" />`;
const SCHERMO = '[0,0][1080,2400]';
const finestra = (...nodi) =>
  `<hierarchy>${nodo({ bounds: SCHERMO })}${nodi.join('')}</hierarchy>`;
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
const P29 = 'matrice-phone_small_29';
const P8 = 'matrice-pixel_8';
const TASTIERA_XML = `<hierarchy>${nodo({ classe: 'android.widget.EditText' })}${nodo({ classe: 'android.widget.EditText', fuoco: true })}${nodo({ testo: 'Registrati', cliccabile: true })}</hierarchy>`;
const FINESTRA_LOG = [
  'metodo: wm size ridotto',
  'Physical size: 1080x2400',
  'Override size: 1080x1200',
  'boot_id: b1',
  'Physical size: 1080x2400',
  'boot_id: b1',
].join('\n');
// Dopo C94 lo sfondo che chiude non è un nodo cliccabile; la X sì, ma piccola.
const SFONDO = { bounds: SCHERMO, cliccabile: true };
const CHIUDI_X = nodo({ cliccabile: true, bounds: '[900,100][1000,200]' });
const DUMP_SFONDI = {
  storia: finestra(nodo({ testo: 'La Nostra Storia' }), CHIUDI_X),
  'come-donare': finestra(
    nodo({ testo: 'Come Donare' }),
    nodo({ bounds: SCHERMO }),
    CHIUDI_X
  ),
  'avviso-partner': finestra(nodo({ id: 'partner-disclosure-content' })),
};

const FILE = {
  ...Object.fromEntries(
    Object.entries(MATRICE_C47).map(([v, a]) => [`matrice-${v}.log`, logDi(a)])
  ),
  'matrice-chiama-scrivi-29.log':
    'START u0 {act=android.intent.action.DIAL dat=tel:xxx}\nSTART u0 {dat=mailto:xxx}',
  'matrice-chiama-scrivi-36.log':
    'START u0 {act=android.intent.action.DIAL dat=tel:xxx}\nSTART u0 {dat=mailto:xxx}',
  [`${P29}-${CHIUDI}.xml`]: dump('Azioni', 'Dona ora'),
  [`${P8}-${CHIUDI}.xml`]: dump('Azioni', 'Dona ora'),
  [`${P29}-${HOME_2}-1.xml`]: dump('Risultati'),
  [`${P29}-${HOME_2}-2.xml`]: dump('Supporta'),
  [`${P29}-${HOME_2}.log`]: PICCOLO_2,
  [`${P29}-${TASTIERA}.xml`]: TASTIERA_XML,
  [`${P29}-${TASTIERA}.log`]: `${PICCOLO_2}\nmInputShown=true`,
  [`${P8}-${MAPPA_2}.log`]: logDi({
    schermo: '1080x2400',
    densita: 420,
    scala: '2.0',
  }),
  [`${P29}-${MAPPA_2}.log`]: PICCOLO_2,
  [`${P8}-${FINESTRA}.log`]: FINESTRA_LOG,
  ...Object.fromEntries(
    Object.entries(DUMP_SFONDI).map(([f, x]) => [`${P8}-${SFONDI}-${f}.xml`, x])
  ),
};
const IMMAGINI = [
  ...Object.entries(MATRICE_C47).flatMap(([v, a]) =>
    a.schermate.map(s => `matrice-${v}-${s}.png`)
  ),
  `${P29}-${CHIUDI}.png`,
  `${P8}-${CHIUDI}.png`,
  `${P29}-${HOME_2}-1.png`,
  `${P29}-${TASTIERA}.png`,
  `${P8}-${MAPPA_2}.png`,
  `${P29}-${MAPPA_2}.png`,
  `${P8}-${FINESTRA}-piccola.png`,
  `${P8}-${FINESTRA}-ingrandita.png`,
  ...Object.keys(DUMP_SFONDI).map(f => `${P8}-${SFONDI}-${f}.png`),
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
const COME_DONARE = `${P8}-${SFONDI}-come-donare.xml`;

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
      // (1)
      senzaFile(`${P29}-${CHIUDI}.xml`),
      conFile(`${P8}-${CHIUDI}.xml`, dump('Come Donare', 'Chiudi')),
      senzaImmagine(`${P8}-${CHIUDI}.png`),
      // (2)
      conFile(`${P29}-${HOME_2}-2.xml`, dump('Risultati del 2025')),
      senzaImmagine(`${P29}-${HOME_2}-1.png`),
      conFile(`${P29}-${HOME_2}.log`, PICCOLO_2.replace('2.0', '1.0')),
      // (3)
      conFile(`${P29}-${TASTIERA}.xml`, dump('Email')),
      conFile(
        `${P29}-${TASTIERA}.xml`,
        TASTIERA_XML.replace('focused="true"', 'focused="false"').replace(
          'focused="false"',
          'focused="true"'
        )
      ),
      conFile(`${P29}-${TASTIERA}.log`, `${PICCOLO_2}\nmInputShown=false`),
      conFile(
        `${P29}-${TASTIERA}.log`,
        `${PICCOLO_2.replace('2.0', '1.0')}\nmInputShown=true`
      ),
      senzaImmagine(`${P29}-${TASTIERA}.png`),
      // (4)
      conFile(
        `${P8}-${MAPPA_2}.log`,
        FILE[`${P8}-${MAPPA_2}.log`].replace('2.0', '1.0')
      ),
      senzaImmagine(`${P29}-${MAPPA_2}.png`),
      // (5)
      conFile(
        `${P8}-${FINESTRA}.log`,
        FINESTRA_LOG.replace('ridotto', 'a metà altezza')
      ),
      conFile(
        `${P8}-${FINESTRA}.log`,
        FINESTRA_LOG.replace(/boot_id: b1$/, 'boot_id: b2')
      ),
      conFile(
        `${P8}-${FINESTRA}.log`,
        `${FINESTRA_LOG}\nOverride size: 1080x1200`
      ),
      senzaImmagine(`${P8}-${FINESTRA}-ingrandita.png`),
      // (6)
      senzaFile(`${P8}-${SFONDI}-storia.xml`),
      conFile(COME_DONARE, finestra(nodo(SFONDO))),
      conFile(
        COME_DONARE,
        finestra(
          nodo({ testo: 'Come Donare' }),
          nodo({ ...SFONDO, bounds: '[0,0][1080,2300]' })
        )
      ),
      senzaImmagine(`${P8}-${SFONDI}-avviso-partner.png`),
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
