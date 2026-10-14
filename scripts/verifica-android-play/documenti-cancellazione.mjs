// C14: pagine di richiesta cancellazione IT/EN (contratto del goal android-play).
// Le 6 parti chieste da Google (answer/13327111): nome app e sviluppatore, passi nell'app,
// richiesta senza app con verifica dell'identità, dati cancellati, dati conservati e per
// quanto, tempi. Etichette e campi si leggono dal codice, non si copiano a mano.
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { esiste, leggi, percorso } from './comune.mjs';
import { leggiScheda } from './documenti.mjs';

const WEB = ['docs', 'store', 'google-play', 'web'];
// Il nome dello sviluppatore coincide col titolo della scheda: va cercato come sviluppatore,
// altrimenti il titolo da solo farebbe passare il controllo.
const SVILUPPATORE = /(?:sviluppatore|developer)\s+Rise Against Hunger Italia/i;
export const PAGINE = {
  it: {
    file: 'elimina-account.html',
    sezioni: [
      'dall-app',
      'senza-app',
      'cosa-cancelliamo',
      'cosa-resta',
      'tempi',
    ],
  },
  en: {
    file: 'delete-account.html',
    sezioni: [
      'in-the-app',
      'without-the-app',
      'what-we-delete',
      'what-we-keep',
      'timing',
    ],
  },
};
// Campo inviato al profilo da useSignUpForm.ts → come si chiama nella pagina.
export const TERMINI = {
  first_name: { it: /\bnome\b/i, en: /first name/i },
  last_name: { it: /cognome/i, en: /last name/i },
  nickname: { it: /nickname/i, en: /nickname/i },
  phone: { it: /telefono/i, en: /phone/i },
  city: { it: /città/i, en: /city/i },
  province: { it: /provincia/i, en: /province/i },
  country: { it: /paese/i, en: /country/i },
  birth_date: { it: /data di nascita/i, en: /date of birth/i },
  privacy_consent: { it: /informativa/i, en: /privacy notice/i },
  marketing_consent: { it: /comunicazioni/i, en: /communications/i },
};
const ACCOUNT = { it: [/email/i, /password/i], en: [/email/i, /password/i] };
const DURATA = /\d+\s*(?:giorni|mesi|days|months)|scadenza|expiry/i;
const TEMPI = /(?:\bmese|month|giorni|days)/i;

const testo = html =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Sezioni `<h2 id="…">` della pagina: id → { html, testo }. La testa va in `_testa`. */
export const leggiSezioni = html => {
  const parti = html.split(/<h2 id="([^"]+)"[^>]*>/);
  const sezioni = { _testa: { html: parti[0], testo: testo(parti[0]) } };
  for (let i = 1; i < parti.length; i += 2)
    sezioni[parti[i]] = { html: parti[i + 1], testo: testo(parti[i + 1]) };
  return sezioni;
};

const caricaLocale = file => {
  const { outputText } = ts.transpileModule(leggi(percorso(file)), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  // Contesto isolato: il file di traduzione non vede require, process né il filesystem.
  const modulo = { exports: {} };
  runInNewContext(outputText, { module: modulo, exports: modulo.exports });
  return modulo.exports.default;
};

const etichette = lingua => {
  const l = caricaLocale(`src/locales/${lingua}.ts`);
  return [
    l.navigation.profile,
    l.auth.privacy.title,
    l.auth.privacy.deleteCta,
    l.auth.delete.now,
    l.auth.delete.confirm,
  ];
};

/** Chiavi dell'oggetto passato a `signUp(email, password, { … })`. */
export const campiSignUp = sorgente => {
  const blocco = sorgente.match(/signUp\([^{]*\{([\s\S]*?)\}\);/)?.[1] ?? '';
  return [...blocco.matchAll(/^\s*(\w+):/gm)].map(m => m[1]);
};

export const criteri = {
  C14: {
    leggi: () => {
      const pagine = {};
      for (const [lingua, { file }] of Object.entries(PAGINE)) {
        const p = percorso(...WEB, file);
        pagine[lingua] = esiste(p) ? leggiSezioni(leggi(p)) : null;
      }
      const scheda = percorso('docs', 'store', 'google-play', 'scheda.md');
      return {
        pagine,
        etichette: { it: etichette('it'), en: etichette('en') },
        campi: campiSignUp(
          leggi(percorso('src/features/auth/hooks/useSignUpForm.ts'))
        ),
        titolo: esiste(scheda)
          ? leggiScheda(leggi(scheda))['it-IT']?.titolo
          : null,
      };
    },
    verifica({ pagine, etichette, campi, titolo }) {
      if (!campi.length)
        return 'nessun campo trovato in useSignUpForm.ts (lettura rotta)';
      for (const [lingua, { file, sezioni: attese }] of Object.entries(
        PAGINE
      )) {
        const s = pagine[lingua];
        if (!s) return `manca ${file}`;
        const tutto = Object.values(s)
          .map(x => x.testo)
          .join(' ');
        if (!titolo || !tutto.includes(titolo))
          return `${file}: manca il titolo della scheda «${titolo}»`;
        if (!SVILUPPATORE.test(s._testa.testo))
          return `${file}: in testa manca «sviluppatore Rise Against Hunger Italia»`;
        const mancante = attese.find(id => !s[id]);
        if (mancante) return `${file}: manca la sezione #${mancante}`;
        const [passi, senzaApp, cancellati, conservati, tempi] = attese.map(
          id => s[id]
        );
        const etichetta = etichette[lingua].find(e => !passi.testo.includes(e));
        if (etichetta)
          return `${file}: i passi non citano l'etichetta «${etichetta}»`;
        if (
          !/mailto:/.test(senzaApp.html) ||
          !/conferm|confirm/i.test(senzaApp.testo)
        )
          return `${file}: richiesta senza app senza email o senza verifica dell'identità`;
        for (const campo of campi) {
          const termine = TERMINI[campo]?.[lingua];
          if (!termine)
            return `campo non mappato: ${campo} (aggiungerlo a TERMINI e alla pagina)`;
          if (!termine.test(cancellati.testo))
            return `${file}: dati cancellati senza il campo ${campo}`;
        }
        const account = ACCOUNT[lingua].find(r => !r.test(cancellati.testo));
        if (account) return `${file}: dati cancellati senza ${account}`;
        if (!DURATA.test(conservati.testo))
          return `${file}: dati conservati senza durata`;
        if (!TEMPI.test(tempi.testo))
          return `${file}: tempi di risposta assenti`;
      }
      return null;
    },
  },
};
