// C99 (R28-R29, contratto android-play): documenti pubblici, statico. URL del gate uguale a quello dell'app,
// marcatore «Ultimo aggiornamento» = data dell'ultimo commit del file, gate che controlla `da-validare`, richieste
// di cancellazione da inoltrare ai partner entro un mese.
import { esegui } from './comune.mjs';
import { sezioni } from './documenti-rilascio.mjs';
import { leggiSeEsiste, piano, testoHtml } from './f13-r27-testi.mjs';

// --- C99 ---------------------------------------------------------------------------------------------
export const RILASCIO_C99 = 'docs/store/google-play/rilascio.md';
export const URLS_C99 = 'src/shared/constants/urls.ts';
export const PAGINE_C99 = [
  'privacy-policy.html',
  'privacy-policy-en.html',
  'docs/store/google-play/web/elimina-account.html',
  'docs/store/google-play/web/delete-account.html',
];
// Sezione dei partner (fra il suo `<h2 id>` e il successivo) e frase sui tempi.
export const PARTNER_C99 = {
  'docs/store/google-play/web/elimina-account.html': [
    'partner',
    'entro un mese',
  ],
  'docs/store/google-play/web/delete-account.html': [
    'partners',
    'within one month',
  ],
};
const MESI = [
  ['gennaio', 'january'],
  ['febbraio', 'february'],
  ['marzo', 'march'],
  ['aprile', 'april'],
  ['maggio', 'may'],
  ['giugno', 'june'],
  ['luglio', 'july'],
  ['agosto', 'august'],
  ['settembre', 'september'],
  ['ottobre', 'october'],
  ['novembre', 'november'],
  ['dicembre', 'december'],
];
/** Data ISO del marcatore `class="last-updated"` («24 ottobre 2026», «24 October 2026»), o null. */
export const dataMarcatore = html => {
  const m = /class="last-updated"[^>]*>([^<]*)</.exec(html ?? '');
  const d = m && /(\d{1,2})\s+([a-zà-ù]+)\s+(\d{4})/i.exec(m[1]);
  if (!d) return null;
  const mese = MESI.findIndex(n => n.includes(d[2].toLowerCase()));
  if (mese < 0) return null;
  return `${d[3]}-${String(mese + 1).padStart(2, '0')}-${d[1].padStart(2, '0')}`;
};
const sezioneHtml = (html, id) => {
  const da = String(html ?? '').search(new RegExp(`<h2[^>]*id="${id}"`));
  if (da < 0) return null;
  const fine = html.indexOf('<h2', da + 3);
  return html.slice(da, fine < 0 ? undefined : fine);
};

export const staticoC99 = {
  leggi: () => ({
    rilascio: leggiSeEsiste(RILASCIO_C99),
    urls: leggiSeEsiste(URLS_C99),
    pagine: Object.fromEntries(
      PAGINE_C99.map(f => [
        f,
        {
          testo: leggiSeEsiste(f),
          data: esegui('git', ['log', '-1', '--format=%cs', '--', f]).trim(),
        },
      ])
    ),
  }),
  verifica({ rilascio, urls, pagine }) {
    if (rilascio == null) return `${RILASCIO_C99} assente`;
    const gate = sezioni(rilascio, 2).find(s =>
      s.titolo.includes('Gate prima')
    );
    if (!gate) return `${RILASCIO_C99}: manca il gate § 8`;
    // (a) guardia: l'URL controllato dal gate è quello che apre l'app.
    const nelGate = /controlla\s+privacy-policy\.html\s+"?([^\s"]+)/.exec(
      gate.testo
    )?.[1];
    const nellApp = /privacyPolicy\s*:\s*['"]([^'"]+)['"]/.exec(
      urls ?? ''
    )?.[1];
    if (!nelGate || nelGate !== nellApp)
      return `gate § 8: URL dell'informativa ${nelGate ?? 'assente'} diverso da privacyPolicy di ${URLS_C99} (${nellApp ?? 'assente'})`;
    // (b) il marcatore di ogni pagina è la data del suo ultimo commit.
    for (const f of PAGINE_C99) {
      const p = pagine?.[f];
      if (p?.testo == null) return `${f} assente`;
      const data = dataMarcatore(p.testo);
      if (!data) return `${f}: marcatore last-updated illeggibile`;
      if (data !== p.data)
        return `${f}: marcatore ${data}, ultimo commit del file ${p.data || 'nessuno'}`;
    }
    // (c) il gate controlla che nelle pagine pubbliche non resti `da-validare`.
    if (!gate.testo.includes('da-validare'))
      return 'gate § 8: manca il controllo del marcatore da-validare';
    // (d) richieste di cancellazione da inoltrare ai partner, entro un mese.
    const chi = sezioni(rilascio, 2).find(s =>
      s.titolo.includes('Chi fa cosa')
    );
    const blocco = (chi?.testo ?? '')
      .split(/\n\s*\n/)
      .map(piano)
      .find(b => b.includes('richieste di cancellazione da inoltrare'));
    if (!blocco)
      return 'rilascio.md «Chi fa cosa»: manca «Richieste di cancellazione da inoltrare»';
    if (!blocco.includes('entro un mese'))
      return 'rilascio.md «Richieste di cancellazione da inoltrare» senza «entro un mese»';
    for (const [f, [id, frase]] of Object.entries(PARTNER_C99)) {
      const s = sezioneHtml(pagine[f].testo, id);
      if (!s) return `${f}: sezione dei partner (#${id}) non trovata`;
      if (!testoHtml(s).includes(frase))
        return `${f}: la sezione dei partner non dice «${frase}»`;
    }
    return '';
  },
};
