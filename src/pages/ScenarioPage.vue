<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

import AppHeader from '@/components/AppHeader.vue';
import CesiumViewer from '@/components/CesiumViewer.vue';
import EventPanel from '@/components/EventPanel.vue';
import LayerPanel from '@/components/LayerPanel.vue';
import LegendPanel from '@/components/LegendPanel.vue';
import ScenarioPanel from '@/components/ScenarioPanel.vue';
import TimelinePlayer from '@/components/TimelinePlayer.vue';
import { useLayerControl } from '@/composables/useLayerControl';
import { useScenarioData } from '@/composables/useScenarioData';
import { useTimeline } from '@/composables/useTimeline';

const route = useRoute();
const { scenario, isLoading, errorMessage, fetchScenario } = useScenarioData();
const { layers, layerOptions, setLayer } = useLayerControl();
const {
  events,
  currentEvent,
  currentIndex,
  currentTime,
  isPlaying,
  setEvents,
  seek,
  play,
  pause,
  reset,
} = useTimeline();

const scenarioId = computed(() => String(route.params.id ?? ''));

async function loadCurrentScenario(): Promise<void> {
  if (!scenarioId.value) {
    return;
  }

  await fetchScenario(scenarioId.value);

  if (scenario.value) {
    setEvents(scenario.value.events);
  }
}

onMounted(() => {
  void loadCurrentScenario();
});

watch(scenarioId, () => {
  void loadCurrentScenario();
});
</script>

<template>
  <div class="scenario-page">
    <AppHeader />

    <main class="scenario-workspace">
      <aside class="workspace-left">
        <ScenarioPanel
          :metadata="scenario?.metadata ?? null"
          :sources="scenario?.sources ?? null"
          :event="currentEvent"
        />
      </aside>

      <section class="workspace-map">
        <div v-if="isLoading" class="map-status">正在加载专题数据...</div>
        <div v-else-if="errorMessage" class="map-status error-text">{{ errorMessage }}</div>
        <CesiumViewer
          v-else-if="scenario"
          :places="scenario.places"
          :routes="scenario.routes"
          :zones="scenario.zones"
          :layers="layers"
          :current-event="currentEvent"
          :center="scenario.metadata.center"
          :default-camera-height="scenario.metadata.defaultCameraHeight"
        />
        <EventPanel
          v-if="layers.events"
          class="event-overlay"
          :event="currentEvent"
          :current-time="currentTime"
        />
      </section>

      <aside class="workspace-right">
        <LayerPanel :layers="layers" :options="layerOptions" @set-layer="setLayer" />
        <LegendPanel :event="currentEvent" />
      </aside>
    </main>

    <TimelinePlayer
      class="timeline-dock"
      :events="events"
      :current-index="currentIndex"
      :current-time="currentTime"
      :is-playing="isPlaying"
      @play="play"
      @pause="pause"
      @reset="reset"
      @seek="seek"
    />
  </div>
</template>
