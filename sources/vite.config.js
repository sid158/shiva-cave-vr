import { defineConfig } from 'vite';
import { resolve } from 'path';
import basicSsl from '@vitejs/plugin-basic-ssl';

// WebXR needs a secure context. `localhost` counts as secure, so the plain
// HTTP dev server works over `adb reverse`. Serving to the headset over Wi-Fi
// needs HTTPS, which is what the `https` scripts turn on.
const wantsHttps = process.env.CAVE_HTTPS === '1';

export default defineConfig({
  base: './',
  plugins: wantsHttps ? [basicSsl()] : [],
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      // two entry points: the cave, and the guided journey that will
      // eventually arrive at it
      input: {
        main: resolve(__dirname, 'index.html'),
        journey: resolve(__dirname, 'journey.html'),
      },
      output: {
        manualChunks: { three: ['three'] },
      },
    },
  },
});
