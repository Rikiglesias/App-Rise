/**
 * LOCATIONS DATA - Single Source of Truth
 * Dati unificati per tutte le location geografiche
 */

import type { LocalizedText } from '../utils/localizedText';

export interface LocationData {
  id: string;
  name: string;
  country: LocalizedText;
  latitude: number;
  longitude: number;
  flag: string;
  stats: {
    meals?: number;
    kits?: number;
    beneficiaries?: number;
    schools?: number;
  };
  description: LocalizedText;
  program: LocalizedText;
  partner?: string;
  achievements: LocalizedText[];
  year: number;
}

/**
 * SINGLE SOURCE OF TRUTH - Tutte le location geografiche
 * Dati reali 2024 da Rise Against Hunger Italia Annual Report
 */
export const LOCATIONS_DATA: LocationData[] = [
  {
    id: 'zimbabwe',
    name: 'Gokwe North',
    country: { it: 'Zimbabwe', en: 'Zimbabwe' },
    latitude: -18.2871,
    longitude: 28.9378,
    flag: '🇿🇼',
    stats: {
      meals: 850000,
      beneficiaries: 3200,
      schools: 5,
    },
    description: {
      it: 'Il programma "Planting Seeds for Strong Communities" ha trasformato la vita di migliaia di studenti in Zimbabwe, aumentando la frequenza scolastica del 35% attraverso giardini scolastici autosufficienti.',
      en: 'The "Planting Seeds for Strong Communities" program has transformed the lives of thousands of students in Zimbabwe, increasing school attendance by 35% through self-sufficient school gardens.',
    },
    program: {
      it: 'Meal Packing + Agricoltura Sostenibile',
      en: 'Meal Packing + Sustainable Agriculture',
    },
    partner: 'ADRA Zimbabwe',
    achievements: [
      {
        it: 'Aumento del 35% della frequenza scolastica',
        en: '35% increase in school attendance',
      },
      {
        it: 'Pasti serviti 5 volte a settimana',
        en: 'Meals served 5 times a week',
      },
      {
        it: 'Giardini scolastici autosufficienti',
        en: 'Self-sufficient school gardens',
      },
      {
        it: '32% delle famiglie ora soddisfa i propri bisogni alimentari',
        en: '32% of families now meet their own food needs',
      },
    ],
    year: 2024,
  },
  {
    id: 'south-africa',
    name: 'Johannesburg',
    country: { it: 'Sud Africa', en: 'South Africa' },
    latitude: -26.2041,
    longitude: 28.0473,
    flag: '🇿🇦',
    stats: {
      meals: 57400000,
      beneficiaries: 3600000,
    },
    description: {
      it: 'La sede regionale africana coordina progetti in tutto il continente, supportando centri per lo sviluppo della prima infanzia e iniziative di agricoltura sostenibile.',
      en: 'The African regional office coordinates projects across the continent, supporting early childhood development centres and sustainable agriculture initiatives.',
    },
    program: {
      it: 'Early Childhood Development + Farming',
      en: 'Early Childhood Development + Farming',
    },
    achievements: [
      {
        it: '57,4M+ pasti confezionati nel 2023',
        en: '57.4M+ meals packed in 2023',
      },
      { it: '3,6M+ vite impattate', en: '3.6M+ lives impacted' },
      {
        it: 'Centri per sviluppo prima infanzia',
        en: 'Early childhood development centres',
      },
      {
        it: 'Progetti di agricoltura sostenibile',
        en: 'Sustainable agriculture projects',
      },
    ],
    year: 2023,
  },
  {
    id: 'italy',
    name: 'Bologna',
    country: { it: 'Italia', en: 'Italy' },
    latitude: 44.4949,
    longitude: 11.3426,
    flag: '🇮🇹',
    // NB: i numeri dell'Italia qui sotto vengono ancora dall'Annual Report 2024 e NON sono
    // allineati a IMPACT_DATA (../data/impactData.ts, Annual Report 2025). Si rifanno in
    // C39 (lotto F9-3): lì `stats` dell'Italia tiene solo `meals` e `kits`, volontari e
    // vite stanno in IMPACT_DATA. Oggi 'beneficiaries' riusa i volontari del 2024.
    stats: {
      meals: 3136968,
      kits: 16321,
      beneficiaries: 13323,
    },
    description: {
      it: 'La sede italiana coordina tutte le attività europee, gestendo il progetto "Pasto Sospeso" per le emergenze locali e organizzando eventi di confezionamento con migliaia di volontari.',
      en: 'The Italian office coordinates all European activities, managing the "Pasto Sospeso" project for local emergencies and organising packing events with thousands of volunteers.',
    },
    program: {
      it: 'Kit Packing + Pasto Sospeso',
      en: 'Kit Packing + Pasto Sospeso',
    },
    achievements: [
      {
        it: '3.136.968 pasti confezionati nel 2024',
        en: '3,136,968 meals packed in 2024',
      },
      { it: '16.321 kit prodotti', en: '16,321 kits produced' },
      { it: '13.323 volontari coinvolti', en: '13,323 volunteers involved' },
      {
        it: 'Referente per tutta Europa',
        en: 'Contact point for all of Europe',
      },
    ],
    year: 2024,
  },
  {
    id: 'usa',
    name: 'Raleigh',
    country: { it: 'Stati Uniti', en: 'United States' },
    latitude: 35.7796,
    longitude: -78.6382,
    flag: '🇺🇸',
    stats: {
      meals: 365000000,
      beneficiaries: 74,
    },
    description: {
      it: 'Dal 1998, la sede globale coordina le operazioni in 74 paesi del mondo, avendo distribuito oltre 365 milioni di pasti nella lotta globale contro la fame.',
      en: 'Since 1998, the global headquarters has coordinated operations in 74 countries worldwide, distributing over 365 million meals in the global fight against hunger.',
    },
    program: { it: 'Coordinamento Globale', en: 'Global Coordination' },
    achievements: [
      {
        it: '365+ milioni di pasti distribuiti dal 2005',
        en: '365+ million meals distributed since 2005',
      },
      {
        it: 'Presente in 74 paesi nel mondo',
        en: 'Present in 74 countries worldwide',
      },
      {
        it: '25+ anni di storia nella lotta alla fame',
        en: '25+ years of fighting hunger',
      },
      {
        it: 'Sede globale del movimento',
        en: 'Global headquarters of the movement',
      },
    ],
    year: 2024,
  },
  {
    id: 'ukraine',
    name: 'Kiev',
    country: { it: 'Ucraina', en: 'Ukraine' },
    latitude: 50.4501,
    longitude: 30.5234,
    flag: '🇺🇦',
    stats: {
      meals: 250000,
      kits: 5000,
      beneficiaries: 15000,
    },
    description: {
      it: 'La risposta di emergenza per il conflitto in Ucraina ha permesso di supportare migliaia di famiglie sfollate attraverso kit alimentari e partnership con organizzazioni locali.',
      en: 'The emergency response to the conflict in Ukraine has supported thousands of displaced families through food kits and partnerships with local organisations.',
    },
    program: { it: 'Emergenza Umanitaria', en: 'Humanitarian Emergency' },
    achievements: [
      {
        it: 'Supporto alle famiglie sfollate',
        en: 'Support for displaced families',
      },
      { it: 'Kit alimentari di emergenza', en: 'Emergency food kits' },
      {
        it: 'Partnership con organizzazioni locali',
        en: 'Partnerships with local organisations',
      },
      { it: 'Risposta rapida alla crisi', en: 'Rapid crisis response' },
    ],
    year: 2024,
  },
  {
    id: 'somalia',
    name: 'Mogadiscio',
    country: { it: 'Somalia', en: 'Somalia' },
    latitude: 2.0469,
    longitude: 45.3182,
    flag: '🇸🇴',
    stats: {
      meals: 180000,
      beneficiaries: 8500,
    },
    description: {
      it: 'I programmi di alimentazione scolastica stanno combattendo la malnutrizione infantile e aumentando la frequenza scolastica nelle comunità più vulnerabili.',
      en: 'School feeding programs are tackling child malnutrition and increasing school attendance in the most vulnerable communities.',
    },
    program: { it: 'School Feeding Program', en: 'School Feeding Program' },
    achievements: [
      {
        it: 'Alimentazione nelle scuole primarie',
        en: 'Meals in primary schools',
      },
      {
        it: 'Riduzione della malnutrizione infantile',
        en: 'Reduced child malnutrition',
      },
      {
        it: 'Aumento della frequenza scolastica',
        en: 'Increased school attendance',
      },
      {
        it: 'Supporto alle comunità vulnerabili',
        en: 'Support for vulnerable communities',
      },
    ],
    year: 2024,
  },
];
