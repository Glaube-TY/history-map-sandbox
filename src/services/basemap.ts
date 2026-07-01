import * as Cesium from 'cesium';

import type { BasemapMode, BasemapStatus } from '@/types/basemap';

const VALID_BASEMAP_MODES: BasemapMode[] = ['demo', 'tdt', 'grid'];

const OSM_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

const TDT_ATTRIBUTION =
  '© <a href="https://www.tianditu.gov.cn/" target="_blank" rel="noopener noreferrer">天地图</a>';

export interface CreateBasemapOptions {
  tdtToken?: string;
}

export interface BasemapResult {
  primaryLayers: Cesium.ImageryLayer[];
  fallbackLayer: Cesium.ImageryLayer | null;
  status: BasemapStatus;
}

export function normalizeBasemapMode(value?: string): BasemapMode {
  if (value && (VALID_BASEMAP_MODES as string[]).includes(value)) {
    return value as BasemapMode;
  }

  return 'demo';
}

export function createFallbackGridProvider(): Cesium.GridImageryProvider {
  return new Cesium.GridImageryProvider({
    cells: 8,
    color: Cesium.Color.fromCssColorString('#5f7d74').withAlpha(0.7),
    glowColor: Cesium.Color.fromCssColorString('#56c2a3').withAlpha(0.18),
    backgroundColor: Cesium.Color.fromCssColorString('#172120').withAlpha(0.95),
    tileWidth: 256,
    tileHeight: 256,
  });
}

function addGridLayer(viewer: Cesium.Viewer): Cesium.ImageryLayer {
  const provider = createFallbackGridProvider();
  return viewer.imageryLayers.addImageryProvider(provider);
}

function addDemoLayer(viewer: Cesium.Viewer): Cesium.ImageryLayer {
  const provider = new Cesium.OpenStreetMapImageryProvider({
    url: 'https://tile.openstreetmap.org/',
    credit: OSM_ATTRIBUTION,
    minimumLevel: 0,
    maximumLevel: 18,
  });

  return viewer.imageryLayers.addImageryProvider(provider);
}

function buildTdtUrl(layer: string, token: string): string {
  return `https://t0.tianditu.gov.cn/${layer}_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${token}`;
}

function addTdtImageryLayer(
  viewer: Cesium.Viewer,
  layer: string,
  token: string,
): Cesium.ImageryLayer | null {
  try {
    const provider = new Cesium.UrlTemplateImageryProvider({
      url: buildTdtUrl(layer, token),
      credit: TDT_ATTRIBUTION,
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
      minimumLevel: 0,
      maximumLevel: 18,
      tileWidth: 256,
      tileHeight: 256,
    });

    return viewer.imageryLayers.addImageryProvider(provider);
  } catch {
    return null;
  }
}

function addTdtLayers(viewer: Cesium.Viewer, token: string): Cesium.ImageryLayer[] {
  const vectorLayer = addTdtImageryLayer(viewer, 'vec', token);
  const annotationLayer = addTdtImageryLayer(viewer, 'cva', token);

  return [vectorLayer, annotationLayer].filter(Boolean) as Cesium.ImageryLayer[];
}

function createTdtMode(viewer: Cesium.Viewer, token?: string): BasemapResult {
  const fallbackLayer = addGridLayer(viewer);

  if (!token) {
    const demoLayer = addDemoLayer(viewer);

    return {
      primaryLayers: [demoLayer],
      fallbackLayer,
      status: {
        mode: 'tdt',
        label: '天地图 token 缺失，已回退公开演示底图',
        usingFallback: true,
        message: '未配置 VITE_TDT_TOKEN，已回退到公开演示底图',
      },
    };
  }

  const tdtLayers = addTdtLayers(viewer, token);

  if (tdtLayers.length === 0) {
    const demoLayer = addDemoLayer(viewer);

    return {
      primaryLayers: [demoLayer],
      fallbackLayer,
      status: {
        mode: 'tdt',
        label: '天地图初始化失败，已回退公开演示底图',
        usingFallback: true,
        message: '天地图底图初始化失败，已回退到公开演示底图',
      },
    };
  }

  return {
    primaryLayers: tdtLayers,
    fallbackLayer,
    status: {
      mode: 'tdt',
      label: '天地图矢量底图模式',
      usingFallback: false,
    },
  };
}

export function createBasemapLayers(
  viewer: Cesium.Viewer,
  mode: BasemapMode,
  options: CreateBasemapOptions = {},
): BasemapResult {
  if (mode === 'grid') {
    const gridLayer = addGridLayer(viewer);

    return {
      primaryLayers: [gridLayer],
      fallbackLayer: null,
      status: {
        mode: 'grid',
        label: '基础网格兜底模式',
        usingFallback: false,
      },
    };
  }

  if (mode === 'tdt') {
    return createTdtMode(viewer, options.tdtToken);
  }

  const fallbackLayer = addGridLayer(viewer);
  const demoLayer = addDemoLayer(viewer);

  return {
    primaryLayers: [demoLayer],
    fallbackLayer,
    status: {
      mode: 'demo',
      label: '公开演示底图模式',
      usingFallback: false,
    },
  };
}
