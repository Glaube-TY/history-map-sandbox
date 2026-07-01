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
import type { ScenarioEvent } from '@/types/event';
import type {
  PlacesFeatureCollection,
  RoutesFeatureCollection,
  ZonesFeatureCollection,
} from '@/types/geojson';
import type { LayerVisibility } from '@/types/layer';
import type { ScenarioFaction } from '@/types/scenario';

const props = defineProps<{
  places?: PlacesFeatureCollection | null;
  routes?: RoutesFeatureCollection | null;
  zones?: ZonesFeatureCollection | null;
  layers: LayerVisibility;
  currentEvent: ScenarioEvent | null;
  factions: ScenarioFaction[];
  center: [number, number];
  defaultCameraHeight: number;
}>();

const containerRef = ref<HTMLElement | null>(null);
const hasIonToken = computed(() => Boolean(import.meta.env.VITE_CESIUM_ION_TOKEN));
const baseMapStatus = ref<'loading' | 'ready' | 'failed'>('loading');
const mapModeLabel = computed(() => {
  if (baseMapStatus.value === 'failed') {
    return '底图加载失败，当前为基础地球模式';
  }

  if (baseMapStatus.value === 'loading') {
    return hasIonToken.value ? '正在加载在线底图' : '正在加载公开演示底图';
  }

  return hasIonToken.value ? '在线底图模式' : '公开演示底图模式';
});

let viewer: Cesium.Viewer | null = null;
let sources: ScenarioDataSources | null = null;
let didZoomToData = false;

function buildLayerPayload() {
  return {
    places: props.places,
    routes: props.routes,
    zones: props.zones,
    factions: props.factions,
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

function installImageryStatusWatch(imageryLayer: Cesium.ImageryLayer | null): void {
  if (!imageryLayer) {
    baseMapStatus.value = 'failed';
    return;
  }

  baseMapStatus.value = 'ready';
  imageryLayer.imageryProvider.errorEvent.addEventListener(() => {
    baseMapStatus.value = 'failed';
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

  const sandbox = createSandboxViewer(containerRef.value, import.meta.env.VITE_CESIUM_ION_TOKEN);
  viewer = sandbox.viewer;
  installImageryStatusWatch(sandbox.imageryLayer);
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
  () => [props.places, props.routes, props.zones, props.factions],
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
