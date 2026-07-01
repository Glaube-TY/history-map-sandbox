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

export interface ScenarioLayerPayload {
  places?: PlacesFeatureCollection | null;
  routes?: RoutesFeatureCollection | null;
  zones?: ZonesFeatureCollection | null;
}

const PLACE_COLOR = Cesium.Color.fromCssColorString('#56c2a3');
const ROUTE_COLOR = Cesium.Color.fromCssColorString('#f0b75e');
const ZONE_COLOR = Cesium.Color.fromCssColorString('#d96c59');
const TEXT_COLOR = Cesium.Color.fromCssColorString('#eef5f1');
const OUTLINE_COLOR = Cesium.Color.fromCssColorString('#101418');

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

function describeFeature(title: string, description: string, type: string): string {
  return `
    <section style="font-family: sans-serif; line-height: 1.6;">
      <strong>${title}</strong>
      <p>${description}</p>
      <small>类型：${type}</small>
    </section>
  `;
}

export function createSandboxViewer(container: HTMLElement, ionToken?: string): Cesium.Viewer {
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

  viewer.imageryLayers.addImageryProvider(
    new Cesium.GridImageryProvider({
      cells: 8,
      color: Cesium.Color.fromCssColorString('#47665f').withAlpha(0.55),
      glowColor: Cesium.Color.fromCssColorString('#56c2a3').withAlpha(0.12),
      backgroundColor: Cesium.Color.fromCssColorString('#172120').withAlpha(0.92),
      tileWidth: 256,
      tileHeight: 256,
    }),
  );
  viewer.scene.requestRender();

  return viewer;
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

function renderPlaces(source: Cesium.CustomDataSource, collection?: PlacesFeatureCollection | null): void {
  source.entities.removeAll();

  collection?.features.forEach((feature) => {
    const geometry: PointGeometry = feature.geometry;
    const [longitude, latitude] = positionToDegrees(geometry.coordinates);

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
        pixelSize: 12,
        color: PLACE_COLOR,
        outlineColor: OUTLINE_COLOR,
        outlineWidth: 2,
      },
      label: {
        text: feature.properties.name,
        font: '13px sans-serif',
        fillColor: TEXT_COLOR,
        outlineColor: OUTLINE_COLOR,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -24),
        showBackground: true,
        backgroundColor: OUTLINE_COLOR.withAlpha(0.68),
      },
    });
  });
}

function renderRoutes(source: Cesium.CustomDataSource, collection?: RoutesFeatureCollection | null): void {
  source.entities.removeAll();

  collection?.features.forEach((feature) => {
    const geometry: LineStringGeometry = feature.geometry;
    const color = colorForFaction(feature.properties.faction);

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
        width: 4,
        material: color.withAlpha(0.85),
        clampToGround: false,
      },
    });
  });
}

function renderZones(source: Cesium.CustomDataSource, collection?: ZonesFeatureCollection | null): void {
  source.entities.removeAll();

  collection?.features.forEach((feature) => {
    const geometry: PolygonGeometry = feature.geometry;
    const outerRing = geometry.coordinates[0] ?? [];
    const color = colorForFaction(feature.properties.faction);

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
          Cesium.Cartesian3.fromDegreesArray(flattenDegrees(outerRing)),
        ),
        material: color.withAlpha(0.28),
        outline: true,
        outlineColor: color.withAlpha(0.9),
      },
    });
  });
}

export function renderScenarioLayers(
  sources: ScenarioDataSources,
  payload: ScenarioLayerPayload,
): void {
  renderPlaces(sources.places, payload.places);
  renderRoutes(sources.routes, payload.routes);
  renderZones(sources.zones, payload.zones);
}

export function applyLayerVisibility(
  sources: ScenarioDataSources,
  visibility: LayerVisibility,
): void {
  sources.places.show = visibility.places;
  sources.routes.show = visibility.routes;
  sources.zones.show = visibility.zones;
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
