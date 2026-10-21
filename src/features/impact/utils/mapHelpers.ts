import { MAP_LOCATIONS } from '../data/impactData';
import { resolveLocalizedText } from './localizedText';
import type { SupportedLocale } from '@/locales';
import type { Location } from '@/shared/types/location';

/**
 * Converte le location dal formato impactData al formato InteractiveMap
 * @param locale Lingua dei nomi (di norma quella corrente)
 * @returns Array di location convertite per InteractiveMap
 */
export const convertToMapLocations = (locale?: SupportedLocale): Location[] => {
  const locations = MAP_LOCATIONS;

  return locations.map(location => {
    const result: Location = {
      id: location.id,
      name: resolveLocalizedText(location.name, locale),
      country: resolveLocalizedText(location.country, locale),
      coordinates: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      projects: 1, // Default value
      beneficiaries: `${location.stats.beneficiaries ?? 0}`,
      status: 'active',
      description: resolveLocalizedText(location.description, locale),
      meals: location.stats.meals ?? 0,
      kits: location.stats.kits ?? 0,
    };

    if (location.stats.beneficiaries) {
      result.volunteers = location.stats.beneficiaries;
    }

    return result;
  });
};
