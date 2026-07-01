<script setup lang="ts">
import type { ScenarioEvent } from '@/types/event';

defineProps<{
  event: ScenarioEvent | null;
  currentTime: string;
}>();
</script>

<template>
  <section class="event-panel">
    <p class="eyebrow">当前事件</p>
    <template v-if="event">
      <div class="event-time">{{ currentTime }}</div>
      <h2>{{ event.title }}</h2>
      <p>{{ event.description }}</p>
    </template>
    <p v-else class="muted">暂无事件数据</p>
  </section>
</template>
