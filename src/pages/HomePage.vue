<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';

import AppHeader from '@/components/AppHeader.vue';
import { useScenarioData } from '@/composables/useScenarioData';
import { resolvePublicAsset } from '@/services/scenarioLoader';

const { scenarios, isLoading, errorMessage, fetchScenarios } = useScenarioData();

onMounted(() => {
  void fetchScenarios();
});
</script>

<template>
  <div class="page-shell">
    <AppHeader />

    <main class="home-page">
      <section class="home-intro">
        <p class="eyebrow">历史空间可视化</p>
        <h1>History Map Sandbox</h1>
        <p>以地图、地形与时间轴展示历史事件的空间演变</p>
      </section>

      <section class="scenario-grid" aria-label="专题列表">
        <p v-if="isLoading" class="muted">正在加载专题...</p>
        <p v-else-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <RouterLink
          v-for="scenario in scenarios"
          v-else
          :key="scenario.id"
          class="scenario-card"
          :to="{ name: 'scenario', params: { id: scenario.id } }"
        >
          <img :src="resolvePublicAsset(scenario.cover)" :alt="scenario.title" />
          <div>
            <div class="scenario-card-meta">
              <span>{{ scenario.category }}</span>
              <span>{{ scenario.period }}</span>
            </div>
            <h2>{{ scenario.title }}</h2>
            <p>{{ scenario.summary }}</p>
            <small>{{ scenario.location }}</small>
          </div>
        </RouterLink>
      </section>
    </main>
  </div>
</template>
