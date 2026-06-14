import { MAP_LOCATIONS } from '../data/impactData';
import type { Location } from '@/shared/types/location';

/**
 * Converte le location dal formato impactData al formato InteractiveMap
 * @param locations Array di location dal format impactData
 * @returns Array di location convertite per InteractiveMap
 */
export const convertToMapLocations = (): Location[] => {
  const locations = MAP_LOCATIONS;

  return locations.map(location => {
    const result: Location = {
      id: location.id,
      name: location.name,
      country: location.country,
      coordinates: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      projects: 1, // Default value
      beneficiaries: `${location.stats.beneficiaries ?? 0}`,
      status: 'active',
      description: location.description,
      image:
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      meals: location.stats.meals ?? 0,
      kits: location.stats.kits ?? 0,
    };

    if (location.stats.beneficiaries) {
      result.volunteers = location.stats.beneficiaries;
    }

    return result;
  });
};
