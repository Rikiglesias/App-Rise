/**
 * worldMapGeo — geometria + matching della world map SVG.
 *
 * Responsabilità unica: convertire il TopoJSON Natural Earth (world-atlas) in path
 * SVG proiettati (geoEqualEarth, equal-area) e associare le Location-evento al paese
 * che le contiene. Modulo puro e testabile, senza React.
 *
 * Scelte (da ricerca wf_4aaa0c93-592 + verifica fonte):
 * - Dataset importato direttamente da `world-atlas/countries-110m.json` (SSOT: il
 *   pacchetto È l'asset, niente copia duplicata da mantenere). TopoJSON public domain.
 * - Proiezione `geoEqualEarth` + `fitSize` (equal-area, niente distorsione Mercator).
 * - Match Location→paese per COORDINATE (`geoContains`), non per nome: le Location
 *   hanno solo il nome paese in italiano ("Italia"), il TopoJSON in inglese ("Italy").
 *   Il containment geografico è esatto e indipendente da lingua/spelling.
 */
import { geoEqualEarth, geoPath, geoContains } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';
import worldTopo from 'world-atlas/countries-110m.json';

import type { Location } from '@/shared/types/location';

interface CountryProps {
  name: string;
}

// TopoJSON → GeoJSON FeatureCollection, UNA volta a livello modulo (costo ammortizzato).
const topology = worldTopo as unknown as Topology;
const collection = feature(
  topology,
  topology.objects.countries as GeometryCollection
) as FeatureCollection<Geometry, CountryProps>;

/** Feature dei paesi (ISO 3166-1 numeric come `id`, nome inglese in `properties.name`). */
export const COUNTRY_FEATURES: readonly Feature<Geometry, CountryProps>[] =
  collection.features;

export interface CountryShape {
  /** ISO 3166-1 numeric id come stringa (es. "380" = Italy). */
  id: string;
  /** Nome inglese del paese (Natural Earth). */
  name: string;
  /** Attributo `d` del path SVG, già proiettato per le dimensioni richieste. */
  d: string;
}

/**
 * Costruisce i path SVG proiettati per il viewport dato (geoEqualEarth + fitSize).
 * `geoPath` è costoso: chiamare dentro `useMemo` nel componente, una volta per size.
 */
export const buildCountryShapes = (
  width: number,
  height: number
): CountryShape[] => {
  const projection = geoEqualEarth().fitSize([width, height], collection);
  const path = geoPath(projection);
  return collection.features.map(f => ({
    id: f.id !== undefined ? String(f.id) : '',
    name: f.properties?.name ?? '',
    d: path(f) ?? '',
  }));
};

/**
 * Associa ogni Location al paese che la contiene (point-in-polygon su coordinate
 * sferiche [lng, lat]). Ritorna una mappa `countryNumericId → Location` per colorare
 * e rendere cliccabili solo i paesi-evento. Le Location senza paese (coordinate in
 * mare / paese assente in 110m) vengono ignorate dal match e gestite dal fallback UI.
 */
export const matchLocationsToCountries = (
  locations: readonly Location[]
): Map<string, Location> => {
  const matched = new Map<string, Location>();
  for (const location of locations) {
    const point: [number, number] = [
      location.coordinates.longitude,
      location.coordinates.latitude,
    ];
    const country = collection.features.find(
      f => f.id !== undefined && geoContains(f, point)
    );
    if (country?.id !== undefined) {
      matched.set(String(country.id), location);
    }
  }
  return matched;
};
