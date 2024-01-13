import { defineConfig } from 'vitest/config';

/**********************************************************************************/

export default defineConfig({
  test: {
    root: './',
    testTimeout: 8_000,
    teardownTimeout: 4_000,
    globalSetup: './__tests__/config/setup.ts',
    logHeapUsage: true,
    server: {
      sourcemap: 'inline'
    },
    reporters: 'default',
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'html', 'clover', 'json', 'cobertura'],
      include: ['src/**/*.ts'],
      exclude: ['{src/main.ts,src/utils/logger.ts,src/types/index.d.ts}'],
      reportsDirectory: './__tests__/coverage/'
    }
  }
});
