// Fixture del selftest (C22) per le prove visive: C12, C16, C18, C21.
import { PACKAGE } from './comune.mjs';
import { immagine, verdetto, grande, pixel } from './selftest-costruttori.mjs';

export const FIXTURE_VISIVO = {
  C12: {
    neg: [
      grande({
        immagini: grande().immagini.map(i => ({
          ...i,
          larghezza: 1080,
          altezza: 1920,
        })),
      }),
      grande({
        log: 'Physical size: 2560x1600\nOverride size: 2560x1600\nPhysical density: 320',
      }),
      grande({
        verdetto: verdetto(['grande-a.png', 'grande-b.png', 'grande-c.png'], {
          verdetto: 'FAIL',
        }),
      }),
      grande({
        verdetto: {
          ...verdetto(['grande-a.png', 'grande-b.png', 'grande-c.png']),
          giudicate: [{ nome: 'grande-a.png', hash: 'h', attuale: 'x' }],
        },
      }),
    ],
    pos: [grande()],
  },
  C16: {
    neg: [
      {
        icona: {
          formato: 'png',
          larghezza: 512,
          altezza: 512,
          alfa: false,
          byte: 1,
        },
      },
      {
        icona: {
          formato: 'png',
          larghezza: 512,
          altezza: 512,
          alfa: true,
          byte: 1,
        },
        evidenza: {
          formato: 'png',
          larghezza: 1024,
          altezza: 500,
          alfa: false,
        },
        screenshot: {
          it: [1, 2, 3, 4].map(n =>
            immagine(`${n}.png`, 1080, 1920, { alfa: true })
          ),
          en: [],
        },
      },
    ],
  },
  C18: {
    neg: [
      {
        primoPiano: { nome: 'fg.png', ...pixel(1024, [[0, 0]]) },
        monocromatica: null,
        launcher: [],
        verdetto: null,
      },
      {
        primoPiano: { nome: 'fg.png', ...pixel(1024, [[512, 512]]) },
        monocromatica: {
          nome: 'mono.png',
          ...pixel(4, [
            [0, 0, [0, 0, 0]],
            [1, 1, [255, 0, 0]],
          ]),
        },
        launcher: [],
        verdetto: null,
      },
    ],
  },
  C21: {
    neg: [
      { immagini: [], navigazione: null },
      {
        immagini: [
          'limite-3pulsanti.png',
          'limite-indietro-prima.png',
          'limite-indietro-dopo.png',
          'limite-offline.png',
          'limite-de-DE.png',
        ],
        navigazione: 'navigation_mode=0',
        indietro: `mCurrentFocus=Window{1 u0 ${PACKAGE}/x}`,
        offline: `Start proc 1:${PACKAGE}/u0`,
        dumpDe: '<node text="auth.login.title"/>',
        verdetto: null,
      },
    ],
  },
};
