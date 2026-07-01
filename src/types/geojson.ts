export type Coordinate2D = [number, number];
export type Coordinate3D = [number, number, number];
export type Position = Coordinate2D | Coordinate3D;

export interface GeoJsonFeatureCollection<G, P> {
  type: 'FeatureCollection';
  features: GeoJsonFeature<G, P>[];
}

export interface GeoJsonFeature<G, P> {
  type: 'Feature';
  properties: P;
  geometry: G;
}

export interface PointGeometry {
  type: 'Point';
  coordinates: Position;
}

export interface LineStringGeometry {
  type: 'LineString';
  coordinates: Position[];
}

export interface PolygonGeometry {
  type: 'Polygon';
  coordinates: Position[][];
}

export interface BaseFeatureProperties {
  id: string;
  name: string;
  type: string;
  description: string;
  startTime: string;
  endTime: string;
}

export interface PlaceProperties extends BaseFeatureProperties {
  subject?: string;
  faction?: string;
}

export interface RouteProperties extends BaseFeatureProperties {
  subject?: string;
  faction: string;
}

export interface ZoneProperties extends BaseFeatureProperties {
  subject?: string;
  faction: string;
}

export type PlacesFeatureCollection = GeoJsonFeatureCollection<PointGeometry, PlaceProperties>;
export type RoutesFeatureCollection = GeoJsonFeatureCollection<LineStringGeometry, RouteProperties>;
export type ZonesFeatureCollection = GeoJsonFeatureCollection<PolygonGeometry, ZoneProperties>;
