
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Injects the key for any code still looking for process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    },
    server: {
      port: 3000,
      open: true
    }
  };
});
