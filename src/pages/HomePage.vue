<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

import AppHeader from '@/components/AppHeader.vue';
import { useScenarioData } from '@/composables/useScenarioData';
import { resolvePublicAsset } from '@/services/scenarioLoader';

const { scenarios, isLoading, errorMessage, fetchScenarios } = useScenarioData();
const selectedCategory = ref<string>('全部');

const categories = computed<string[]>(() => {
  const set = new Set(scenarios.value.map((s) => s.category));
  return ['全部', ...Array.from(set)];
});

const filteredScenarios = computed(() => {
  if (selectedCategory.value === '全部') {
    return scenarios.value;
  }

  return scenarios.value.filter((s) => s.category === selectedCategory.value);
});

const categoryLabel = computed(() => {
  if (selectedCategory.value === '全部') {
    return '全部专题';
  }

  return selectedCategory.value;
});

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

      <section class="category-filter" aria-label="专题分类筛选">
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          :class="['category-pill', { active: category === selectedCategory }]"
          @click="selectedCategory = category"
        >
          {{ category }}
        </button>
      </section>

      <p class="scenario-count muted">
        {{ categoryLabel }}：当前显示 {{ filteredScenarios.length }} 个专题
      </p>

      <section class="scenario-grid" aria-label="专题列表">
        <p v-if="isLoading" class="muted">正在加载专题...</p>
        <p v-else-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <RouterLink
          v-for="scenario in filteredScenarios"
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

<style scoped>
.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.category-pill {
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--muted);
  background: var(--surface);
  padding: 6px 14px;
  font-size: 0.86rem;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}

.category-pill:hover {
  border-color: var(--accent);
  color: var(--text);
}

.category-pill.active {
  border-color: var(--accent);
  color: #071110;
  background: var(--accent);
}

.scenario-count {
  margin-bottom: 18px;
  font-size: 0.92rem;
}
</style>
