import { LOCATIONS_DATA, type LocationData } from './locationsData';
import type { FlowType, OriginTrace } from '@/shared/types/location';

// Dati dettagliati per il dettaglio della mappa (destinazione selezionata).
export interface MapModalData {
  id: string;
  title: string;
  subtitle: string;
  flag: string;
  /** Cosa arriva qui (pasti/kit): guida il rendering della traccia. */
  type: FlowType;
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
  /** Provenienza/affidabilità dei numeri (nota sotto le stat). */
  statsNote?: string;
  /** Traccia origine→hub→destinazione, mostrata nel dettaglio. */
  trace: OriginTrace;
  year: number;
  /** URL di tracciamento ufficiale (opzionale): se assente la CTA resta nascosta. */
  trackingUrl?: string;
}

/** Sottotitolo per il dettaglio: ruolo reale della destinazione. */
const subtitleFor = (location: LocationData): string => {
  if (location.id === 'italy') return `${location.country} · Hub Europa`;
  if (location.type === 'meals')
    return `${location.country} · Destinazione pasti`;
  return `${location.country} · Destinazione kit`;
};

/**
 * Converte LocationData nel formato del dettaglio.
 */
const toModalFormat = (location: LocationData): MapModalData => {
  const result: MapModalData = {
    id: location.id,
    title: location.name,
    subtitle: subtitleFor(location),
    flag: location.flag,
    type: location.type,
    description: location.description,
    program: location.program,
    achievements: location.achievements,
    stats: location.stats,
    trace: location.trace,
    year: location.year,
  };

  if (location.partner) result.partner = location.partner;
  if (location.statsNote) result.statsNote = location.statsNote;
  if (location.trackingUrl) result.trackingUrl = location.trackingUrl;

  return result;
};

/**
 * Dati del dettaglio generati dalla single source of truth.
 */
export const MAP_MODAL_DATA: Record<string, MapModalData> = Object.fromEntries(
  LOCATIONS_DATA.map(location => [location.id, toModalFormat(location)])
);

// Funzione per ottenere i dati di un dettaglio specifico
export const getModalData = (locationId: string): MapModalData | null => {
  return MAP_MODAL_DATA[locationId] ?? null;
};

// Re-export formatter da shared/utils per compatibilità
export { formatStat } from '@/shared/utils/numberFormat';
