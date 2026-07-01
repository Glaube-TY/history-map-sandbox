<script setup lang="ts">
import 'cesium/Build/Cesium/Widgets/widgets.css';

import type * as Cesium from 'cesium';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import {
  applyLayerVisibility,
  createSandboxViewer,
  createScenarioSources,
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

const props = defineProps<{
  places?: PlacesFeatureCollection | null;
  routes?: RoutesFeatureCollection | null;
  zones?: ZonesFeatureCollection | null;
  layers: LayerVisibility;
  currentEvent: ScenarioEvent | null;
  center: [number, number];
  defaultCameraHeight: number;
}>();

const containerRef = ref<HTMLElement | null>(null);
const hasIonToken = computed(() => Boolean(import.meta.env.VITE_CESIUM_ION_TOKEN));
const mapModeLabel = computed(() =>
  hasIonToken.value ? '已配置 Cesium Ion token' : '当前为基础地图模式',
);

let viewer: Cesium.Viewer | null = null;
let sources: ScenarioDataSources | null = null;

function refreshLayers(): void {
  if (!viewer || !sources) {
    return;
  }

  renderScenarioLayers(sources, {
    places: props.places,
    routes: props.routes,
    zones: props.zones,
  });
  applyLayerVisibility(sources, props.layers);
  viewer.scene.requestRender();
}

onMounted(() => {
  if (!containerRef.value) {
    return;
  }

  viewer = createSandboxViewer(containerRef.value, import.meta.env.VITE_CESIUM_ION_TOKEN);
  sources = createScenarioSources(viewer);
  refreshLayers();
  flyToScenarioFocus(
    viewer,
    {
      center: props.center,
      height: props.defaultCameraHeight,
    },
    0,
  );
});

watch(
  () => [props.places, props.routes, props.zones],
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
  </section>
</template>
