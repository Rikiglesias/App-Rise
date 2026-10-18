import type { ImpactDataType } from '@/features/impact/types/ImpactScreenTypes';

/**
 * Numeri d'impatto di Rise Against Hunger Italia: una fonte sola, l'Annual Report 2025.
 * Ogni numero è confermato sulla pagina del PDF indicata accanto; l'anno dei risultati sta
 * solo in `resultsYear` e le etichette lo ricevono per interpolazione.
 */
export const IMPACT_DATA: ImpactDataType = {
  fonte:
    'https://riseagainsthunger.org/wp-content/uploads/media/Annual-report-2025-ITA_DEF-1.pdf',
  resultsYear: 2025,

  // Dalla nascita di RAH Italia (AR 2025, p. 16)
  mealsProducedLifetime: 24562744, // «meals prodotti dalla nascita di RAH Italia»
  kitsProducedLifetime: 82517, // «kit prodotti dalla nascita di RAH Italia»

  // Anno dei risultati (AR 2025, p. 16)
  mealsProduced: 2248344, // «meals prodotti» (non i 2.397.600 distribuiti)
  livesImpactedMeals: 11100, // «vite impattate» dai pasti prodotti nell'anno
  volunteers: 10414, // «volontari coinvolti»

  // Pasti distribuiti nell'anno e per paese (AR 2025, p. 9 e p. 16): la somma dei paesi
  // è il totale distribuito.
  mealsDistributed: 2397600, // «meals distribuiti»
  mealsByCountry: { zimbabwe: 1775088, southAfrica: 570240, ukraine: 52272 },

  // Kit dell'anno (AR 2025, p. 10 e p. 16): i pasti garantiti valgono per i kit
  // distribuiti (429.080 = 40 × 10.727), le vite sono quelle della pagina del kit packing.
  kitsProduced: 10427, // «kit prodotti»
  kitsDistributed: 10727, // «kit distribuiti»
  kitsByArea: { italy: 5833, ukraine: 4100, europe: 794 }, // p. 16, «EU» = 794 (p. 14)
  mealsGuaranteedByKits: 429080, // «pasti garantiti»
  livesImpactedKits: 33618, // «vite impattate», p. 10
  mealsPerKit: 40, // «l'equivalente di circa 40 pasti», p. 10

  // Dalla nascita di RAH Italia, oltre ai due totali in testa (AR 2025, p. 16)
  mealsGuaranteedByKitsLifetime: 3300680, // «pasti garantiti dalla nascita»
  livesImpactedLifetime: 114407, // «vite impattate» dai pasti dalla nascita

  // «Associazioni partner» (AR 2025, p. 17): il report le elenca senza contarle,
  // il numero mostrato è la lunghezza dell'elenco.
  partnerAssociations: [
    'Feed the hungry UK',
    'Emporio Solidale Il Sole',
    'Emporio Pane e solidarietà',
    'Associazione La Piccola Betlemme',
    'Caritas Diocesana di Bologna',
    'Cooperativa Roma Solidarietà',
    'Caritas Decanale di Busto Arsizio',
    'Fondazione Gruppo Abele',
    'Associazione Don Adriano Filippi',
    'Associazione “La Strada”',
    'Caritas Ambrosiana',
    'Parrocchia Corpus Domini di Bologna',
    'Il Campanile ETS',
    'Croce Rossa Comitato di Milano',
    'Emporio Dora ODV',
    'Fondazione San Petronio',
    'Associazione Area 51',
    'Nonna Roma ODV',
    'Associazione Generazione Migranti',
    'Les Restos du Coeur',
    'Vides Main ODV',
    'Convoy of Hope',
  ],
} as const;

// Re-export dati geografici da single source of truth
export { LOCATIONS_DATA as MAP_LOCATIONS } from './locationsData';
