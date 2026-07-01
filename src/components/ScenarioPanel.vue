<script setup lang="ts">
import { computed } from 'vue';

import { formatScenarioRange } from '@/services/timeUtils';
import type { ScenarioEvent } from '@/types/event';
import type { ScenarioMetadata, ScenarioSources } from '@/types/scenario';

const props = defineProps<{
  metadata: ScenarioMetadata | null;
  sources: ScenarioSources | null;
  event: ScenarioEvent | null;
}>();

const dateRange = computed(() => {
  if (!props.metadata) {
    return '暂无时间范围';
  }

  return formatScenarioRange(props.metadata.startDate, props.metadata.endDate);
});
</script>

<template>
  <section class="scenario-panel">
    <template v-if="metadata">
      <p class="eyebrow">{{ metadata.category }}</p>
      <h1>{{ metadata.title }}</h1>
      <p class="summary">{{ metadata.summary }}</p>

      <dl class="meta-list">
        <div>
          <dt>时间</dt>
          <dd>{{ dateRange }}</dd>
        </div>
        <div>
          <dt>中心点</dt>
          <dd>{{ metadata.center[0].toFixed(4) }}, {{ metadata.center[1].toFixed(4) }}</dd>
        </div>
      </dl>

      <div class="tag-list">
        <span v-for="tag in metadata.tags" :key="tag">{{ tag }}</span>
      </div>

      <div class="faction-list">
        <h2>参与方 / 对象</h2>
        <div v-for="faction in metadata.factions" :key="faction.id" class="faction-row">
          <span class="faction-color" :style="{ backgroundColor: faction.color }"></span>
          <span>{{ faction.name }}</span>
        </div>
      </div>

      <div class="source-note">
        <h2>资料状态</h2>
        <p>{{ sources?.notice ?? '暂无资料说明' }}</p>
      </div>
    </template>

    <p v-else class="muted">正在加载专题信息...</p>
  </section>
</template>
