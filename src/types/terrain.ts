export type TerrainMode = 'flat' | 'cesium-ion';

export interface TerrainStatus {
  mode: TerrainMode;
  label: string;
  usingFallback: boolean;
  message?: string;
}
