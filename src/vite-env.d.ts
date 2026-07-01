/// <reference types="vite/client" />

declare const CESIUM_BASE_URL: string;

interface ImportMetaEnv {
  readonly VITE_CESIUM_ION_TOKEN?: string;
  readonly VITE_TDT_TOKEN?: string;
  readonly VITE_BASEMAP_MODE?: 'demo' | 'tdt' | 'grid';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
