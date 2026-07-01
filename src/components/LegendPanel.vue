<script setup lang="ts">
import type { ScenarioEvent } from '@/types/event';
import type { ScenarioSubject } from '@/types/scenario';

defineProps<{
  event: ScenarioEvent | null;
  subjects?: ScenarioSubject[];
}>();
</script>

<template>
  <section class="tool-panel">
    <div class="panel-heading">
      <p class="eyebrow">Legend</p>
      <h2>图例</h2>
    </div>

    <ul class="legend-list">
      <li>
        <span class="legend-symbol place-symbol"></span>
        <span>地点 / 空间标注</span>
      </li>
      <li>
        <span class="legend-symbol route-symbol"></span>
        <span>行动路线 / 交通方向</span>
      </li>
      <li>
        <span class="legend-symbol zone-symbol"></span>
        <span>影响区域 / 重点范围</span>
      </li>
      <li>
        <span class="legend-symbol event-symbol"></span>
        <span>{{ event ? event.title : '当前事件' }}</span>
      </li>
    </ul>

    <template v-if="subjects && subjects.length > 0">
      <div class="legend-factions">
        <h3>主题对象颜色</h3>
        <ul class="legend-list">
          <li v-for="subject in subjects" :key="subject.id">
            <span class="legend-symbol" :style="{ backgroundColor: subject.color }"></span>
            <span>{{ subject.name }}</span>
          </li>
        </ul>
      </div>
    </template>
  </section>
</template>

<style scoped>
.legend-factions {
  margin-top: 16px;
  border-top: 1px solid var(--line-soft);
  padding-top: 14px;
}

.legend-factions h3 {
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: var(--muted);
}
</style>
