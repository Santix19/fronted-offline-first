import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Port 5173 is the one the backend already allows in ALLOWED_ORIGINS.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true },
});
