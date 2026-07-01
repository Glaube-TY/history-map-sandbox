<script setup lang="ts">
import type { LayerKey, LayerOption, LayerVisibility } from '@/types/layer';

defineProps<{
  layers: LayerVisibility;
  options: LayerOption[];
}>();

const emit = defineEmits<{
  setLayer: [key: LayerKey, value: boolean];
}>();

function onChange(key: LayerKey, event: Event): void {
  emit('setLayer', key, (event.target as HTMLInputElement).checked);
}
</script>

<template>
  <section class="tool-panel">
    <div class="panel-heading">
      <p class="eyebrow">Layers</p>
      <h2>图层</h2>
    </div>

    <div class="layer-list">
      <label v-for="option in options" :key="option.key" class="layer-toggle">
        <input
          type="checkbox"
          :checked="layers[option.key]"
          @change="onChange(option.key, $event)"
        />
        <span class="toggle-copy">
          <strong>{{ option.label }}</strong>
          <small>{{ option.description }}</small>
        </span>
      </label>
    </div>
  </section>
</template>
