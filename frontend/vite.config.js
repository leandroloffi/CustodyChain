import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    host: true,  // Permite conexões externas
    port: 5173,  // Opcional: pode definir a porta explicitamente
  },
});
