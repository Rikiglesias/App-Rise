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
import { geoEqualEarth, geoPath, geoContains, geoCentroid } from 'd3-geo';
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

export interface MapGeometry {
  /** Path SVG di tutti i paesi, proiettati per il viewport/focus correnti. */
  shapes: CountryShape[];
  /** Proietta [lng, lat] in pixel del viewport, o null se non proiettabile. */
  project: (
    longitude: number,
    latitude: number
  ) => { x: number; y: number } | null;
}

/**
 * Proiezione equal-area fittata al viewport, eventualmente ristretta ai
 * paesi-focus (continente attivo) con margine del ~12%.
 */
const buildProjection = (
  width: number,
  height: number,
  focusFeatureIds?: readonly string[],
  contextZoom: number = 0.62
) => {
  const focus: FeatureCollection<Geometry, CountryProps> =
    focusFeatureIds && focusFeatureIds.length > 0
      ? {
          type: 'FeatureCollection',
          features: collection.features.filter(
            f => f.id !== undefined && focusFeatureIds.includes(String(f.id))
          ),
        }
      : collection;
  const pad = Math.min(width, height) * 0.12;
  const projection = geoEqualEarth().fitExtent(
    [
      [pad, pad],
      [width - pad, height - pad],
    ],
    focus
  );
  // Con un focus di destinazioni, `fitExtent` zooma finché riempiono il frame:
  // 2 paesi lontani (Zimbabwe↕Sudafrica) lasciano un vuoto sbilanciato. Zoomiamo
  // INDIETRO tenendo il baricentro centrato, così il contesto geografico attorno
  // equilibra la composizione. `contextZoom` scala l'effetto: più basso = più
  // contesto (vista-continente fullscreen 0.62); vicino a 1 = fit stretto sulle
  // destinazioni (preview: Europa+Africa croppate, niente mini-mondo con oceani vuoti).
  if (focusFeatureIds && focusFeatureIds.length > 0 && contextZoom < 1) {
    projection.scale(projection.scale() * contextZoom);
    const projectedCentroid = projection(geoCentroid(focus));
    if (projectedCentroid) {
      const [tx, ty] = projection.translate();
      projection.translate([
        tx + (width / 2 - projectedCentroid[0]),
        ty + (height / 2 - projectedCentroid[1]),
      ]);
    }
  }
  return projection;
};

/**
 * Costruisce i path SVG proiettati per il viewport dato (geoEqualEarth).
 *
 * `focusFeatureIds` (id numerici dei paesi-destinazione del continente attivo):
 * la proiezione viene FITTATA su quel sottoinsieme (navigazione per continente),
 * con un margine del ~12% così i paesi-destinazione non toccano i bordi e i vicini
 * fanno da contesto geografico. Senza focus → fit sull'intera collezione (overview).
 * `geoPath` è costoso: chiamare dentro `useMemo` nel componente, una volta per size.
 */
export const buildCountryShapes = (
  width: number,
  height: number,
  focusFeatureIds?: readonly string[]
): CountryShape[] => buildMapGeometry(width, height, focusFeatureIds).shapes;

/**
 * Geometria completa per il viewport/focus: i path dei paesi E il proiettore di
 * punti (per i pin a livello-città). Un'unica proiezione condivisa tra paesi e
 * pin. `geoPath` è costoso: chiamare dentro `useMemo`, una volta per size+focus.
 */
export const buildMapGeometry = (
  width: number,
  height: number,
  focusFeatureIds?: readonly string[],
  contextZoom: number = 0.62
): MapGeometry => {
  const projection = buildProjection(
    width,
    height,
    focusFeatureIds,
    contextZoom
  );
  const path = geoPath(projection);
  const shapes = collection.features.map(f => ({
    id: f.id !== undefined ? String(f.id) : '',
    name: f.properties?.name ?? '',
    d: path(f) ?? '',
  }));
  const project = (
    longitude: number,
    latitude: number
  ): { x: number; y: number } | null => {
    const point = projection([longitude, latitude]);
    return point ? { x: point[0], y: point[1] } : null;
  };
  return { shapes, project };
};

/**
 * Associa le Location al paese che le contiene (point-in-polygon su coordinate
 * sferiche [lng, lat]). Ritorna `countryNumericId → Location[]`: la LISTA preserva
 * tutti gli eventi dello stesso paese (un paese può ospitare più location), usata
 * per colorare/rendere cliccabili i paesi-evento. Le Location senza paese
 * (coordinate in mare / paese assente in 110m) non finiscono nella mappa e restano
 * accessibili dalla lista chip di fallback in WorldMapSvg.
 */
export const matchLocationsToCountries = (
  locations: readonly Location[]
): Map<string, Location[]> => {
  const matched = new Map<string, Location[]>();
  for (const location of locations) {
    const point: [number, number] = [
      location.coordinates.longitude,
      location.coordinates.latitude,
    ];
    const country = collection.features.find(
      f => f.id !== undefined && geoContains(f, point)
    );
    if (country?.id !== undefined) {
      const key = String(country.id);
      const existing = matched.get(key);
      if (existing) {
        existing.push(location);
      } else {
        matched.set(key, [location]);
      }
    }
  }
  return matched;
};
