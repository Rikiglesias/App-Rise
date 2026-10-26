// C22 per C99 (R28-R29, documenti pubblici): ogni fixture negativa è il positivo con UNA mutazione; il
// lettore riceve runbook, URL dell'app e pagine HTML intere con la data del loro ultimo commit.
import { PAGINE_C99 } from './f13-r27-pubblici.mjs';
import { casi } from './selftest-f13-esterni.mjs';

// --- C99 ---
const [IT, EN, ELIMINA, DELETE] = PAGINE_C99;
const URL_PRIVACY = 'https://italy.riseagainsthunger.org/privacy-policy/';
const RILASCIO = [
  "## 8. Gate prima dell'invio a Play",
  `controlla privacy-policy.html ${URL_PRIVACY}`,
  'grep -l da-validare privacy-policy.html privacy-policy-en.html && echo NON INVIARE',
  '',
  '## Chi fa cosa',
  '### Riccardo',
  'Richieste di cancellazione da inoltrare: a Donorbox e',
  "Let's Donation, entro un mese.",
  '',
].join('\n');
const pagina = (marcatore, corpo = '') =>
  `<p class="last-updated">${marcatore}</p>\n${corpo}`;
const C99_OK = {
  rilascio: RILASCIO,
  urls: `privacyPolicy: '${URL_PRIVACY}',`,
  pagine: {
    [IT]: {
      testo: pagina('Ultimo aggiornamento: 24 ottobre 2026'),
      data: '2026-10-24',
    },
    [EN]: {
      testo: pagina('Last updated: 24 October 2026'),
      data: '2026-10-24',
    },
    [ELIMINA]: {
      testo: pagina(
        'Ultimo aggiornamento: 6 novembre 2026',
        '<h2 id="partner">5. Partner</h2>\n<p>Inoltriamo la richiesta entro un mese.</p>\n<h2 id="tempi">6. Tempi</h2>\n<p>Altro.</p>'
      ),
      data: '2026-11-06',
    },
    [DELETE]: {
      testo: pagina(
        'Last updated: 6 November 2026',
        '<h2 id="partners">5. Partners</h2>\n<p>We forward the request within one month.</p>\n<h2 id="timing">6</h2>'
      ),
      data: '2026-11-06',
    },
  },
};
const conPagina = (f, mut) => ({
  pagine: { ...C99_OK.pagine, [f]: { ...C99_OK.pagine[f], ...mut } },
});

export const FIXTURE_F13_R27_PUBBLICI = {
  C99: casi({ statico: C99_OK }, [
    { statico: { ...C99_OK, rilascio: null } },
    {
      statico: {
        ...C99_OK,
        urls: "privacyPolicy: 'https://italy.riseagainsthunger.org/privacy/',",
      },
    },
    { statico: { ...C99_OK, urls: null } },
    { statico: { ...C99_OK, ...conPagina(ELIMINA, { data: '2026-10-22' }) } },
    {
      statico: {
        ...C99_OK,
        ...conPagina(EN, { testo: pagina('Last updated: soon') }),
      },
    },
    { statico: { ...C99_OK, ...conPagina(IT, { testo: null }) } },
    {
      statico: {
        ...C99_OK,
        rilascio: RILASCIO.replace('grep -l da-validare', 'grep -l marcatore'),
      },
    },
    {
      statico: {
        ...C99_OK,
        rilascio: RILASCIO.replace(
          'Richieste di cancellazione da inoltrare',
          'Richieste'
        ),
      },
    },
    {
      statico: {
        ...C99_OK,
        rilascio: RILASCIO.replace(
          "Let's Donation, entro un mese.",
          "Let's Donation.\n\nEntro un mese."
        ),
      },
    },
    {
      statico: {
        ...C99_OK,
        ...conPagina(ELIMINA, {
          testo: pagina(
            'Ultimo aggiornamento: 6 novembre 2026',
            '<h2 id="partner">5</h2><p>Scrivi a loro.</p><h2 id="tempi">6</h2><p>Entro un mese.</p>'
          ),
        }),
      },
    },
  ]),
};
