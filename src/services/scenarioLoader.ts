import { bbox } from '@turf/turf';

import type {
  PlacesFeatureCollection,
  RoutesFeatureCollection,
  ZonesFeatureCollection,
} from '@/types/geojson';
import type { ScenarioEvent } from '@/types/event';
import type {
  ScenarioBundle,
  ScenarioMetadata,
  ScenarioSources,
  ScenarioSummary,
} from '@/types/scenario';

const DATA_BASE_URL = `${import.meta.env.BASE_URL}data`;

async function loadJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`无法加载数据：${url} (${response.status})`);
  }

  return (await response.json()) as T;
}

function scenarioDataUrl(id: string, fileName: string): string {
  return `${DATA_BASE_URL}/scenarios/${encodeURIComponent(id)}/${fileName}`;
}

interface MinimalFeatureCollection {
  type: string;
  features: unknown[];
}

function isFeatureCollection(value: unknown): value is MinimalFeatureCollection {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Record<string, unknown>).type === 'FeatureCollection' &&
    Array.isArray((value as Record<string, unknown>).features)
  );
}

function validateGeoJsonLayer(collection: unknown, label: string): void {
  if (!isFeatureCollection(collection)) {
    throw new Error(`${label} 必须是 GeoJSON FeatureCollection`);
  }

  if (collection.features.length === 0) {
    return;
  }

  const bounds = bbox(collection as Parameters<typeof bbox>[0]);

  if (!bounds.every(Number.isFinite)) {
    throw new Error(`${label} 坐标范围无效`);
  }
}

export function resolvePublicAsset(path: string): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${import.meta.env.BASE_URL}${normalizedPath}`;
}

export async function loadScenarioList(): Promise<ScenarioSummary[]> {
  return loadJson<ScenarioSummary[]>(`${DATA_BASE_URL}/scenarios.json`);
}

export async function loadScenarioBundle(id: string): Promise<ScenarioBundle> {
  const [metadata, events, places, routes, zones, sources] = await Promise.all([
    loadJson<ScenarioMetadata>(scenarioDataUrl(id, 'metadata.json')),
    loadJson<ScenarioEvent[]>(scenarioDataUrl(id, 'events.json')),
    loadJson<PlacesFeatureCollection>(scenarioDataUrl(id, 'places.geojson')),
    loadJson<RoutesFeatureCollection>(scenarioDataUrl(id, 'routes.geojson')),
    loadJson<ZonesFeatureCollection>(scenarioDataUrl(id, 'zones.geojson')),
    loadJson<ScenarioSources>(scenarioDataUrl(id, 'sources.json')),
  ]);

  validateGeoJsonLayer(places, 'places.geojson');
  validateGeoJsonLayer(routes, 'routes.geojson');
  validateGeoJsonLayer(zones, 'zones.geojson');

  return {
    metadata,
    events,
    places,
    routes,
    zones,
    sources,
  };
}
