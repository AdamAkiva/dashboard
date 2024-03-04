import type { UserConfig } from 'vitest';
import { defineConfig } from 'vitest/config';

import { isStressTest, withLogs } from './utils.js';

/**********************************************************************************/

const defaultConfig: UserConfig = {
  root: './',
  testTimeout: 8_000,
  teardownTimeout: 4_000,
  globalSetup: './__tests__/config/globalSetup.ts',
  setupFiles: './__tests__/config/setup.ts',
  restoreMocks: true,
  logHeapUsage: true,
  fileParallelism: true,
  slowTestThreshold: 128,
  pool: 'threads',
  poolOptions: {
    threads: {
      isolate: false,
      useAtomics: true
    }
  },
  maxConcurrency: 16,
  server: {
    sourcemap: 'inline' as const
  },
  // default reporter override some logs for some reason. This is how we handle it
  reporters: withLogs()
    ? ['basic', 'hanging-process']
    : ['default', 'hanging-process']
};

const stressConfig: UserConfig = {
  ...defaultConfig,
  fileParallelism: false,
  testTimeout: 600_000,
  teardownTimeout: 16_000
};

export default defineConfig(
  isStressTest() ? { test: stressConfig } : { test: defaultConfig }
);
