import type { Location } from '../components/InteractiveMap';
import type { ImpactDataType } from '../types/ImpactScreenTypes';

// Dati reali da Rise Against Hunger Italia (Report 2024)
export const IMPACT_DATA: ImpactDataType = {
  mealsDistributed: 3136968,
  volunteers: 13323,
  livesImpacted: 103307, // Solo vite impattate dai pasti
  stories: [
    {
      id: 'zimbabwe',
      title: 'La storia di Vitale',
      location: 'Zimbabwe',
      text: 'Vitale, 12 anni, va a scuola solo nei giorni in cui viene servito un pasto.\n\nQuesto gli garantisce di mangiare almeno due volte al giorno, altrimenti lavorerebbe per aiutare la famiglia, mangiando una sola volta la sera.',
      image:
        'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
    },
    {
      id: 'ukraine',
      title: 'La speranza di Maria',
      location: 'Ucraina',
      text: "Maria, 75 anni, ha perso tutto a causa della guerra. 'Ho 75 anni e ora non ho nulla', dice.\n\nGli aiuti ricevuti, come i nostri kit alimentari, sono stati fondamentali per ritrovare la speranza.",
      image:
        'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
    },
  ],
  milestones: [
    {
      id: 'paladozza',
      title: 'PalaDozza, Bologna',
      value: '+50.000 Pasti',
      icon: 'stadium-variant',
    },
    {
      id: 'monza',
      title: 'GP di Monza',
      value: '+60.000 Pasti',
      icon: 'flag-checkered',
    },
    {
      id: 'roma',
      title: 'Primo Maggio, Roma',
      value: "Partner dell'evento",
      icon: 'microphone-variant',
    },
  ],
} as const;

// Dati per la mappa interattiva
export const MAP_LOCATIONS: Location[] = [
  {
    id: 'zimbabwe',
    name: 'Progetti in Zimbabwe',
    country: 'Zimbabwe',
    coordinates: { latitude: -19.0154, longitude: 29.1549 },
    projects: 5,
    beneficiaries: '15,000+',
    status: 'active',
    description:
      'Supporto alimentare e programmi scolastici per bambini come Vitale.',
    image:
      'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'ukraine',
    name: 'Aiuti in Ucraina',
    country: 'Ucraina',
    coordinates: { latitude: 48.3794, longitude: 31.1656 },
    projects: 3,
    beneficiaries: '25,000+',
    status: 'emergency',
    description:
      'Fornitura di kit alimentari di emergenza per le famiglie colpite dalla guerra.',
    image:
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'italy',
    name: 'Eventi in Italia',
    country: 'Italia',
    coordinates: { latitude: 41.9028, longitude: 12.4964 }, // Rome
    projects: 10,
    beneficiaries: 'Volontari e comunità locali',
    status: 'events',
    description:
      'Eventi di confezionamento pasti e sensibilizzazione in tutta Italia.',
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  },
];

// Formattatore di numeri
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('it-IT').format(num);
};
