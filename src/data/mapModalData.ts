// Dati dettagliati per i modals della mappa interattiva
export interface MapModalData {
  id: string;
  title: string;
  subtitle: string;
  flag: string;
  description: string;
  program: string;
  partner?: string;
  achievements: string[];
  stats: {
    meals?: number;
    kits?: number;
    beneficiaries?: number;
    schools?: number;
  };
  year: number;
  image?: string;
}

// Dati reali dei progetti Rise Against Hunger Italia per i modals
export const MAP_MODAL_DATA: Record<string, MapModalData> = {
  zimbabwe: {
    id: 'zimbabwe',
    title: 'Gokwe North',
    subtitle: 'Zimbabwe',
    flag: '🇿🇼',
    description:
      'Il programma "Planting Seeds for Strong Communities" ha trasformato la vita di migliaia di studenti in Zimbabwe, aumentando la frequenza scolastica del 35% attraverso giardini scolastici autosufficienti.',
    program: 'Meal Packing + Agricoltura Sostenibile',
    partner: 'ADRA Zimbabwe',
    achievements: [
      'Aumento del 35% della frequenza scolastica',
      'Pasti serviti 5 volte a settimana',
      'Giardini scolastici autosufficienti',
      '32% delle famiglie ora soddisfa i bisogni alimentari',
    ],
    stats: {
      meals: 850000,
      beneficiaries: 3200,
      schools: 5,
    },
    year: 2024,
    image:
      'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  },

  'south-africa': {
    id: 'south-africa',
    title: 'Johannesburg',
    subtitle: 'Sud Africa',
    flag: '🇿🇦',
    description:
      'La sede regionale africana coordina progetti in tutto il continente, supportando centri per lo sviluppo della prima infanzia e iniziative di agricoltura sostenibile.',
    program: 'Early Childhood Development + Farming',
    achievements: [
      '57,4M+ pasti confezionati nel 2023',
      '3,6M+ vite impattate',
      'Centri per sviluppo prima infanzia',
      'Progetti di agricoltura sostenibile',
    ],
    stats: {
      meals: 57400000,
      beneficiaries: 3600000,
    },
    year: 2023,
    image:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  },

  italy: {
    id: 'italy',
    title: 'Bologna',
    subtitle: 'Italia - Sede Europea',
    flag: '🇮🇹',
    description:
      'La sede italiana coordina tutte le attività europee, gestendo il progetto "Pasto Sospeso" per le emergenze locali e organizzando eventi di confezionamento con migliaia di volontari.',
    program: 'Kit Packing + Pasto Sospeso',
    achievements: [
      '3.136.968 pasti confezionati nel 2024',
      '16.321 kit prodotti',
      '13.323 volontari coinvolti',
      'Referente per tutta Europa',
    ],
    stats: {
      meals: 3136968,
      kits: 16321,
      beneficiaries: 13323,
    },
    year: 2024,
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  },

  usa: {
    id: 'usa',
    title: 'Raleigh',
    subtitle: 'Stati Uniti - Sede Globale',
    flag: '🇺🇸',
    description:
      'Dal 1998, la sede globale coordina le operazioni in 74 paesi del mondo, avendo distribuito oltre 365 milioni di pasti nella lotta globale contro la fame.',
    program: 'Coordinamento Globale',
    achievements: [
      '365+ milioni di pasti distribuiti dal 2005',
      'Presente in 74 paesi nel mondo',
      '25+ anni di storia nella lotta alla fame',
      'Sede globale del movimento',
    ],
    stats: {
      meals: 365000000,
      beneficiaries: 74,
    },
    year: 2024,
    image:
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  },

  ukraine: {
    id: 'ukraine',
    title: 'Kiev',
    subtitle: 'Ucraina - Emergenza Umanitaria',
    flag: '🇺🇦',
    description:
      'La risposta di emergenza per il conflitto in Ucraina ha permesso di supportare migliaia di famiglie sfollate attraverso kit alimentari e partnership con organizzazioni locali.',
    program: 'Emergenza Umanitaria',
    achievements: [
      'Supporto alle famiglie sfollate',
      'Kit alimentari di emergenza',
      'Partnership con organizzazioni locali',
      'Risposta rapida alla crisi',
    ],
    stats: {
      meals: 250000,
      kits: 5000,
      beneficiaries: 15000,
    },
    year: 2024,
    image:
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  },

  somalia: {
    id: 'somalia',
    title: 'Mogadiscio',
    subtitle: 'Somalia',
    flag: '🇸🇴',
    description:
      'I programmi di alimentazione scolastica stanno combattendo la malnutrizione infantile e aumentando la frequenza scolastica nelle comunità più vulnerabili.',
    program: 'School Feeding Program',
    achievements: [
      'Alimentazione nelle scuole primarie',
      'Riduzione della malnutrizione infantile',
      'Aumento della frequenza scolastica',
      'Supporto alle comunità vulnerabili',
    ],
    stats: {
      meals: 180000,
      beneficiaries: 8500,
    },
    year: 2024,
    image:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  },
};

// Funzione per ottenere i dati di un modal specifico
export const getModalData = (locationId: string): MapModalData | null => {
  return MAP_MODAL_DATA[locationId] ?? null;
};

// Formattatore per le statistiche
export const formatStat = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M+`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K+`;
  }
  return value.toLocaleString('it-IT');
};
