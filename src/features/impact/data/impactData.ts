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
      title: { it: 'La storia di Vitale', en: "Vitale's Story" },
      location: { it: 'Zimbabwe - Simcheerba', en: 'Zimbabwe - Simcheerba' },
      text: {
        it: 'Vitale Zhou, 12 anni, studente di seconda media a Simcheerba. Viene da una famiglia di sette persone. Frequenta la scuola solo 3 giorni su 5, scegliendo di andare nei giorni in cui viene servito un pasto.\n\nGli altri due giorni aiuta il paese a costruire mattoni per mantenere la famiglia. Preferisce andare a scuola quando viene servito del cibo, perché ciò gli assicura almeno due pasti al giorno.',
        en: 'Vitale Zhou is 12 years old and in his second year of middle school in Simcheerba. He comes from a family of seven. He attends school only 3 days out of 5, choosing the days when a meal is served.\n\nOn the other two days, he helps the village make bricks to support his family. He prefers to go to school when food is served because this guarantees him at least two meals a day.',
      },
      image:
        'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      category: 'meals',
      year: 2024,
    },
    {
      id: 'maria-ukraine',
      title: { it: 'La speranza di Maria', en: "Maria's Hope" },
      location: {
        it: 'Ucraina - Regione di Kharkiv',
        en: 'Ukraine - Kharkiv Region',
      },
      text: {
        it: 'Maria, 75 anni, ha perso tutto a causa della guerra. "A marzo è saltata la corrente e io avevo con me i miei nipotini. Abbiamo trascorso un mese in cantina."\n\n"Ho 75 anni e ora non ho nulla", dice con le lacrime agli occhi. Ma grazie agli aiuti ricevuti, come i nostri kit alimentari, ha trovato la speranza. "Vi ringrazio per quello che fate per aiutarci."',
        en: 'Maria, 75, lost everything because of the war. "In March the power went out, and I had my young grandchildren with me. We spent a month in the cellar."\n\n"I am 75 years old, and now I have nothing," she says with tears in her eyes. But thanks to the aid she received, including our food kits, she has found hope. "Thank you for what you do to help us."',
      },
      image:
        'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      category: 'kits',
      year: 2024,
    },
    {
      id: 'emporio-sole',
      title: { it: 'Emporio Solidale Il Sole', en: 'Emporio Solidale Il Sole' },
      location: {
        it: 'Casalecchio di Reno, Bologna',
        en: 'Casalecchio di Reno, Bologna',
      },
      text: {
        it: "L'Emporio Solidale Il Sole funziona come un supermercato, ma qui i prodotti non si pagano con denaro e i commessi sono volontari.\n\nNel giugno 2024, Rise Against Hunger Italia ha donato 500 kit alimentari all'Emporio, contribuendo non solo al soddisfacimento dei bisogni primari ma anche favorendo percorsi verso l'autonomia.",
        en: 'Emporio Solidale Il Sole works like a supermarket, but products are not paid for with money and the staff are volunteers.\n\nIn June 2024, Rise Against Hunger Italia donated 500 food kits to the Emporio, helping to meet basic needs while also supporting pathways towards independence.',
      },
      image:
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      category: 'kits',
      year: 2024,
    },
    {
      id: 'campi-arte',
      title: {
        it: "Cooperativa Campi d'Arte",
        en: "Cooperativa Campi d'Arte",
      },
      location: { it: 'Bologna', en: 'Bologna' },
      text: {
        it: "Gli utenti della Cooperativa Sociale Campi d'Arte svolgono attività di kit packing nel magazzino di Rise Against Hunger Italia in un'ottica di esperienza lavorativa.\n\n\"Essere parte attiva in un progetto di solidarietà permette loro di sentirsi valorizzati e riconosciuti\", racconta l'educatrice Eleonora.",
        en: 'The people supported by Cooperativa Sociale Campi d\'Arte pack kits at the Rise Against Hunger Italia warehouse as a work experience activity.\n\n"Taking an active role in a solidarity project allows them to feel valued and recognised," says Eleonora, their educator.',
      },
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
      title: { it: 'PalaDozza, Bologna', en: 'PalaDozza, Bologna' },
      value: { it: '+50.000 Pasti', en: '50,000+ Meals' },
      icon: 'stadium-variant',
      description: {
        it: '16 marzo 2024 - Grande festa solidale con volontari da tutta Italia',
        en: 'March 16, 2024 - A major solidarity event with volunteers from across Italy',
      },
    },
    {
      id: 'gp-monza',
      title: { it: 'GP di Monza', en: 'Monza Grand Prix' },
      value: { it: '+60.000 Pasti', en: '60,000+ Meals' },
      icon: 'flag-checkered',
      description: {
        it: "1° settembre 2024 - Pit stop solidale alla Fan Zone dell'Autodromo",
        en: "September 1, 2024 - A solidarity pit stop at the circuit's Fan Zone",
      },
    },
    {
      id: 'primo-maggio-roma',
      title: { it: 'Primo Maggio, Roma', en: 'May Day, Rome' },
      value: {
        it: '1000 Pasti + 1,51M Spettatori',
        en: '1,000 Meals + 1.51M Viewers',
      },
      icon: 'microphone-variant',
      description: {
        it: 'Partner backstage del più grande evento gratuito di musica in Europa',
        en: "Backstage partner of Europe's largest free music event",
      },
    },
    {
      id: 'emergenza-zimbabwe',
      title: { it: 'Emergenza Zimbabwe', en: 'Zimbabwe Emergency' },
      value: { it: '€ 420.370 Raccolti', en: '€420,370 Raised' },
      icon: 'heart',
      description: {
        it: 'Campagna di raccolta fondi per la siccità che ha colpito 2,7 milioni di persone',
        en: 'Fundraising campaign for the drought that affected 2.7 million people',
      },
    },
  ],
} as const;

// Re-export dati geografici da single source of truth
export { LOCATIONS_DATA as MAP_LOCATIONS } from './locationsData';

// Re-export formatter da shared/utils per compatibilità
export { formatNumber } from '@/shared/utils/numberFormat';
