import type { ScenarioEvent } from './event';
import type {
  PlacesFeatureCollection,
  RoutesFeatureCollection,
  ZonesFeatureCollection,
} from './geojson';

export interface ScenarioSummary {
  id: string;
  title: string;
  category: string;
  period: string;
  location: string;
  summary: string;
  cover: string;
}

export interface ScenarioFaction {
  id: string;
  name: string;
  color: string;
}

export interface ScenarioMetadata {
  id: string;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  center: [number, number];
  defaultCameraHeight: number;
  summary: string;
  tags: string[];
  factions: ScenarioFaction[];
}

export interface ScenarioSources {
  notice: string;
  historicalSources: string[];
  mapSources: string[];
  coordinateReview: string;
  licenseNote: string;
}

export interface ScenarioBundle {
  metadata: ScenarioMetadata;
  events: ScenarioEvent[];
  places: PlacesFeatureCollection;
  routes: RoutesFeatureCollection;
  zones: ZonesFeatureCollection;
  sources: ScenarioSources;
}
