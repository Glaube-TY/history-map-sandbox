<script setup lang="ts">
import 'cesium/Build/Cesium/Widgets/widgets.css';

import type * as Cesium from 'cesium';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import {
  applyBasemapMode,
  normalizeBasemapMode,
  removeBasemapLayers,
} from '@/services/basemap';
import {
  applyLayerVisibility,
  createSandboxViewer,
  createScenarioSources,
  flyToScenarioDataBounds,
  flyToScenarioFocus,
  flyToScenarioOblique,
  flyToScenarioOverviewTopDown,
  renderScenarioLayers,
  type ScenarioDataSources,
} from '@/services/cesiumRenderer';
import { applyTerrainMode, normalizeTerrainMode } from '@/services/terrain';
import type { BasemapMode, BasemapStatus } from '@/types/basemap';
import type { TerrainMode, TerrainStatus } from '@/types/terrain';
import type { ScenarioEvent } from '@/types/event';
import type {
  PlacesFeatureCollection,
  RoutesFeatureCollection,
  ZonesFeatureCollection,
} from '@/types/geojson';
import type { LayerVisibility } from '@/types/layer';
import type { ScenarioSubject } from '@/types/scenario';

const BASEMAP_STORAGE_KEY = 'history-map-sandbox:basemap-mode';
const TERRAIN_STORAGE_KEY = 'history-map-sandbox:terrain-mode';

const CESIUM_ION_TOKEN = import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined;
const TDT_TOKEN = import.meta.env.VITE_TDT_TOKEN as string | undefined;
const BASEMAP_MODE = import.meta.env.VITE_BASEMAP_MODE as BasemapMode | undefined;
const TERRAIN_MODE = import.meta.env.VITE_TERRAIN_MODE as TerrainMode | undefined;

const props = defineProps<{
  places?: PlacesFeatureCollection | null;
  routes?: RoutesFeatureCollection | null;
  zones?: ZonesFeatureCollection | null;
  layers: LayerVisibility;
  currentEvent: ScenarioEvent | null;
  subjects: ScenarioSubject[];
  center: [number, number];
  defaultCameraHeight: number;
}>();

const containerRef = ref<HTMLElement | null>(null);
const basemapStatus = ref<BasemapStatus | null>(null);
const terrainStatus = ref<TerrainStatus | null>(null);
const currentBasemapMode = ref<BasemapMode>('demo');
const currentTerrainMode = ref<TerrainMode>('flat');
const mapModeLabel = computed(() => {
  if (!basemapStatus.value) {
    return '正在初始化底图...';
  }

  if (basemapStatus.value.usingFallback && basemapStatus.value.message) {
    return basemapStatus.value.message;
  }

  return basemapStatus.value.label;
});
const terrainModeLabel = computed(() => {
  if (!terrainStatus.value) {
    return '正在初始化地形...';
  }

  if (terrainStatus.value.usingFallback && terrainStatus.value.message) {
    return terrainStatus.value.message;
  }

  return terrainStatus.value.label;
});

const basemapOptions = [
  { value: 'demo' as BasemapMode, label: '公开' },
  { value: 'tdt' as BasemapMode, label: '天地图' },
  { value: 'grid' as BasemapMode, label: '网格' },
];

const terrainOptions = [
  { value: 'flat' as TerrainMode, label: '平面' },
  { value: 'cesium-ion' as TerrainMode, label: '地形' },
];

let viewer: Cesium.Viewer | null = null;
let sources: ScenarioDataSources | null = null;
let didZoomToData = false;
let currentBasemapResult: {
  primaryLayers: Cesium.ImageryLayer[];
  fallbackLayer: Cesium.ImageryLayer | null;
  status: BasemapStatus;
} | null = null;
const cleanupErrorListeners: (() => void)[] = [];

function buildLayerPayload() {
  return {
    places: props.places,
    routes: props.routes,
    zones: props.zones,
    subjects: props.subjects,
    currentEventTime: props.currentEvent?.time ?? null,
  };
}

function refreshLayers(): void {
  if (!viewer || !sources) {
    return;
  }

  const payload = buildLayerPayload();
  renderScenarioLayers(sources, payload);
  applyLayerVisibility(sources, props.layers);
  viewer.scene.requestRender();

  if (!didZoomToData && hasRenderableData()) {
    didZoomToData = true;
    window.setTimeout(() => {
      if (viewer) {
        flyToScenarioDataBounds(viewer, payload);
      }
    }, 350);
  }
}

function hasRenderableData(): boolean {
  return Boolean(
    props.places?.features.length || props.routes?.features.length || props.zones?.features.length,
  );
}

function resolveInitialMode(): BasemapMode {
  try {
    const saved = localStorage.getItem(BASEMAP_STORAGE_KEY);
    if (saved) {
      return normalizeBasemapMode(saved);
    }
  } catch {
    // Ignore localStorage access errors to prevent crash.
  }

  return normalizeBasemapMode(BASEMAP_MODE);
}

function saveBasemapMode(mode: BasemapMode): void {
  try {
    localStorage.setItem(BASEMAP_STORAGE_KEY, mode);
  } catch {
    // Ignore localStorage write errors.
  }
}

function resolveInitialTerrainMode(): TerrainMode {
  try {
    const saved = localStorage.getItem(TERRAIN_STORAGE_KEY);
    if (saved) {
      return normalizeTerrainMode(saved);
    }
  } catch {
    // Ignore localStorage access errors to prevent crash.
  }

  return normalizeTerrainMode(TERRAIN_MODE);
}

function saveTerrainMode(mode: TerrainMode): void {
  try {
    localStorage.setItem(TERRAIN_STORAGE_KEY, mode);
  } catch {
    // Ignore localStorage write errors.
  }
}

function installImageryStatusWatch(
  primaryLayers: Cesium.ImageryLayer[],
  fallbackLayer: Cesium.ImageryLayer | null,
): () => void {
  if (primaryLayers.length === 0) {
    return () => {};
  }

  const currentMode = basemapStatus.value?.mode ?? 'grid';
  const fallbackMessage =
    currentMode === 'tdt'
      ? '天地图底图加载失败，已切换到基础网格兜底模式'
      : '底图加载失败，已切换到基础网格兜底模式';

  const removeListeners: (() => void)[] = [];

  primaryLayers.forEach((layer) => {
    const removeListener = layer.imageryProvider.errorEvent.addEventListener(() => {
      primaryLayers.forEach((primaryLayer) => {
        primaryLayer.show = false;
      });

      if (fallbackLayer) {
        fallbackLayer.show = true;
      }

      basemapStatus.value = {
        mode: 'grid',
        label: '基础网格兜底模式',
        usingFallback: true,
        message: fallbackMessage,
      };
    });

    removeListeners.push(removeListener);
  });

  return () => {
    removeListeners.forEach((remove) => remove());
  };
}

function applyBasemapToViewer(mode: BasemapMode): void {
  if (!viewer || !currentBasemapResult) {
    return;
  }

  cleanupErrorListeners.forEach((cleanup) => cleanup());
  cleanupErrorListeners.length = 0;

  removeBasemapLayers(viewer, currentBasemapResult);

  const result = applyBasemapMode(viewer, mode, { tdtToken: TDT_TOKEN });
  currentBasemapResult = result;
  currentBasemapMode.value = mode;
  basemapStatus.value = result.status;

  const cleanup = installImageryStatusWatch(result.primaryLayers, result.fallbackLayer);
  cleanupErrorListeners.push(cleanup);

  viewer.scene.requestRender();
}

function switchBasemap(mode: BasemapMode): void {
  if (mode === currentBasemapMode.value) {
    return;
  }

  applyBasemapToViewer(mode);
  saveBasemapMode(mode);
}

function applyTerrainToViewer(mode: TerrainMode): void {
  if (!viewer) {
    return;
  }

  const result = applyTerrainMode(viewer, mode, { ionToken: CESIUM_ION_TOKEN });
  currentTerrainMode.value = mode;
  terrainStatus.value = result.status;
  viewer.scene.requestRender();
}

function switchTerrain(mode: TerrainMode): void {
  if (mode === currentTerrainMode.value) {
    return;
  }

  applyTerrainToViewer(mode);
  saveTerrainMode(mode);
}

function goToScenarioOverview(): void {
  if (viewer && hasRenderableData()) {
    flyToScenarioDataBounds(viewer, buildLayerPayload());
  }
}

function goToCurrentEvent(): void {
  if (viewer && props.currentEvent) {
    flyToScenarioFocus(viewer, props.currentEvent.focus);
  }
}

function goToTopDownView(): void {
  if (!viewer) {
    return;
  }

  flyToScenarioOverviewTopDown(
    viewer,
    buildLayerPayload(),
    props.center,
    props.defaultCameraHeight,
  );
}

function goToObliqueView(): void {
  if (!viewer) {
    return;
  }

  flyToScenarioOblique(
    viewer,
    buildLayerPayload(),
    props.center,
    props.defaultCameraHeight,
  );
}

onMounted(() => {
  if (!containerRef.value) {
    return;
  }

  const initialMode = resolveInitialMode();

  const sandbox = createSandboxViewer(containerRef.value, {
    ionToken: CESIUM_ION_TOKEN,
    basemapMode: initialMode,
    tdtToken: TDT_TOKEN,
  });
  viewer = sandbox.viewer;
  currentBasemapResult = {
    primaryLayers: sandbox.primaryLayers,
    fallbackLayer: sandbox.fallbackLayer,
    status: sandbox.basemapStatus,
  };
  currentBasemapMode.value = initialMode;
  basemapStatus.value = sandbox.basemapStatus;

  const cleanup = installImageryStatusWatch(sandbox.primaryLayers, sandbox.fallbackLayer);
  cleanupErrorListeners.push(cleanup);

  const initialTerrainMode = resolveInitialTerrainMode();
  const terrainResult = applyTerrainMode(viewer, initialTerrainMode, {
    ionToken: CESIUM_ION_TOKEN,
  });
  currentTerrainMode.value = initialTerrainMode;
  terrainStatus.value = terrainResult.status;

  sources = createScenarioSources(viewer);
  flyToScenarioFocus(
    viewer,
    {
      center: props.center,
      height: props.defaultCameraHeight,
    },
    0,
  );
  refreshLayers();
});

watch(
  () => [props.places, props.routes, props.zones, props.subjects],
  () => refreshLayers(),
  { deep: true },
);

watch(
  () => props.layers,
  () => {
    if (viewer && sources) {
      applyLayerVisibility(sources, props.layers);
      viewer.scene.requestRender();
    }
  },
  { deep: true },
);

watch(
  () => props.currentEvent?.id,
  () => {
    if (viewer && props.currentEvent) {
      refreshLayers();
      flyToScenarioFocus(viewer, props.currentEvent.focus);
    }
  },
);

onBeforeUnmount(() => {
  cleanupErrorListeners.forEach((cleanup) => cleanup());
  cleanupErrorListeners.length = 0;

  if (viewer && !viewer.isDestroyed()) {
    viewer.destroy();
  }

  viewer = null;
  sources = null;
});
</script>

<template>
  <section class="cesium-shell">
    <div ref="containerRef" class="cesium-container"></div>
    <div class="map-status-badges">
      <div class="map-mode-badge">{{ mapModeLabel }}</div>
      <div class="map-terrain-badge">{{ terrainModeLabel }}</div>
    </div>
    <div class="map-tools">
      <div class="map-tool-group" aria-label="地图快捷定位">
        <button type="button" title="回到专题全局" @click="goToScenarioOverview">◎ 全局</button>
        <button
          type="button"
          title="定位当前事件"
          :disabled="!props.currentEvent"
          @click="goToCurrentEvent"
        >
          ⌖ 当前事件
        </button>
      </div>
      <div class="map-tool-group" aria-label="底图切换">
        <button
          v-for="option in basemapOptions"
          :key="option.value"
          type="button"
          :class="{ active: currentBasemapMode === option.value }"
          @click="switchBasemap(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
      <div class="map-tool-group" aria-label="地形切换">
        <button
          v-for="option in terrainOptions"
          :key="option.value"
          type="button"
          :class="{ active: currentTerrainMode === option.value }"
          @click="switchTerrain(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
      <div class="map-tool-group" aria-label="视角切换">
        <button type="button" title="垂直俯视视角" @click="goToTopDownView">俯视</button>
        <button type="button" title="斜视三维视角" @click="goToObliqueView">三维视角</button>
      </div>
    </div>
  </section>
</template>
