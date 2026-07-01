export type BasemapMode = 'demo' | 'tdt' | 'grid';

export interface BasemapStatus {
  mode: BasemapMode;
  label: string;
  usingFallback: boolean;
  message?: string;
}
