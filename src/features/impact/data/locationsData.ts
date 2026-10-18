/**
 * LOCATIONS DATA - Single Source of Truth
 * Dati unificati per tutte le location geografiche
 */

import type { LocalizedText } from '../utils/localizedText';

export interface LocationData {
  id: string;
  /** Città di riferimento sulla mappa (sede o progetto): non è un dato d'impatto */
  name: LocalizedText;
  country: LocalizedText;
  latitude: number;
  longitude: number;
  flag: string;
  /** Solo numeri dell'Annual Report di `fonte` scritti accanto al paese */
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
  /** Anno dell'Annual Report di `fonte` */
  anno: number;
  /** URL dell'Annual Report da cui vengono numeri e testi */
  fonte: string;
}

/**
 * SINGLE SOURCE OF TRUTH - Tutte le location geografiche.
 * Numeri e testi dall'Annual Report di Rise Against Hunger Italia (`fonte`, p. 5, 9-11, 16):
 * pasti distribuiti per paese, kit distribuiti per area, programmi Meals e kit packing.
 */
export const LOCATIONS_DATA: LocationData[] = [
  {
    id: 'zimbabwe',
    name: { it: 'Gokwe North', en: 'Gokwe North' },
    country: { it: 'Zimbabwe', en: 'Zimbabwe' },
    latitude: -18.2871,
    longitude: 28.9378,
    flag: '🇿🇼',
    stats: {
      meals: 1775088,
    },
    description: {
      it: 'Con il programma Meals portiamo un supporto immediato alla sicurezza alimentare nelle scuole dello Zimbabwe, insieme ai partner locali. Un pasto a scuola incoraggia le famiglie a mandare i bambini a scuola.',
      en: 'Through the Meals programme we bring immediate food security support to schools in Zimbabwe, together with local partners. A meal at school encourages families to send their children to school.',
    },
    program: { it: 'Meals: pasti nelle scuole', en: 'Meals: school meals' },
    achievements: [
      {
        it: 'Pasti distribuiti nelle scuole grazie ai partner locali',
        en: 'Meals distributed in schools through local partners',
      },
      {
        it: 'Sostegno alla scolarizzazione di bambini e bambine',
        en: 'Support for the schooling of boys and girls',
      },
      {
        it: 'Stesse opportunità di apprendimento per tutti',
        en: 'Equal learning opportunities for all',
      },
    ],
    anno: 2025,
    fonte:
      'https://riseagainsthunger.org/wp-content/uploads/media/Annual-report-2025-ITA_DEF-1.pdf',
  },
  {
    id: 'south-africa',
    name: { it: 'Johannesburg', en: 'Johannesburg' },
    country: { it: 'Sudafrica', en: 'South Africa' },
    latitude: -26.2041,
    longitude: 28.0473,
    flag: '🇿🇦',
    stats: {
      meals: 570240,
    },
    description: {
      it: 'Con il programma Meals portiamo pasti nelle scuole del Sudafrica, lavorando con i nostri partner per promuovere un cambiamento sostenibile di lungo periodo.',
      en: 'Through the Meals programme we bring meals to schools in South Africa, working with our partners to promote sustainable, long-term change.',
    },
    program: { it: 'Meals: pasti nelle scuole', en: 'Meals: school meals' },
    achievements: [
      {
        it: 'Pasti distribuiti nelle scuole grazie ai partner locali',
        en: 'Meals distributed in schools through local partners',
      },
      {
        it: 'Cambiamento sostenibile di lungo periodo',
        en: 'Sustainable, long-term change',
      },
    ],
    anno: 2025,
    fonte:
      'https://riseagainsthunger.org/wp-content/uploads/media/Annual-report-2025-ITA_DEF-1.pdf',
  },
  {
    id: 'italy',
    name: { it: 'Bologna', en: 'Bologna' },
    country: { it: 'Italia', en: 'Italy' },
    latitude: 44.4949,
    longitude: 11.3426,
    flag: '🇮🇹',
    // Volontari e vite dell'Italia stanno in IMPACT_DATA: qui solo i kit distribuiti in Italia.
    stats: {
      kits: 5833,
    },
    description: {
      it: 'La sede di Rise Against Hunger Italia è a Bologna. Con il kit packing aiutiamo anche persone in difficoltà nel nostro territorio, insieme a una rete di associazioni partner, e con la campagna "Un pasto in sospeso" confezioniamo e distribuiamo cibo per famiglie in difficoltà.',
      en: 'Rise Against Hunger Italia is based in Bologna. Through kit packing we also help people in need in our own area, together with a network of partner associations, and with the "Un pasto in sospeso" campaign we pack and distribute food for families in need.',
    },
    program: {
      it: 'Kit packing + Un pasto in sospeso',
      en: 'Kit packing + Un pasto in sospeso',
    },
    achievements: [
      {
        it: 'Kit alimentari per persone in difficoltà nel nostro territorio',
        en: 'Food kits for people in need in our own area',
      },
      {
        it: 'Rete di associazioni partner',
        en: 'Network of partner associations',
      },
      {
        it: 'Eventi di confezionamento con volontari, aziende e associazioni',
        en: 'Packing events with volunteers, companies and associations',
      },
    ],
    anno: 2025,
    fonte:
      'https://riseagainsthunger.org/wp-content/uploads/media/Annual-report-2025-ITA_DEF-1.pdf',
  },
  {
    id: 'usa',
    name: { it: 'Raleigh', en: 'Raleigh' },
    country: { it: 'Stati Uniti', en: 'United States' },
    latitude: 35.7796,
    longitude: -78.6382,
    flag: '🇺🇸',
    stats: {},
    description: {
      it: "Rise Against Hunger è nata negli Stati Uniti con il nome di Stop Hunger Now. Oggi è un'organizzazione internazionale con sede in diversi paesi, guidata dalla visione di un mondo senza fame.",
      en: 'Rise Against Hunger began in the United States under the name Stop Hunger Now. Today it is an international organisation based in several countries, guided by the vision of a world without hunger.',
    },
    program: { it: 'Coordinamento globale', en: 'Global coordination' },
    achievements: [
      {
        it: 'Il movimento è nato negli Stati Uniti',
        en: 'The movement began in the United States',
      },
      {
        it: 'Sedi in diversi paesi del mondo',
        en: 'Offices in several countries worldwide',
      },
    ],
    anno: 2025,
    fonte:
      'https://riseagainsthunger.org/wp-content/uploads/media/Annual-report-2025-ITA_DEF-1.pdf',
  },
  {
    id: 'ukraine',
    name: { it: 'Kiev', en: 'Kyiv' },
    country: { it: 'Ucraina', en: 'Ukraine' },
    latitude: 50.4501,
    longitude: 30.5234,
    flag: '🇺🇦',
    stats: {
      meals: 52272,
      kits: 4100,
    },
    description: {
      it: "La nostra azione si concentra soprattutto sull'Ucraina e sui territori vicini coinvolti nella guerra, come la Moldavia o la Slovacchia: i kit aiutano le persone nelle aree più colpite, come Odessa, Kharkiv e Zaporizhzhia.",
      en: 'Our work focuses above all on Ukraine and on neighbouring areas affected by the war, such as Moldova and Slovakia: the kits help people in the hardest-hit areas, such as Odesa, Kharkiv and Zaporizhzhia.',
    },
    program: {
      it: 'Kit packing per le emergenze',
      en: 'Kit packing for emergencies',
    },
    achievements: [
      {
        it: 'Kit alimentari nelle aree più colpite dalla guerra',
        en: 'Food kits in the areas hardest hit by the war',
      },
      {
        it: 'Aiuti anche nei territori vicini',
        en: 'Aid in neighbouring areas too',
      },
    ],
    anno: 2025,
    fonte:
      'https://riseagainsthunger.org/wp-content/uploads/media/Annual-report-2025-ITA_DEF-1.pdf',
  },
];
