import { defineConfig } from 'vitest/config';

/**********************************************************************************/

export default defineConfig({
  test: {
    root: './',
    testTimeout: 16_000,
    teardownTimeout: 8_000,
    globalSetup: './__tests__/config/setup.ts',
    logHeapUsage: true,
    server: {
      sourcemap: 'inline'
    }
  }
});
