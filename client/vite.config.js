import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const clientRoot = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });
const apiPort = Number(process.env.PORT || 4002);
export default defineConfig({
  root: clientRoot,
  cacheDir: fileURLToPath(new URL('./.vite', import.meta.url)),
  plugins: [react()],
  server: { proxy: { '/api': `http://localhost:${apiPort}` } }
});
