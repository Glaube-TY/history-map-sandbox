import * as Cesium from 'cesium';

import type { ScenarioFocus } from '@/types/event';
import type {
  LineStringGeometry,
  PlacesFeatureCollection,
  PointGeometry,
  PolygonGeometry,
  Position,
  RoutesFeatureCollection,
  ZonesFeatureCollection,
} from '@/types/geojson';
import type { LayerVisibility } from '@/types/layer';

export interface ScenarioDataSources {
  places: Cesium.CustomDataSource;
  routes: Cesium.CustomDataSource;
  zones: Cesium.CustomDataSource;
}

export interface SandboxViewerResult {
  viewer: Cesium.Viewer;
  imageryLayer: Cesium.ImageryLayer | null;
}

export interface ScenarioLayerPayload {
  places?: PlacesFeatureCollection | null;
  routes?: RoutesFeatureCollection | null;
  zones?: ZonesFeatureCollection | null;
  currentEventTime?: string | null;
}

const PLACE_COLOR = Cesium.Color.fromCssColorString('#19d3a2');
const ROUTE_COLOR = Cesium.Color.fromCssColorString('#ffd166');
const ZONE_COLOR = Cesium.Color.fromCssColorString('#ff6b4a');
const HIGHLIGHT_COLOR = Cesium.Color.fromCssColorString('#ffffff');
const TEXT_COLOR = Cesium.Color.fromCssColorString('#eef5f1');
const OUTLINE_COLOR = Cesium.Color.fromCssColorString('#07100f');
const OSM_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

function positionToDegrees(position: Position): [number, number] {
  return [position[0], position[1]];
}

function flattenDegrees(positions: Position[]): number[] {
  return positions.flatMap((position) => {
    const [longitude, latitude] = positionToDegrees(position);
    return [longitude, latitude];
  });
}

function colorForFaction(faction?: string): Cesium.Color {
  if (faction === 'japanese-army') {
    return ZONE_COLOR;
  }

  if (faction === 'eighth-route-army') {
    return PLACE_COLOR;
  }

  return ROUTE_COLOR;
}

function eventTouchesFeature(
  featureTime: { startTime: string; endTime: string },
  eventTime?: string | null,
): boolean {
  if (!eventTime) {
    return false;
  }

  return featureTime.startTime <= eventTime && eventTime <= featureTime.endTime;
}

function describeFeature(title: string, description: string, type: string): string {
  return `
    <section style="font-family: sans-serif; line-height: 1.6;">
      <strong>${title}</strong>
      <p>${description}</p>
      <small>类型：${type}</small>
    </section>
  `;
}

function createFallbackGridProvider(): Cesium.GridImageryProvider {
  return new Cesium.GridImageryProvider({
    cells: 8,
    color: Cesium.Color.fromCssColorString('#5f7d74').withAlpha(0.7),
    glowColor: Cesium.Color.fromCssColorString('#56c2a3').withAlpha(0.18),
    backgroundColor: Cesium.Color.fromCssColorString('#172120').withAlpha(0.95),
    tileWidth: 256,
    tileHeight: 256,
  });
}

export function createSandboxViewer(container: HTMLElement, ionToken?: string): SandboxViewerResult {
  if (ionToken) {
    Cesium.Ion.defaultAccessToken = ionToken;
  }

  const viewer = new Cesium.Viewer(container, {
    animation: false,
    baseLayer: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: true,
    navigationHelpButton: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
  });

  viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#1b2425');
  viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#0d1114');
  if (viewer.scene.skyAtmosphere) {
    viewer.scene.skyAtmosphere.show = false;
  }

  viewer.imageryLayers.addImageryProvider(createFallbackGridProvider());

  const osmProvider = new Cesium.OpenStreetMapImageryProvider({
    url: 'https://tile.openstreetmap.org/',
    credit: OSM_ATTRIBUTION,
    minimumLevel: 0,
    maximumLevel: 18,
  });
  const imageryLayer = viewer.imageryLayers.addImageryProvider(osmProvider);
  viewer.scene.requestRender();

  return {
    viewer,
    imageryLayer,
  };
}

export function createScenarioSources(viewer: Cesium.Viewer): ScenarioDataSources {
  const sources: ScenarioDataSources = {
    places: new Cesium.CustomDataSource('places'),
    routes: new Cesium.CustomDataSource('routes'),
    zones: new Cesium.CustomDataSource('zones'),
  };

  Object.values(sources).forEach((source) => {
    void viewer.dataSources.add(source);
  });

  return sources;
}

function renderPlaces(
  source: Cesium.CustomDataSource,
  collection?: PlacesFeatureCollection | null,
  eventTime?: string | null,
): void {
  source.entities.removeAll();

  collection?.features.forEach((feature) => {
    const geometry: PointGeometry = feature.geometry;
    const [longitude, latitude] = positionToDegrees(geometry.coordinates);
    const highlighted = eventTouchesFeature(feature.properties, eventTime);

    source.entities.add({
      id: feature.properties.id,
      name: feature.properties.name,
      description: describeFeature(
        feature.properties.name,
        feature.properties.description,
        feature.properties.type,
      ),
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
      point: {
        pixelSize: highlighted ? 20 : 16,
        color: highlighted ? HIGHLIGHT_COLOR : PLACE_COLOR,
        outlineColor: OUTLINE_COLOR,
        outlineWidth: highlighted ? 4 : 3,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: feature.properties.name,
        font: highlighted ? '700 16px sans-serif' : '700 14px sans-serif',
        fillColor: TEXT_COLOR,
        outlineColor: OUTLINE_COLOR,
        outlineWidth: 4,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, highlighted ? -34 : -30),
        showBackground: true,
        backgroundColor: OUTLINE_COLOR.withAlpha(0.76),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
  });
}

function renderRoutes(
  source: Cesium.CustomDataSource,
  collection?: RoutesFeatureCollection | null,
  eventTime?: string | null,
): void {
  source.entities.removeAll();

  collection?.features.forEach((feature) => {
    const geometry: LineStringGeometry = feature.geometry;
    const color = colorForFaction(feature.properties.faction);
    const highlighted = eventTouchesFeature(feature.properties, eventTime);

    source.entities.add({
      id: feature.properties.id,
      name: feature.properties.name,
      description: describeFeature(
        feature.properties.name,
        feature.properties.description,
        feature.properties.type,
      ),
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(flattenDegrees(geometry.coordinates)),
        width: highlighted ? 9 : 6,
        material: highlighted
          ? new Cesium.PolylineGlowMaterialProperty({
              color: color.withAlpha(0.96),
              glowPower: 0.18,
            })
          : color.withAlpha(0.92),
        clampToGround: true,
        zIndex: highlighted ? 20 : 10,
      },
    });
  });
}

function renderZones(
  source: Cesium.CustomDataSource,
  collection?: ZonesFeatureCollection | null,
  eventTime?: string | null,
): void {
  source.entities.removeAll();

  collection?.features.forEach((feature) => {
    const geometry: PolygonGeometry = feature.geometry;
    const outerRing = geometry.coordinates[0] ?? [];
    const color = colorForFaction(feature.properties.faction);
    const highlighted = eventTouchesFeature(feature.properties, eventTime);
    const degrees = flattenDegrees(outerRing);

    source.entities.add({
      id: feature.properties.id,
      name: feature.properties.name,
      description: describeFeature(
        feature.properties.name,
        feature.properties.description,
        feature.properties.type,
      ),
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(
          Cesium.Cartesian3.fromDegreesArray(degrees),
        ),
        material: color.withAlpha(highlighted ? 0.38 : 0.26),
        height: 0,
        outline: false,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });

    source.entities.add({
      id: `${feature.properties.id}-boundary`,
      name: `${feature.properties.name}边界`,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(degrees),
        width: highlighted ? 5 : 3,
        material: color.withAlpha(highlighted ? 1 : 0.86),
        clampToGround: true,
        zIndex: highlighted ? 18 : 9,
      },
    });
  });
}

export function renderScenarioLayers(
  sources: ScenarioDataSources,
  payload: ScenarioLayerPayload,
): void {
  renderPlaces(sources.places, payload.places, payload.currentEventTime);
  renderRoutes(sources.routes, payload.routes, payload.currentEventTime);
  renderZones(sources.zones, payload.zones, payload.currentEventTime);
}

export function applyLayerVisibility(
  sources: ScenarioDataSources,
  visibility: LayerVisibility,
): void {
  sources.places.show = visibility.places;
  sources.routes.show = visibility.routes;
  sources.zones.show = visibility.zones;
}

export function zoomToScenarioData(viewer: Cesium.Viewer, sources: ScenarioDataSources): void {
  const entities = [
    ...sources.places.entities.values,
    ...sources.routes.entities.values,
    ...sources.zones.entities.values,
  ];

  if (entities.length === 0) {
    return;
  }

  const collection = new Cesium.EntityCollection();
  entities.forEach((entity) => collection.add(entity));

  void viewer
    .zoomTo(collection, new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-52), 0))
    .then(() => {
      if (!viewer.isDestroyed()) {
        viewer.camera.moveBackward(1800);
        viewer.scene.requestRender();
      }
    });
}

function expandBounds(bounds: [number, number, number, number]): [number, number, number, number] {
  const [west, south, east, north] = bounds;
  const width = Math.max(east - west, 0.02);
  const height = Math.max(north - south, 0.02);
  const padding = Math.max(width, height) * 0.18;

  return [west - padding, south - padding, east + padding, north + padding];
}

function includePosition(
  bounds: [number, number, number, number],
  position: Position,
): [number, number, number, number] {
  const [longitude, latitude] = positionToDegrees(position);
  return [
    Math.min(bounds[0], longitude),
    Math.min(bounds[1], latitude),
    Math.max(bounds[2], longitude),
    Math.max(bounds[3], latitude),
  ];
}

function collectScenarioBounds(payload: ScenarioLayerPayload): [number, number, number, number] | null {
  let bounds: [number, number, number, number] = [
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ];

  payload.places?.features.forEach((feature) => {
    bounds = includePosition(bounds, feature.geometry.coordinates);
  });
  payload.routes?.features.forEach((feature) => {
    feature.geometry.coordinates.forEach((position) => {
      bounds = includePosition(bounds, position);
    });
  });
  payload.zones?.features.forEach((feature) => {
    feature.geometry.coordinates.forEach((ring) => {
      ring.forEach((position) => {
        bounds = includePosition(bounds, position);
      });
    });
  });

  return bounds.every(Number.isFinite) ? expandBounds(bounds) : null;
}

export function flyToScenarioDataBounds(
  viewer: Cesium.Viewer,
  payload: ScenarioLayerPayload,
  duration = 0.9,
): void {
  const bounds = collectScenarioBounds(payload);

  if (!bounds) {
    return;
  }

  const [west, south, east, north] = bounds;
  viewer.camera.flyTo({
    destination: Cesium.Rectangle.fromDegrees(west, south, east, north),
    duration,
  });
}

export function flyToScenarioFocus(
  viewer: Cesium.Viewer,
  focus: ScenarioFocus,
  duration = 0.85,
): void {
  const [longitude, latitude] = focus.center;

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, focus.height),
    orientation: {
      heading: Cesium.Math.toRadians(focus.heading ?? 0),
      pitch: Cesium.Math.toRadians(focus.pitch ?? -58),
      roll: Cesium.Math.toRadians(focus.roll ?? 0),
    },
    duration,
  });
}
