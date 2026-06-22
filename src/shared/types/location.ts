/**
 * Location — tipo dominio condiviso (SSOT)
 * Una location geografica dove l'organizzazione opera, con coordinate, numeri
 * di impatto e metadati. Usato da InteractiveMap, MapModal e ProjectDetailModal.
 */

/** Continenti dove RAH Italia interviene davvero (navigazione mappa). */
export type Continent = 'Africa' | 'Europa' | 'Asia' | 'America';

/** Cosa arriva alla destinazione lungo la catena di confezionamento. */
export type FlowType = 'meals' | 'kits';

/**
 * Traccia di tracciabilità origine→hub→destinazione (concept "Ibrido").
 * I pasti/kit sono confezionati negli eventi (origini), smistati dall'hub di
 * Bologna e spediti alla destinazione — il sito ufficiale espone il `batch code`
 * reale che lega evento e arrivo. Mostrata nel dettaglio della destinazione.
 */
export interface OriginTrace {
  /** Città-evento di confezionamento (origine del lotto). */
  origins: string[];
  /** Hub di smistamento (Bologna per RAH Italia). */
  hub: string;
  /** Trasporto verso la destinazione. */
  transport: 'sea' | 'truck' | 'local';
}

export interface Location {
  id: string;
  name: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  projects: number;
  beneficiaries: string;
  status: string;
  description: string;
  image: string;
  meals?: number;
  kits?: number;
  volunteers?: number;
  /** Continente della destinazione (navigazione mappa). Assente per le
   *  location non-mappa, es. i progetti in ProjectDetailModal. */
  continent?: Continent;
  /** Anno dell'attività documentata (filtro mappa). */
  year?: number;
}
