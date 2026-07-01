<script setup lang="ts">
import { computed } from 'vue';

import type { ScenarioEvent } from '@/types/event';

const props = defineProps<{
  events: ScenarioEvent[];
  currentIndex: number;
  currentTime: string;
  isPlaying: boolean;
}>();

const emit = defineEmits<{
  play: [];
  pause: [];
  reset: [];
  seek: [index: number];
}>();

const rangeMax = computed(() => Math.max(props.events.length - 1, 0));
const currentEvent = computed(() => props.events[props.currentIndex] ?? null);

function onSeek(event: Event): void {
  emit('seek', Number((event.target as HTMLInputElement).value));
}
</script>

<template>
  <section class="timeline-player">
    <div class="timeline-controls">
      <button class="icon-button" type="button" aria-label="重置时间轴" title="重置" @click="emit('reset')">
        ↺
      </button>
      <button
        v-if="isPlaying"
        class="icon-button primary"
        type="button"
        aria-label="暂停时间轴"
        title="暂停"
        @click="emit('pause')"
      >
        Ⅱ
      </button>
      <button
        v-else
        class="icon-button primary"
        type="button"
        aria-label="播放时间轴"
        title="播放"
        @click="emit('play')"
      >
        ▶
      </button>
    </div>

    <div class="timeline-track">
      <div class="timeline-meta">
        <span>{{ currentTime }}</span>
        <strong>{{ currentEvent?.title ?? '暂无事件' }}</strong>
      </div>
      <input
        type="range"
        min="0"
        :max="rangeMax"
        step="1"
        :value="currentIndex"
        :disabled="events.length === 0"
        aria-label="时间轴进度"
        @input="onSeek"
      />
      <div class="timeline-steps" aria-hidden="true">
        <span
          v-for="(event, index) in events"
          :key="event.id"
          :class="{ active: index <= currentIndex }"
        ></span>
      </div>
    </div>
  </section>
</template>
