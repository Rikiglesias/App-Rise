import type { Location } from '../../../components/layout/InteractiveMap';
import { MAP_LOCATIONS } from '../../../data/impactData';

/**
 * Converte le location dal formato impactData al formato InteractiveMap
 * @param locations Array di location dal format impactData
 * @returns Array di location convertite per InteractiveMap
 */
export const convertToMapLocations = (
  locations: typeof MAP_LOCATIONS
): Location[] => {
  return locations.map(location => ({
    id: location.id,
    name: location.name,
    country: location.country,
    coordinates: {
      latitude: location.latitude,
      longitude: location.longitude,
    },
    projects: 1, // Default value
    beneficiaries: location.stats.beneficiaries?.toString() || '0',
    status: 'active',
    description: location.description,
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400', // Default image
    meals: location.stats.meals,
    kits: location.stats.kits ?? 0,
    volunteers: location.stats.beneficiaries, // Use beneficiaries as volunteers count
  }));
};
