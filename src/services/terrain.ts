import * as Cesium from 'cesium';

import type { TerrainMode, TerrainStatus } from '@/types/terrain';

const VALID_TERRAIN_MODES: TerrainMode[] = ['flat', 'cesium-ion'];

export interface CreateTerrainOptions {
  ionToken?: string;
}

export interface TerrainResult {
  status: TerrainStatus;
}

export function normalizeTerrainMode(value?: string): TerrainMode {
  if (value && (VALID_TERRAIN_MODES as string[]).includes(value)) {
    return value as TerrainMode;
  }

  return 'flat';
}

function applyFlatTerrain(viewer: Cesium.Viewer): void {
  const flatTerrain = new Cesium.Terrain(
    Promise.resolve(new Cesium.EllipsoidTerrainProvider()),
  );
  viewer.scene.setTerrain(flatTerrain);
}

function applyCesiumIonTerrain(
  viewer: Cesium.Viewer,
  ionToken?: string,
): TerrainResult {
  if (!ionToken) {
    applyFlatTerrain(viewer);

    return {
      status: {
        mode: 'cesium-ion',
        label: 'Cesium Ion token 缺失，已回退基础平面地形',
        usingFallback: true,
        message: '未配置 VITE_CESIUM_ION_TOKEN，已回退基础平面地形',
      },
    };
  }

  try {
    Cesium.Ion.defaultAccessToken = ionToken;
    const ionTerrain = Cesium.Terrain.fromWorldTerrain();
    viewer.scene.setTerrain(ionTerrain);

    return {
      status: {
        mode: 'cesium-ion',
        label: 'Cesium Ion 三维地形模式',
        usingFallback: false,
      },
    };
  } catch {
    applyFlatTerrain(viewer);

    return {
      status: {
        mode: 'cesium-ion',
        label: 'Cesium Ion 地形启用失败，已回退基础平面地形',
        usingFallback: true,
        message: 'Cesium Ion 地形启用失败，已回退基础平面地形',
      },
    };
  }
}

export function applyTerrainMode(
  viewer: Cesium.Viewer,
  mode: TerrainMode,
  options: CreateTerrainOptions = {},
): TerrainResult {
  if (mode === 'cesium-ion') {
    return applyCesiumIonTerrain(viewer, options.ionToken);
  }

  applyFlatTerrain(viewer);

  return {
    status: {
      mode: 'flat',
      label: '基础平面地形模式',
      usingFallback: false,
    },
  };
}
