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
    it('associa tutte le 6 location-evento (6 paesi distinti)', () => {
      const matched = matchLocationsToCountries(asLocations());
      expect(matched.size).toBe(6);
      const total = Array.from(matched.values()).reduce(
        (n, arr) => n + arr.length,
        0
      );
      expect(total).toBe(LOCATIONS_DATA.length);
    });

    it('mappa ogni location al paese geografico corretto, non per nome italiano', () => {
      const matched = matchLocationsToCountries(asLocations());
      const countryNameFor = (locId: string): string | undefined => {
        for (const [numericId, locs] of matched) {
          if (locs.some(l => l.id === locId)) {
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

    it('preserva più location nello stesso paese senza sovrascrivere', () => {
      const mk = (
        id: string,
        latitude: number,
        longitude: number
      ): Location => ({
        id,
        name: id,
        country: 'Italia',
        coordinates: { latitude, longitude },
        projects: 0,
        beneficiaries: '',
        status: 'active',
        description: '',
        image: '',
      });
      const matched = matchLocationsToCountries([
        mk('italy-bologna', 44.4949, 11.3426),
        mk('italy-milano', 45.4642, 9.19),
      ]);
      expect(matched.size).toBe(1);
      const italyLocs = Array.from(matched.values())[0] ?? [];
      expect(italyLocs).toHaveLength(2);
      expect(italyLocs.map(l => l.id).sort()).toEqual([
        'italy-bologna',
        'italy-milano',
      ]);
    });
  });
});
