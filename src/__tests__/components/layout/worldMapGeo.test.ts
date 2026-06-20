import {
  buildCountryShapes,
  matchLocationsToCountries,
  COUNTRY_FEATURES,
} from '@/components/layout/worldMapGeo';
import { LOCATIONS_DATA } from '@/features/impact/data/locationsData';
import type { Location } from '@/shared/types/location';

// LocationData (flat lat/lng) → Location (coordinates nested), come a runtime.
const asLocations = (): Location[] =>
  LOCATIONS_DATA.map(d => ({
    id: d.id,
    name: d.name,
    country: d.country,
    coordinates: { latitude: d.latitude, longitude: d.longitude },
    projects: 0,
    beneficiaries: '',
    status: 'active',
    description: d.description,
    image: d.image ?? '',
  }));

describe('worldMapGeo', () => {
  it('carica i 177 paesi Natural Earth dal TopoJSON', () => {
    expect(COUNTRY_FEATURES.length).toBe(177);
  });

  describe('buildCountryShapes', () => {
    it('proietta ogni paese in un path SVG (id numerico + d non vuoto)', () => {
      const shapes = buildCountryShapes(800, 400);
      expect(shapes).toHaveLength(177);
      const italy = shapes.find(s => s.name === 'Italy');
      expect(italy).toBeDefined();
      expect(italy?.id).toMatch(/^\d+$/);
      expect(italy?.d.length).toBeGreaterThan(0);
    });

    it('riscala i path al viewport richiesto (fitSize)', () => {
      const small = buildCountryShapes(400, 200);
      const big = buildCountryShapes(800, 400);
      expect(small.find(s => s.name === 'Italy')?.d).not.toBe(
        big.find(s => s.name === 'Italy')?.d
      );
    });
  });

  describe('matchLocationsToCountries', () => {
    it('associa tutte le 6 location-evento a un paese (match per coordinate)', () => {
      const matched = matchLocationsToCountries(asLocations());
      expect(matched.size).toBe(LOCATIONS_DATA.length);
    });

    it('mappa ogni location al paese geografico corretto, non per nome italiano', () => {
      const matched = matchLocationsToCountries(asLocations());
      const countryNameFor = (locId: string): string | undefined => {
        for (const [numericId, loc] of matched) {
          if (loc.id === locId) {
            return COUNTRY_FEATURES.find(f => String(f.id) === numericId)
              ?.properties?.name;
          }
        }
        return undefined;
      };
      expect(countryNameFor('italy')).toBe('Italy');
      expect(countryNameFor('usa')).toBe('United States of America');
      expect(countryNameFor('ukraine')).toBe('Ukraine');
      expect(countryNameFor('zimbabwe')).toBe('Zimbabwe');
      expect(countryNameFor('south-africa')).toBe('South Africa');
      expect(countryNameFor('somalia')).toBe('Somalia');
    });
  });
});
