import { resolveLocalizedText } from '../utils/localizedText';
import type { LocalizedText } from '../utils/localizedText';
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
  /** URL di tracciamento pasti/evento (opzionale). Non ancora popolato dai dati
   *  reali (follow-up): finché assente la CTA "saperne di più" resta nascosta.
   *  VINCOLO: il dominio DEVE stare nell'allowlist di useLinkHandler (https),
   *  altrimenti il link apre in dev ma è BLOCCATO in produzione. */
  trackingUrl?: string;
}

type LocalizedMapModalData = Omit<
  MapModalData,
  'title' | 'subtitle' | 'description' | 'program' | 'achievements'
> &
  Pick<LocationData, 'description' | 'program' | 'achievements'> & {
    title: LocalizedText;
    subtitle: LocalizedText;
  };

const SUBTITLE_SUFFIXES: Record<string, LocalizedText> = {
  italy: { it: 'Sede Europea', en: 'European Office' },
  usa: { it: 'Sede Globale', en: 'Global Headquarters' },
  ukraine: { it: 'Emergenza Umanitaria', en: 'Humanitarian Emergency' },
};

/**
 * Mantiene entrambe le lingue fino all'apertura della scheda.
 */
const toModalFormat = (location: LocationData): LocalizedMapModalData => {
  const suffix = SUBTITLE_SUFFIXES[location.id];
  const result: LocalizedMapModalData = {
    id: location.id,
    title: location.name,
    subtitle: suffix
      ? {
          it: `${location.country.it} - ${suffix.it}`,
          en: `${location.country.en} - ${suffix.en}`,
        }
      : location.country,
    flag: location.flag,
    description: location.description,
    program: location.program,
    achievements: location.achievements,
    stats: location.stats,
    year: location.anno,
  };

  if (location.partner) result.partner = location.partner;

  return result;
};

/**
 * Dati modals generati da single source of truth
 */
export const MAP_MODAL_DATA: Record<string, LocalizedMapModalData> =
  Object.fromEntries(
    LOCATIONS_DATA.map(location => [location.id, toModalFormat(location)])
  );

// Funzione per ottenere i dati di un modal specifico
export const getModalData = (locationId: string): MapModalData | null => {
  if (!Object.prototype.hasOwnProperty.call(MAP_MODAL_DATA, locationId)) {
    return null;
  }
  const data = MAP_MODAL_DATA[locationId];
  if (!data) return null;

  return {
    ...data,
    title: resolveLocalizedText(data.title),
    subtitle: resolveLocalizedText(data.subtitle),
    description: resolveLocalizedText(data.description),
    program: resolveLocalizedText(data.program),
    achievements: data.achievements.map(resolveLocalizedText),
  };
};

// Re-export formatter da shared/utils per compatibilità
export { formatStat } from '@/shared/utils/numberFormat';
