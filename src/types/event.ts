import type { LayerKey } from './layer';

export interface ScenarioFocus {
  center: [number, number];
  height: number;
  heading?: number;
  pitch?: number;
  roll?: number;
}

export interface ScenarioEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  focus: ScenarioFocus;
  visibleLayers: LayerKey[];
  displayTime?: string;
  sortOrder?: number;
}
