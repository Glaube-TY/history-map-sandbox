import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const base = '/history-map-sandbox/';

export default defineConfig({
  base,
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/cesium/Build/Cesium/Workers/**/*',
          dest: 'cesiumStatic/Workers',
          rename: { stripBase: 5 },
        },
        {
          src: 'node_modules/cesium/Build/Cesium/ThirdParty/**/*',
          dest: 'cesiumStatic/ThirdParty',
          rename: { stripBase: 5 },
        },
        {
          src: 'node_modules/cesium/Build/Cesium/Assets/**/*',
          dest: 'cesiumStatic/Assets',
          rename: { stripBase: 5 },
        },
        {
          src: 'node_modules/cesium/Build/Cesium/Widgets/**/*',
          dest: 'cesiumStatic/Widgets',
          rename: { stripBase: 5 },
        },
      ],
    }),
  ],
  define: {
    CESIUM_BASE_URL: JSON.stringify(`${base}cesiumStatic/`),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
