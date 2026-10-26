// Criteri R24-R26 (fase F13 «controlla tutto» del contratto android-play) sul codice e sui testi: titoli Jest
// con controprova a BASE_R24, guardie, statici. I criteri che chiamano rete, Docker o Deno stanno nei moduli
// f13-dipendenze, f13-funzioni, f13-workflow, f13-database, f13-rilievi.
import { esiste, leggi, normalizzaSpazi, percorso } from './comune.mjs';
import { DEFINIZIONI as DEFINIZIONI_CODICE } from './codice.mjs';
import {
  BASE_R24,
  criterioConTitoli,
  esitoTitoli,
  suite,
} from './titoli-jest.mjs';
import {
  FILE_C65,
  staticoC56,
  staticoC58,
  staticoC65,
  staticoC73,
  staticoC77,
  staticoC82,
} from './f13-statici.mjs';
import {
  staticoC61,
  staticoC63,
  staticoC76,
  staticoC80,
} from './f13-testi.mjs';

// --- statici piccoli, legati a un solo criterio a titoli --------------------------------------------
const RESET_C68 = 'reset concluso: indietro non torna al reset';
// Il titolo vale per due scenari (dalla pagina Account e da avvio a freddo): servono almeno due test.
export const staticoC68 = {
  leggi: ({ jest }) => ({
    scenari: (jest ?? []).filter(r => r.titolo === RESET_C68).length,
  }),
  verifica: ({ scenari }) =>
    scenari >= 2
      ? ''
      : `«${RESET_C68}»: ${scenari} scenari, attesi 2 (pagina Account e avvio a freddo)`,
};

export const FLAG_C71 = 'src/shared/partner/disclosureFlag.ts';
// Il commento di oggi (righe 67-70) descrive il fail-open che C71 toglie.
const COMMENTO_VECCHIO_C71 =
  'se lo storage non risponde si risponde «nessuna rinuncia»';
export const staticoC71 = {
  leggi: () => ({
    testo: esiste(percorso(FLAG_C71)) ? leggi(percorso(FLAG_C71)) : null,
  }),
  verifica({ testo }) {
    if (testo == null) return `${FLAG_C71} assente`;
    const commenti = normalizzaSpazi(
      testo.replace(/^\s*\*\s?/gm, ' ').replace(/\/\*\*?|\*\//g, ' ')
    );
    return commenti.includes(COMMENTO_VECCHIO_C71)
      ? `${FLAG_C71}: il commento descrive ancora il fail-open («${COMMENTO_VECCHIO_C71}»)`
      : '';
  },
};

// C72 emendato R28-R29 (insieme a C98): dopo la cancellazione riuscita con uscita fallita l'app è ospite,
// quindi nessun testo chiede più di uscire a mano.
export const LOCALI_C72 = {
  'src/locales/it.ts': 'esci a mano',
  'src/locales/en.ts': 'sign out manually',
};
export const staticoC72 = {
  leggi: () => ({
    testi: Object.fromEntries(
      Object.keys(LOCALI_C72).map(f => [
        f,
        esiste(percorso(f)) ? leggi(percorso(f)) : null,
      ])
    ),
  }),
  verifica({ testi }) {
    for (const [f, frase] of Object.entries(LOCALI_C72)) {
      if (testi?.[f] == null) return `${f} assente`;
      if (normalizzaSpazi(testi[f]).toLowerCase().includes(frase))
        return `${f}: dice ancora «${frase}»`;
    }
    return '';
  },
};

const schermate = (prima, dopo, nomi) => nomi.map(n => `${prima}${n}${dopo}`);

// --- definizioni a titoli --------------------------------------------------------------------------
export const DEFINIZIONI_F13 = Object.fromEntries(
  Object.entries({
    C56: {
      titoli: [
        'mappa: intestazione in colonna',
        'mappa: chiusura fuori dai testi e ≥ 48 dp',
        "mappa: filtro sotto l'intestazione nello stesso contenitore",
        'mappa: sottotitolo senza pin in it e en',
      ],
      statico: staticoC56,
    },
    C57: {
      titoli: [
        'contrasto: anno nella scheda del paese',
        'scheda del paese: Segui il tracciamento ≥ 48 dp',
      ],
    },
    C58: {
      titoli: [
        'testo multiriga: mai più largo del contenitore',
        "testo multiriga: in una riga con un'icona accanto si restringe",
        'testo multiriga: containerWidth 0 resta spento a scala 2',
      ],
      guardie: ['testo multiriga: uguale a prima in un contenitore largo'],
      statico: staticoC58,
    },
    C62: {
      titoli: [
        'export: contiene i riferimenti partner',
        'export: senza riferimenti la sezione è vuota, non assente',
        'export: lettura dei riferimenti fallita → errore, non sezione vuota',
      ],
    },
    C64: {
      titoli: [
        'lettore di schermo: Paese con il valore',
        'lettore di schermo: data con il valore',
        'lettore di schermo: pulsante in caricamento con nome e busy',
        'link in caricamento: attesa visibile e tocco ignorato',
      ],
    },
    C65: {
      titoli: [
        ...schermate("errore d'invio annunciato: ", '', Object.keys(FILE_C65)),
        "errore d'invio annunciato: stesso errore due volte, due annunci",
      ],
      statico: staticoC65,
    },
    C66: { titoli: ['campo paese: nome lungo non spinge fuori il simbolo'] },
    C67: {
      titoli: [
        ...schermate(
          'doppio invio: ',
          " chiama una volta sola e si libera dopo l'errore",
          [
            'Accesso',
            'Registrazione',
            'Password dimenticata',
            'Reimposta password',
            'Modifica profilo',
            'Completa profilo',
          ]
        ),
        'riavvio: un tocco solo',
      ],
    },
    C68: {
      titoli: [
        RESET_C68,
        'secondo link di recupero: una sola Reimposta password in pila',
      ],
      guardie: ['indietro visibile: Reimposta password dallo stack'],
      statico: staticoC68,
    },
    C69: {
      titoli: ['link di recupero fallito: la riapertura avvisa'],
      guardie: [
        'stesso URL da getInitialURL ed evento → un solo scambio',
        'link di recupero riuscito riaperto: nessun secondo scambio',
      ],
    },
    C70: { titoli: ['salvataggio parziale: dice cosa è salvato'] },
    C71: {
      titoli: [
        'donorbox: rinuncia non salvata, avviso di nuovo e niente dati',
        'donorbox: rinuncia illeggibile, niente dati',
      ],
      guardie: ['donorbox: rinuncia salvata, niente dati'],
      statico: staticoC71,
    },
    C72: {
      titoli: [
        'elimina account: uscita che rigetta = sessione residua, non errore',
      ],
      statico: staticoC72,
    },
    C73: {
      titoli: [
        "OTA all'avvio: oltre il tempo massimo l'app è usabile",
        "OTA all'avvio: download finito dopo il tempo massimo non ricarica",
      ],
      guardie: DEFINIZIONI_CODICE.C27.titoli,
      statico: staticoC73,
    },
    C74: {
      titoli: [
        'modale partner: scheda entro la finestra a 600×300',
        'info donazioni: scheda entro la finestra a 600×300',
      ],
    },
    C75: {
      titoli: [
        'profilo: attesa visibile finché il profilo non arriva',
        'consenso marketing: fermo finché il profilo non arriva',
      ],
    },
    C84: { titoli: ['consensi: risposta del vecchio account scartata'] },
  }).map(([id, d]) => [id, { ...d, base: BASE_R24 }])
);

// --- C81: contrasti già corretti, esente dalla controprova --------------------------------------------
// Titoli esatti degli `it.each` di tabBarEtichetteContrasto e authPhoneFieldContrasto (espansi il 24/10).
export const GUARDIE_C81 = [
  'contrasto: «Home» sull’ombra del pulsante centrale (attiva: true)',
  'contrasto: «Home» sull’ombra del pulsante centrale (attiva: false)',
  'contrasto: etichetta di ImpactTab sulla barra',
  'contrasto: etichetta di InfoTab sulla barra',
  'contrasto: segnaposto in light',
  'contrasto: segnaposto in dark',
  'contrasto: prefisso nella lista dei paesi',
  'contrasto: testo trasparente composto sul fondo',
];

const soloStatico = statico => ({
  leggi: async () => ({ statico: await statico.leggi() }),
  verifica: ({ statico: dati }) => statico.verifica(dati),
});

export const criteri = {
  ...Object.fromEntries(
    Object.entries(DEFINIZIONI_F13).map(([id, d]) => [
      id,
      criterioConTitoli(id, d),
    ])
  ),
  C61: soloStatico(staticoC61),
  C63: soloStatico(staticoC63),
  C76: soloStatico(staticoC76),
  C77: soloStatico(staticoC77),
  C80: soloStatico(staticoC80),
  C81: {
    nota: () => 'esente dalla controprova: i test erano già verdi a 63352bc',
    leggi: () => ({ jest: suite() }),
    verifica: ({ jest }) => esitoTitoli(GUARDIE_C81, jest),
  },
  C82: soloStatico(staticoC82),
};
