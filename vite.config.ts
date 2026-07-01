import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: '/history-map-sandbox/',
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/cesium/Build/Cesium/Workers',
          dest: 'cesiumStatic',
        },
        {
          src: 'node_modules/cesium/Build/Cesium/ThirdParty',
          dest: 'cesiumStatic',
        },
        {
          src: 'node_modules/cesium/Build/Cesium/Assets',
          dest: 'cesiumStatic',
        },
        {
          src: 'node_modules/cesium/Build/Cesium/Widgets',
          dest: 'cesiumStatic',
        },
      ],
    }),
  ],
  define: {
    CESIUM_BASE_URL: JSON.stringify('/history-map-sandbox/cesiumStatic/'),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
