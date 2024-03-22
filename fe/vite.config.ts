import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react-swc';
import { defineConfig, type UserConfig } from 'vite';

/******************************************************************************/

// https://vitejs.dev/config/

export default defineConfig(({ command }): UserConfig => {
  const sharedConfig = {
    root: './',
    envPrefix: 'DASHBOARD_',
    publicDir: './public',
    plugins: [react()],
    optimizeDeps: {
      include: ['@emotion/styled']
    },
    resolve: {
      alias: [
        {
          find: '@',
          replacement: fileURLToPath(new URL('./src', import.meta.url))
        }
      ]
    }
  };

  if (command === 'build') {
    return {
      ...sharedConfig,
      build: {
        outDir: './build'
      },
      esbuild: {
        drop: ['console', 'debugger']
      }
    };
  }

  return {
    ...sharedConfig,
    css: {
      devSourcemap: true
    },
    server: {
      host: '0.0.0.0',
      port: Number(process.env.CLIENT_PORT),
      strictPort: true
    }
  };
});
