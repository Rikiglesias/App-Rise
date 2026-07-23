import { LOCATIONS_DATA, type LocationData } from './locationsData';

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
  /** URL di tracciamento pasti/evento (opzionale). Non ancora popolato dai dati
   *  reali (follow-up): finché assente la CTA "saperne di più" resta nascosta.
   *  VINCOLO: il dominio DEVE stare nell'allowlist di useLinkHandler (https),
   *  altrimenti il link apre in dev ma è BLOCCATO in produzione. */
  trackingUrl?: string;
}

/**
 * Converte LocationData in formato MapModalData
 */
const toModalFormat = (location: LocationData): MapModalData => {
  const result: MapModalData = {
    id: location.id,
    title: location.name,
    subtitle:
      location.id === 'italy'
        ? `${location.country} - Sede Europea`
        : location.id === 'usa'
          ? `${location.country} - Sede Globale`
          : location.id === 'ukraine'
            ? `${location.country} - Emergenza Umanitaria`
            : location.country,
    flag: location.flag,
    description: location.description,
    program: location.program,
    achievements: location.achievements,
    stats: location.stats,
    year: location.year,
  };

  if (location.partner) result.partner = location.partner;
  if (location.image) result.image = location.image;

  return result;
};

/**
 * Dati modals generati da single source of truth
 */
export const MAP_MODAL_DATA: Record<string, MapModalData> = Object.fromEntries(
  LOCATIONS_DATA.map(location => [location.id, toModalFormat(location)])
);

// Funzione per ottenere i dati di un modal specifico
export const getModalData = (locationId: string): MapModalData | null => {
  return MAP_MODAL_DATA[locationId] ?? null;
};

// Re-export formatter da shared/utils per compatibilità
export { formatStat } from '@/shared/utils/numberFormat';
