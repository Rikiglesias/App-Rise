// Controlli statici sul codice dei criteri R27-R29 (contratto android-play): C93 (errori dei campi annunciati
// una volta sola, dal modulo), C94 (sfondi toccabili che chiudono le finestre), C98 (chiave della sessione).
// I lettori restituiscono i testi interi: il parsing sta in `verifica`, così il selftest prova anche lui.
import { esiste, leggi, percorso } from './comune.mjs';
import { bilanciato } from './f13-statici.mjs';

const leggiSeEsiste = p => (esiste(percorso(p)) ? leggi(percorso(p)) : null);
const testiDi = file =>
  Object.fromEntries(file.map(f => [f, leggiSeEsiste(f)]));

// --- C93 ---------------------------------------------------------------------------------------------
const CAMPI = 'src/features/auth/components';
export const CAMPI_C93 = {
  AuthInput: `${CAMPI}/AuthInput.tsx`,
  AuthPhoneField: `${CAMPI}/AuthPhoneField.tsx`,
  AuthDateField: `${CAMPI}/AuthDateField.tsx`,
  AuthCountryField: `${CAMPI}/AuthCountryField.tsx`,
  AuthCityField: `${CAMPI}/AuthCityField.tsx`,
  AuthConsentCheckbox: `${CAMPI}/AuthConsentCheckbox.tsx`,
};

/** Il ramo JSX `{nome ? ( … )` fra parentesi bilanciate, o null. */
export const ramo = (testo, nome) => {
  const m = new RegExp(`\\b${nome}\\s*\\?\\s*\\(`).exec(testo ?? '');
  return m ? bilanciato(testo, m.index + m[0].length - 1) : null;
};

export const staticoC93 = {
  leggi: () => ({ file: testiDi(Object.values(CAMPI_C93)) }),
  verifica({ file }) {
    for (const [nome, f] of Object.entries(CAMPI_C93)) {
      const testo = file?.[f];
      if (testo == null) return `${f} assente`;
      const errore = ramo(testo, 'error');
      if (!errore) return `${nome}: ramo dell'errore non trovato`;
      if (/accessibilityLiveRegion/.test(errore))
        return `${nome}: il ramo dell'errore ha ancora accessibilityLiveRegion`;
      if (/announceForAccessibility\([^)]*\berror\b/.test(testo))
        return `${nome}: annuncia ancora l'errore da sé (l'annuncio è uno, all'invio)`;
    }
    const input = file[CAMPI_C93.AuthInput];
    const suggerimento = ramo(input, 'hint');
    if (!suggerimento) return 'AuthInput: ramo del suggerimento non trovato';
    if (/accessibilityLiveRegion/.test(suggerimento))
      return 'AuthInput: il suggerimento ha ancora la live region (coppia vietata da R26)';
    if (!/announceForAccessibility\(\s*hint\b/.test(input))
      return 'AuthInput: il suggerimento non è più annunciato';
    return '';
  },
};

// --- C94 ---------------------------------------------------------------------------------------------
export const SFONDI_C94 = {
  Storia: 'src/features/about/components/StoriaModal.tsx',
  'Come Donare': 'src/features/actions/components/shared/DonationInfoModal.tsx',
  'avviso partner':
    'src/features/actions/components/shared/PartnerDisclosureModal.tsx',
};
// Restano come sono, con nome: doppione innocuo della X di MapLocationModal e chiusura del selettore della
// data per lo screen reader. Devono esistere: se uno si sposta, l'elenco chiuso va riletto.
export const ESENTI_C94 = [
  'src/components/ui/PerfectModal.tsx',
  'src/features/auth/components/AuthDateField.tsx',
];
export const TOCCABILE_C94 = 'src/components/ui/PlatformTouchable.tsx';
const VIETATI_C94 = [
  [
    /importantForAccessibility\s*=\s*\{?\s*['"]no-hide-descendants/,
    'no-hide-descendants',
  ],
  [/accessibilityElementsHidden/, 'accessibilityElementsHidden'],
];

/** Tag JSX d'apertura da `da` fino al `>` fuori dalle graffe: { tag, chiuso } (chiuso = `/>`), o null. */
export const tagApertura = (testo, da) => {
  let graffe = 0;
  for (let i = da; i < testo.length; i++) {
    if (testo[i] === '{') graffe++;
    else if (testo[i] === '}') graffe--;
    else if (testo[i] === '>' && graffe === 0)
      return { tag: testo.slice(da, i + 1), chiuso: testo[i - 1] === '/' };
  }
  return null;
};

/** Lo sfondo che chiude (toccabile con onPress e stile overlay/absoluteFill) e, se avvolge, il toccabile interno. */
export const sfondo = testo => {
  const toccabili = [
    ...String(testo ?? '').matchAll(/<(PlatformTouchable|Pressable)\b/g),
  ].map(m => ({ tipo: m[1], da: m.index, ...tagApertura(testo, m.index) }));
  const i = toccabili.findIndex(
    t =>
      t.tag && /\bonPress=/.test(t.tag) && /overlay|absoluteFill/i.test(t.tag)
  );
  if (i < 0) return null;
  const esterno = toccabili[i];
  const dopo = toccabili[i + 1];
  const interno =
    !esterno.chiuso && dopo && !/\bonPress=/.test(dopo.tag) ? dopo : null;
  return { esterno, interno };
};

const spento = tag =>
  /\baccessible=\{\s*false\s*\}/.test(tag) &&
  /\bfocusable=\{\s*false\s*\}/.test(tag);

export const staticoC94 = {
  leggi: () => ({
    file: testiDi(Object.values(SFONDI_C94)),
    toccabile: leggiSeEsiste(TOCCABILE_C94),
    esenti: Object.fromEntries(ESENTI_C94.map(f => [f, esiste(percorso(f))])),
  }),
  verifica({ file, toccabile, esenti }) {
    let usaToccabile = false;
    for (const [nome, f] of Object.entries(SFONDI_C94)) {
      if (file?.[f] == null) return `${f} assente`;
      const s = sfondo(file[f]);
      if (!s) return `${nome}: sfondo che chiude non trovato`;
      for (const [ruolo, t] of [
        ['sfondo', s.esterno],
        ['toccabile interno', s.interno],
      ]) {
        if (!t) continue;
        if (!spento(t.tag))
          return `${nome}: ${ruolo} senza accessible={false} e focusable={false}`;
        if (!s.esterno.chiuso)
          for (const [re, cosa] of VIETATI_C94)
            if (re.test(t.tag)) return `${nome}: ${ruolo} con ${cosa}`;
        if (t.tipo === 'PlatformTouchable') usaToccabile = true;
      }
    }
    // Su Android PlatformTouchable passa un elenco chiuso di prop: focusable deve esserci.
    if (usaToccabile && !/\bprops\.focusable\b/.test(toccabile ?? ''))
      return `${TOCCABILE_C94}: focusable non arriva al nativo su Android`;
    const sparito = ESENTI_C94.find(f => !esenti?.[f]);
    if (sparito)
      return `esente ${sparito} non trovato: rileggere l'elenco chiuso`;
    return '';
  },
};

// --- C98 ---------------------------------------------------------------------------------------------
export const CLIENT_C98 = 'src/shared/auth/supabaseClient.ts';

/** Espressione di `storageKey` nel client, risolta se è il nome di una costante del file; null se manca. */
export const chiaveSessione = testo => {
  const m = /\bstorageKey\s*:\s*([^\n]+)/.exec(testo ?? '');
  if (!m) return null;
  const valore = m[1].trim().replace(/,$/, '');
  if (!/^[A-Za-z_$][\w$]*$/.test(valore)) return valore;
  const d = new RegExp(`\\bconst\\s+${valore}\\s*=\\s*([^;]+);`).exec(testo);
  return d ? d[1].trim() : `${valore} (non definito nel file)`;
};

export const staticoC98 = {
  leggi: () => ({ testo: leggiSeEsiste(CLIENT_C98) }),
  verifica({ testo }) {
    if (testo == null) return `${CLIENT_C98} assente`;
    const chiave = chiaveSessione(testo);
    if (chiave == null)
      return `${CLIENT_C98}: storageKey non dichiarato nel client`;
    // Default di supabase-js 2.x: `sb-${hostname.split('.')[0]}-auth-token` (nessuno viene disconnesso).
    const c = chiave.replace(/\s+/g, '');
    if (
      !c.includes('sb-') ||
      !/hostname\.split\((['"`])\.\1\)\[0\]/.test(c) ||
      !c.includes('-auth-token')
    )
      return `${CLIENT_C98}: storageKey ${chiave} diverso dal default sb-<ref>-auth-token`;
    return '';
  },
};
