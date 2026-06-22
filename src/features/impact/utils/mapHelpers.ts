import { MAP_LOCATIONS } from '../data/impactData';
import type { Location } from '@/shared/types/location';

/**
 * Converte le destinazioni reali (LocationData) nel formato Location usato dalla
 * mappa. `continent` e `year` viaggiano con la Location per la navigazione per
 * continente e il filtro anno; `image` resta vuoto (la mappa non mostra foto, i
 * dati ricchi vivono nel dettaglio via mapModalData).
 */
export const convertToMapLocations = (): Location[] => {
  return MAP_LOCATIONS.map(location => {
    const result: Location = {
      id: location.id,
      name: location.name,
      country: location.country,
      coordinates: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      projects: 1,
      beneficiaries: `${location.stats.beneficiaries ?? 0}`,
      status: 'active',
      description: location.description,
      image: '',
      meals: location.stats.meals ?? 0,
      kits: location.stats.kits ?? 0,
      continent: location.continent,
      year: location.year,
    };

    if (location.stats.beneficiaries) {
      result.volunteers = location.stats.beneficiaries;
    }

    return result;
  });
};
