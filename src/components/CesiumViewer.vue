<script setup lang="ts">
import 'cesium/Build/Cesium/Widgets/widgets.css';

import type * as Cesium from 'cesium';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import {
  applyLayerVisibility,
  createSandboxViewer,
  createScenarioSources,
  flyToScenarioDataBounds,
  flyToScenarioFocus,
  renderScenarioLayers,
  type ScenarioDataSources,
} from '@/services/cesiumRenderer';
import type { BasemapMode, BasemapStatus } from '@/types/basemap';
import type { ScenarioEvent } from '@/types/event';
import type {
  PlacesFeatureCollection,
  RoutesFeatureCollection,
  ZonesFeatureCollection,
} from '@/types/geojson';
import type { LayerVisibility } from '@/types/layer';
import type { ScenarioSubject } from '@/types/scenario';

const CESIUM_ION_TOKEN = import.meta.env.VITE_CESIUM_ION_TOKEN as string | undefined;
const TDT_TOKEN = import.meta.env.VITE_TDT_TOKEN as string | undefined;
const BASEMAP_MODE = import.meta.env.VITE_BASEMAP_MODE as BasemapMode | undefined;

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
const mapModeLabel = computed(() => {
  if (!basemapStatus.value) {
    return '正在初始化地图...';
  }

  if (basemapStatus.value.usingFallback && basemapStatus.value.message) {
    return basemapStatus.value.message;
  }

  return basemapStatus.value.label;
});

let viewer: Cesium.Viewer | null = null;
let sources: ScenarioDataSources | null = null;
let didZoomToData = false;

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

function installImageryStatusWatch(
  primaryLayers: Cesium.ImageryLayer[],
  fallbackLayer: Cesium.ImageryLayer | null,
): void {
  if (primaryLayers.length === 0) {
    if (fallbackLayer) {
      basemapStatus.value = {
        mode: 'grid',
        label: '基础网格兜底模式',
        usingFallback: true,
        message: '底图加载失败，已切换到基础网格兜底模式',
      };
    }

    return;
  }

  const currentMode = basemapStatus.value?.mode ?? 'grid';
  const fallbackMessage =
    currentMode === 'tdt'
      ? '天地图底图加载失败，已切换到基础网格兜底模式'
      : '底图加载失败，已切换到基础网格兜底模式';

  primaryLayers.forEach((layer) => {
    layer.imageryProvider.errorEvent.addEventListener(() => {
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
  });
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

onMounted(() => {
  if (!containerRef.value) {
    return;
  }

  const sandbox = createSandboxViewer(containerRef.value, {
    ionToken: CESIUM_ION_TOKEN,
    basemapMode: BASEMAP_MODE,
    tdtToken: TDT_TOKEN,
  });
  viewer = sandbox.viewer;
  basemapStatus.value = sandbox.basemapStatus;
  installImageryStatusWatch(sandbox.primaryLayers, sandbox.fallbackLayer);
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
    <div class="map-mode-badge">{{ mapModeLabel }}</div>
    <div class="map-action-bar" aria-label="地图快捷定位">
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
  </section>
</template>
