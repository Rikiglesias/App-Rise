/**
 * LOCATIONS DATA — Single Source of Truth della mappa "Dove operiamo".
 *
 * Modello reale RAH Italia: Italia/Europa = HUB che CONFEZIONA (eventi di meal/kit
 * packing) e SMISTA da Bologna; i **pasti** partono via container verso l'**Africa**
 * (Zimbabwe, Sudafrica), i **kit** restano in **Italia** e raggiungono l'**Ucraina**.
 * La mappa mostra le DESTINAZIONI per continente; la traccia origine→Bologna→arrivo
 * vive nel dettaglio (concept "Ibrido", binding ~/todos/mappa-redesign.md).
 *
 * Provenienza dati: sito ufficiale italy.riseagainsthunger.org + Annual Report +
 * stampa (raccolti 2026-06-22, vedi ~/todos/mappa-redesign-dati.md). I numeri
 * per-destinazione/anno NON sono pubblicati in serie: dove esiste un dato sourced
 * lo riportiamo con `statsNote`; il resto è qualitativo reale. NESSUN dato inventato.
 */
import type { Continent, FlowType, OriginTrace } from '@/shared/types/location';

export interface LocationData {
  id: string;
  /** Città/area di destinazione. */
  name: string;
  country: string;
  continent: Continent;
  latitude: number;
  longitude: number;
  flag: string;
  /** Cosa arriva qui lungo la catena (pasti o kit). */
  type: FlowType;
  stats: {
    meals?: number;
    kits?: number;
    beneficiaries?: number;
    schools?: number;
  };
  /** Provenienza/affidabilità del dato numerico (mostrata nel dettaglio). */
  statsNote?: string;
  description: string;
  program: string;
  partner?: string;
  /** Traccia di tracciabilità origine→hub→destinazione. */
  trace: OriginTrace;
  /** Fatti reali documentati (mostrati come "Risultati" nel dettaglio). */
  achievements: string[];
  year: number;
  /** Link al tracciamento ufficiale, se disponibile. */
  trackingUrl?: string;
}

/**
 * SINGLE SOURCE OF TRUTH — destinazioni reali documentate.
 * Africa (pasti) + Europa (kit/hub). Asia/America citate in singoli eventi 2026
 * senza dato per-destinazione → escluse finché non confermate (vedi gap nel binding).
 */
export const LOCATIONS_DATA: LocationData[] = [
  {
    id: 'zimbabwe',
    name: 'Harare',
    country: 'Zimbabwe',
    continent: 'Africa',
    latitude: -17.8252,
    longitude: 31.0335,
    flag: '🇿🇼',
    type: 'meals',
    stats: {
      meals: 570000,
      beneficiaries: 2850,
    },
    statsNote:
      'Campagna Rotary EU 2024: 570.000 pasti spediti in Zimbabwe per 2.850 bambini (fonte: sito/stampa). Totale annuo per-destinazione non pubblicato.',
    description:
      'Destinazione principale dei pasti confezionati in Italia. I pasti, esportati via container marittimo, sostengono i programmi di alimentazione scolastica in un Paese colpito da una grave siccità.',
    program: 'Meal Packing → alimentazione scolastica',
    partner: 'The Joseph Foundation',
    trace: {
      origins: ['Milano', 'Bologna', 'Torino', 'Verona'],
      hub: 'Bologna',
      transport: 'sea',
    },
    achievements: [
      'Destinazione #1 dei pasti confezionati in Italia',
      'Programma di alimentazione nelle scuole primarie',
      'Risposta all’emergenza siccità (2,7 milioni di persone colpite)',
      'Scuola primaria di Mapedza, area di Zvishavane',
    ],
    year: 2024,
  },
  {
    id: 'south-africa',
    name: 'Orange Farm',
    country: 'Sudafrica',
    continent: 'Africa',
    latitude: -26.487,
    longitude: 27.873,
    flag: '🇿🇦',
    type: 'meals',
    stats: {},
    statsNote:
      'Numeri per-destinazione non pubblicati dal sito: da confermare con l’organizzazione.',
    description:
      'Nell’insediamento di Orange Farm i pasti sostengono i centri per lo sviluppo della prima infanzia (bambini da 1 a 6 anni), in collaborazione con il programma Morning Star ECD.',
    program: 'Early Childhood Development (Morning Star ECD)',
    partner: 'ECD Connect',
    trace: {
      origins: ['Bologna', 'Milano'],
      hub: 'Bologna',
      transport: 'sea',
    },
    achievements: [
      'Centri per lo sviluppo della prima infanzia (1–6 anni)',
      'Programma Morning Star ECD a Orange Farm',
      'Pasti confezionati in Italia ed esportati via container',
    ],
    year: 2024,
  },
  {
    id: 'italy',
    name: 'Bologna',
    country: 'Italia',
    continent: 'Europa',
    latitude: 44.4949,
    longitude: 11.3426,
    flag: '🇮🇹',
    type: 'kits',
    stats: {
      meals: 3136968,
      kits: 16321,
      beneficiaries: 13323,
    },
    statsNote:
      'Dati nazionali 2024 (Annual Report RAH Italia): pasti confezionati in Italia (poi esportati), kit prodotti e volontari coinvolti. 2025: 2.248.344 pasti, 10.427 kit, 10.414 volontari.',
    description:
      'Sede operativa e magazzino di smistamento per tutta Europa. Qui si confezionano pasti e kit e si distribuiscono kit alimentari alle famiglie in difficoltà attraverso il progetto “Pasto Sospeso” e le associazioni partner.',
    program: 'Kit Packing + Pasto Sospeso',
    partner: 'Caritas Bologna, Nonna Roma, Pane Quotidiano, Sant’Egidio',
    trace: {
      origins: ['Milano', 'Torino', 'Roma', 'Firenze', 'Bologna'],
      hub: 'Bologna',
      transport: 'local',
    },
    achievements: [
      '3.136.968 pasti confezionati nel 2024',
      '16.321 kit alimentari prodotti',
      '13.323 volontari coinvolti',
      'Hub operativo e referente per tutta Europa',
    ],
    year: 2024,
  },
  {
    id: 'ukraine',
    name: 'Kyiv',
    country: 'Ucraina',
    continent: 'Europa',
    latitude: 50.4501,
    longitude: 30.5234,
    flag: '🇺🇦',
    type: 'kits',
    stats: {
      meals: 100000,
    },
    statsNote:
      'Evento Olimpia Milano (dic 2023): 100.000 pasti destinati all’Ucraina (fonte: sito/stampa). Sostegno proseguito negli anni successivi.',
    description:
      'Risposta di emergenza per le zone di guerra: kit alimentari e pasti raggiungono le famiglie sfollate via camion attraverso Moldavia e Slovacchia, in partnership con organizzazioni locali.',
    program: 'Emergenza umanitaria',
    partner: 'Convoy of Hope',
    trace: {
      origins: ['Milano', 'Bologna'],
      hub: 'Bologna',
      transport: 'truck',
    },
    achievements: [
      '100.000 pasti destinati all’Ucraina (evento Olimpia Milano 2023)',
      'Kit alimentari di emergenza alle famiglie sfollate',
      'Trasporto via Moldavia e Slovacchia',
      'Partnership con organizzazioni locali sul territorio',
    ],
    year: 2023,
  },
];
