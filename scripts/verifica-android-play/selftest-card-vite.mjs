// C22 per la card delle vite di C7 (R18-R20): una fixture negativa per ogni ramo del criterio.
// Ogni negativa è il positivo con UNA mutazione.
import { senzaMockLazy, sha256 } from './card-vite.mjs';

const ANNUAL = 'src/features/impact/components/AnnualResultsSection.tsx';
const CARD = `<StatCard
  value={formatNumber(IMPACT_DATA.livesImpactedMeals, locale)}
  label={t('impact.livesImpactedLabel')}
  subtitle={t('impact.livesImpactedSubtitle', { year })}
  pressable={false}
/>`;
const SEZIONE = `const year = IMPACT_DATA.resultsYear;\n${CARD}`;
const lingua = (etichetta, sottotitolo) => `export default {
  navigation: { impact: 'Impatto' },
  impact: {
    livesImpactedLabel: '${etichetta}',
    livesImpactedSubtitle: '${sottotitolo}',
  },
};`;
const IT = lingua('Vite Impattate', 'Con i pasti del {{year}}');
const EN = lingua('Lives Impacted', 'Through {{year}} meals');
const TEST = `jest.mock('expo-haptics');
jest.mock('@/navigation/LazyLoading', () => ({
  WrappedImpatto2024Screen: () => null,
  WrappedDevelopmentScreen: () => null,
}));

it('apre il profilo', () => {
  expect(true).toBe(true);
});
`;

export const CARD_OK = {
  impatto: [{ nome: ANNUAL, testo: SEZIONE }],
  it: IT,
  en: EN,
  resultsYear: 2025,
  anno2025: true,
  testProtetto: TEST,
  shaTestProtetto: sha256(senzaMockLazy(TEST)),
};
const conSezione = testo => ({ impatto: [{ nome: ANNUAL, testo }] });
const sostituisci = (da, a) => conSezione(SEZIONE.replace(da, a));

export const CARD_NEG = [
  // card non trovata / fuori da AnnualResultsSection
  sostituisci('livesImpactedMeals', 'volunteers'),
  {
    impatto: [
      {
        nome: 'src/features/impact/screens/BeneficiariesScreen.tsx',
        testo: SEZIONE,
      },
    ],
  },
  // StatCard presente solo in un commento
  conSezione(`const year = IMPACT_DATA.resultsYear;\n{/* ${CARD} */}`),
  // cifra in it, cifra in en (la vecchia fixture positiva con «2025» scritto)
  { it: lingua('Vite impattate nel 2025', 'Con i pasti del {{year}}') },
  { en: lingua('Lives Impacted 2025', 'Through {{year}} meals') },
  // {{year}} assente (in it), {{year}} in en su una t() che non passa year
  { it: lingua('Vite Impattate', 'Con i pasti annuali') },
  { en: lingua('Lives Impacted {{year}}', 'Through {{year}} meals') },
  // t() senza year, Y da un'altra fonte, Y scritto, Y dichiarato due volte
  sostituisci(
    "'impact.livesImpactedSubtitle', { year }",
    "'impact.livesImpactedSubtitle'"
  ),
  conSezione(SEZIONE.replace('IMPACT_DATA.resultsYear;', '2025;')),
  sostituisci('{ year }', '{ year: new Date().getFullYear() }'),
  sostituisci('{ year }', "{ year: '2025' }"),
  conSezione(`${SEZIONE}\nconst anni = [1].map(year => year);`),
  // prop come template literal, chiave non risolta, chiave fuori percorso
  sostituisci(
    "t('impact.livesImpactedLabel')",
    't(`impact.livesImpactedLabel`)'
  ),
  sostituisci("'impact.livesImpactedLabel'", "'impact.livesImpactedLabelX'"),
  sostituisci("'impact.livesImpactedLabel'", "'navigation.livesImpactedLabel'"),
  // resultsYear diverso, estratto senza 11.100
  { resultsYear: 2024 },
  { anno2025: false },
  // test protetto cambiato fuori dal blocco, o illeggibile
  { testProtetto: TEST.replace('toBe(true)', 'toBe(false)') },
  { testProtetto: null },
];

export const CARD_POS = [
  {},
  // anno nell'etichetta, nessuna subtitle, Y = IMPACT_DATA.resultsYear
  {
    ...conSezione(
      CARD.replace(/\n {2}subtitle=.*$/m, '').replace(
        "t('impact.livesImpactedLabel')",
        "t('impact.livesImpactedLabel', { year: IMPACT_DATA.resultsYear })"
      )
    ),
    it: lingua('Vite impattate nel {{year}}', 'Con i pasti'),
    en: lingua('Lives impacted in {{year}}', 'Through meals'),
  },
  // una StatCard sbagliata dentro un commento non conta
  conSezione(
    `${SEZIONE}\n{/* <StatCard value={IMPACT_DATA.livesImpactedMeals} label="x" /> */}`
  ),
  // mock ridotto o tolto, file con CRLF
  {
    testProtetto: TEST.replace('  WrappedDevelopmentScreen: () => null,\n', ''),
  },
  {
    testProtetto: TEST.replace(
      /jest\.mock\('@\/navigation\/LazyLoading'[\s\S]*?\}\)\);\n/,
      ''
    ),
  },
  { testProtetto: TEST.replace(/\n/g, '\r\n') },
];
