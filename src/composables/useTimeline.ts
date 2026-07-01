import { computed, onBeforeUnmount, ref } from 'vue';

import { compareScenarioTime, formatScenarioDate } from '@/services/timeUtils';
import type { ScenarioEvent } from '@/types/event';

export function useTimeline() {
  const events = ref<ScenarioEvent[]>([]);
  const currentIndex = ref(0);
  const isPlaying = ref(false);
  let timerId: number | undefined;

  const currentEvent = computed<ScenarioEvent | null>(() => events.value[currentIndex.value] ?? null);
  const currentTime = computed(() =>
    currentEvent.value ? formatScenarioDate(currentEvent.value.time) : '暂无时间',
  );
  const progressMax = computed(() => Math.max(events.value.length - 1, 0));

  function stopTimer(): void {
    if (timerId !== undefined) {
      window.clearInterval(timerId);
      timerId = undefined;
    }
  }

  function setEvents(nextEvents: ScenarioEvent[]): void {
    stopTimer();
    events.value = [...nextEvents].sort((left, right) =>
      compareScenarioTime(left.time, right.time),
    );
    currentIndex.value = 0;
    isPlaying.value = false;
  }

  function seek(index: number): void {
    currentIndex.value = Math.min(Math.max(index, 0), progressMax.value);
  }

  function pause(): void {
    isPlaying.value = false;
    stopTimer();
  }

  function play(): void {
    if (events.value.length <= 1 || isPlaying.value) {
      return;
    }

    isPlaying.value = true;
    timerId = window.setInterval(() => {
      if (currentIndex.value >= progressMax.value) {
        pause();
        return;
      }

      currentIndex.value += 1;
    }, 1800);
  }

  function reset(): void {
    pause();
    currentIndex.value = 0;
  }

  onBeforeUnmount(() => {
    stopTimer();
  });

  return {
    events,
    currentIndex,
    currentEvent,
    currentTime,
    progressMax,
    isPlaying,
    setEvents,
    seek,
    play,
    pause,
    reset,
  };
}
