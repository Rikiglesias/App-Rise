import type { ImpactDataType } from '@/features/impact/types/ImpactScreenTypes';

// Dati reali 2024 da Rise Against Hunger Italia Annual Report
export const IMPACT_DATA: ImpactDataType = {
  // PASTI TOTALI RAGGIUNTI (3.136.968 prodotti nel 2024)
  mealsDistributed: 3136968,
  mealsProduced: 3136968,
  mealsDistributedTotal: 3023136, // distribuiti nel 2024

  // KIT PACKAGES (16.321 prodotti nel 2024)
  kitPackages: 16321,
  kitDistributed: 18398, // distribuiti nel 2024 (includendo giacenze)
  kitProducedTotal: 72090, // dalla nascita di RAH Italia

  // VOLONTARI (13.323 nel 2024)
  volunteers: 13323,
  volunteersTotal: 92005, // dalla nascita di RAH Italia

  // PERSONE AIUTATE - DIVISE PER MEALS E KIT
  // Meals: 103.307 vite impattate dai pasti
  livesImpactedMeals: 103307,
  // Kit: 251.742 vite impattate dai kit (dato lifetime)
  livesImpactedKits: 251742,
  // Totale vite impattate: oltre 355.000 persone
  livesImpacted: 355049,

  // TOTALI STORICI
  mealsProducedLifetime: 22314400, // dalla nascita di RAH Italia

  // STORIE REALI DAL REPORT 2024
  stories: [
    {
      id: 'vitale-zimbabwe',
      title: 'La storia di Vitale',
      location: 'Zimbabwe - Simcheerba',
      text: 'Vitale Zhou, 12 anni, studente di seconda media a Simcheerba. Viene da una famiglia di sette persone. Frequenta la scuola solo 3 giorni su 5, scegliendo di andare nei giorni in cui viene servito un pasto.\n\nGli altri due giorni aiuta il paese a costruire mattoni per mantenere la famiglia. Preferisce andare a scuola quando viene servito del cibo, perché ciò gli assicura almeno due pasti al giorno.',
      image:
        'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      category: 'meals',
      year: 2024,
    },
    {
      id: 'maria-ukraine',
      title: 'La speranza di Maria',
      location: 'Ucraina - Regione di Kharkiv',
      text: 'Maria, 75 anni, ha perso tutto a causa della guerra. "A marzo è saltata la corrente e io avevo con me i miei nipotini. Abbiamo trascorso un mese in cantina."\n\n"Ho 75 anni e ora non ho nulla", dice con le lacrime agli occhi. Ma grazie agli aiuti ricevuti, come i nostri kit alimentari, ha trovato la speranza. "Vi ringrazio per quello che fate per aiutarci."',
      image:
        'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      category: 'kits',
      year: 2024,
    },
    {
      id: 'emporio-sole',
      title: 'Emporio Solidale Il Sole',
      location: 'Casalecchio di Reno, Bologna',
      text: "L'Emporio Solidale Il Sole funziona come un supermercato, ma qui i prodotti non si pagano con denaro e i commessi sono volontari.\n\nNel giugno 2024, Rise Against Hunger Italia ha donato 500 kit alimentari all'Emporio, contribuendo non solo al soddisfacimento dei bisogni primari ma anche favorendo percorsi verso l'autonomia.",
      image:
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      category: 'kits',
      year: 2024,
    },
    {
      id: 'campi-arte',
      title: "Cooperativa Campi d'Arte",
      location: 'Bologna',
      text: "Gli utenti della Cooperativa Sociale Campi d'Arte svolgono attività di kit packing nel magazzino di Rise Against Hunger Italia in un'ottica di esperienza lavorativa.\n\n\"Essere parte attiva in un progetto di solidarietà permette loro di sentirsi valorizzati e riconosciuti\", racconta l'educatrice Eleonora.",
      image:
        'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      category: 'social',
      year: 2024,
    },
  ],

  // EVENTI E MILESTONE 2024
  milestones: [
    {
      id: 'paladozza-bologna',
      title: 'PalaDozza, Bologna',
      value: '+50.000 Pasti',
      icon: 'stadium-variant',
      description:
        '16 marzo 2024 - Grande festa solidale con volontari da tutta Italia',
    },
    {
      id: 'gp-monza',
      title: 'GP di Monza',
      value: '+60.000 Pasti',
      icon: 'flag-checkered',
      description:
        "1° settembre 2024 - Pit stop solidale alla Fan Zone dell'Autodromo",
    },
    {
      id: 'primo-maggio-roma',
      title: 'Primo Maggio, Roma',
      value: '1000 Pasti + 1,51M Spettatori',
      icon: 'microphone-variant',
      description:
        'Partner backstage del più grande evento gratuito di musica in Europa',
    },
    {
      id: 'emergenza-zimbabwe',
      title: 'Emergenza Zimbabwe',
      value: '€ 420.370 Raccolti',
      icon: 'heart',
      description:
        'Campagna di raccolta fondi per la siccità che ha colpito 2,7 milioni di persone',
    },
  ],
} as const;

// Re-export dati geografici da single source of truth
export { LOCATIONS_DATA as MAP_LOCATIONS } from './locationsData';

// Re-export formatter da shared/utils per compatibilità
export { formatNumber } from '@/shared/utils/numberFormat';
