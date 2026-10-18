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
