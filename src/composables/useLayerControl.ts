import { reactive } from 'vue';

import {
  DEFAULT_LAYER_VISIBILITY,
  LAYER_OPTIONS,
  type LayerKey,
  type LayerVisibility,
} from '@/types/layer';

export function useLayerControl() {
  const layers = reactive<LayerVisibility>({ ...DEFAULT_LAYER_VISIBILITY });

  function setLayer(key: LayerKey, value: boolean): void {
    layers[key] = value;
  }

  function toggleLayer(key: LayerKey): void {
    layers[key] = !layers[key];
  }

  function resetLayers(): void {
    Object.assign(layers, DEFAULT_LAYER_VISIBILITY);
  }

  return {
    layers,
    layerOptions: LAYER_OPTIONS,
    setLayer,
    toggleLayer,
    resetLayers,
  };
}
