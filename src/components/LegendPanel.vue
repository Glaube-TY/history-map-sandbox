<script setup lang="ts">
import type { ScenarioEvent } from '@/types/event';

defineProps<{
  event: ScenarioEvent | null;
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
  </section>
</template>
