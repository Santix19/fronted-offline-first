import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { offlineAssets } from './tools/offlineAssets';

// Port 5173 is the one the backend already allows in ALLOWED_ORIGINS.
export default defineConfig({
  plugins: [react(), offlineAssets()],
  server: { port: 5173, host: true },
});
