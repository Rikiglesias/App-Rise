/**
 * LOCATIONS DATA - Single Source of Truth
 * Dati unificati per tutte le location geografiche
 */

export interface LocationData {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  flag: string;
  stats: {
    meals?: number;
    kits?: number;
    beneficiaries?: number;
    schools?: number;
  };
  description: string;
  program: string;
  partner?: string;
  achievements: string[];
  year: number;
  image?: string;
}

/**
 * SINGLE SOURCE OF TRUTH - Tutte le location geografiche
 * Dati reali 2024 da Rise Against Hunger Italia Annual Report
 */
export const LOCATIONS_DATA: LocationData[] = [
  {
    id: 'zimbabwe',
    name: 'Gokwe North',
    country: 'Zimbabwe',
    latitude: -18.2871,
    longitude: 28.9378,
    flag: '🇿🇼',
    stats: {
      meals: 850000,
      beneficiaries: 3200,
      schools: 5,
    },
    description:
      'Il programma "Planting Seeds for Strong Communities" ha trasformato la vita di migliaia di studenti in Zimbabwe, aumentando la frequenza scolastica del 35% attraverso giardini scolastici autosufficienti.',
    program: 'Meal Packing + Agricoltura Sostenibile',
    partner: 'ADRA Zimbabwe',
    achievements: [
      'Aumento del 35% della frequenza scolastica',
      'Pasti serviti 5 volte a settimana',
      'Giardini scolastici autosufficienti',
      '32% delle famiglie ora soddisfa i propri bisogni alimentari',
    ],
    year: 2024,
    image:
      'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'south-africa',
    name: 'Johannesburg',
    country: 'Sud Africa',
    latitude: -26.2041,
    longitude: 28.0473,
    flag: '🇿🇦',
    stats: {
      meals: 57400000,
      beneficiaries: 3600000,
    },
    description:
      'La sede regionale africana coordina progetti in tutto il continente, supportando centri per lo sviluppo della prima infanzia e iniziative di agricoltura sostenibile.',
    program: 'Early Childhood Development + Farming',
    achievements: [
      '57,4M+ pasti confezionati nel 2023',
      '3,6M+ vite impattate',
      'Centri per sviluppo prima infanzia',
      'Progetti di agricoltura sostenibile',
    ],
    year: 2023,
    image:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'italy',
    name: 'Bologna',
    country: 'Italia',
    latitude: 44.4949,
    longitude: 11.3426,
    flag: '🇮🇹',
    // NB: questi totali nazionali DUPLICANO IMPACT_DATA (mealsProduced/kitPackages/
    // volunteers in ../data/impactData.ts). Tenere allineati a ogni report annuale.
    // SSOT unica non applicata: impactData importa già questo file (deriverebbe un
    // ciclo) e 'beneficiaries' qui riusa il valore volunteers (semantica divergente).
    stats: {
      meals: 3136968,
      kits: 16321,
      beneficiaries: 13323,
    },
    description:
      'La sede italiana coordina tutte le attività europee, gestendo il progetto "Pasto Sospeso" per le emergenze locali e organizzando eventi di confezionamento con migliaia di volontari.',
    program: 'Kit Packing + Pasto Sospeso',
    achievements: [
      '3.136.968 pasti confezionati nel 2024',
      '16.321 kit prodotti',
      '13.323 volontari coinvolti',
      'Referente per tutta Europa',
    ],
    year: 2024,
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'usa',
    name: 'Raleigh',
    country: 'Stati Uniti',
    latitude: 35.7796,
    longitude: -78.6382,
    flag: '🇺🇸',
    stats: {
      meals: 365000000,
      beneficiaries: 74,
    },
    description:
      'Dal 1998, la sede globale coordina le operazioni in 74 paesi del mondo, avendo distribuito oltre 365 milioni di pasti nella lotta globale contro la fame.',
    program: 'Coordinamento Globale',
    achievements: [
      '365+ milioni di pasti distribuiti dal 2005',
      'Presente in 74 paesi nel mondo',
      '25+ anni di storia nella lotta alla fame',
      'Sede globale del movimento',
    ],
    year: 2024,
    image:
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'ukraine',
    name: 'Kiev',
    country: 'Ucraina',
    latitude: 50.4501,
    longitude: 30.5234,
    flag: '🇺🇦',
    stats: {
      meals: 250000,
      kits: 5000,
      beneficiaries: 15000,
    },
    description:
      'La risposta di emergenza per il conflitto in Ucraina ha permesso di supportare migliaia di famiglie sfollate attraverso kit alimentari e partnership con organizzazioni locali.',
    program: 'Emergenza Umanitaria',
    achievements: [
      'Supporto alle famiglie sfollate',
      'Kit alimentari di emergenza',
      'Partnership con organizzazioni locali',
      'Risposta rapida alla crisi',
    ],
    year: 2024,
    image:
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'somalia',
    name: 'Mogadiscio',
    country: 'Somalia',
    latitude: 2.0469,
    longitude: 45.3182,
    flag: '🇸🇴',
    stats: {
      meals: 180000,
      beneficiaries: 8500,
    },
    description:
      'I programmi di alimentazione scolastica stanno combattendo la malnutrizione infantile e aumentando la frequenza scolastica nelle comunità più vulnerabili.',
    program: 'School Feeding Program',
    achievements: [
      'Alimentazione nelle scuole primarie',
      'Riduzione della malnutrizione infantile',
      'Aumento della frequenza scolastica',
      'Supporto alle comunità vulnerabili',
    ],
    year: 2024,
    image:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  },
];
