import { cpus } from 'node:os';

import type { UserConfig } from 'vitest';
import { defineConfig } from 'vitest/config';

import { isStressTest, withLogs } from './globalSetup.js';

/**********************************************************************************/

const numOfCores = cpus().length;

const defaultTestConfig: UserConfig = {
  root: './',
  testTimeout: 8_000,
  teardownTimeout: 4_000,
  bail: 1,
  globalSetup: './__tests__/config/globalSetup.ts',
  setupFiles: './__tests__/config/setup.ts',
  restoreMocks: true,
  logHeapUsage: true,
  fileParallelism: true,
  slowTestThreshold: 256,
  pool: 'threads',
  poolOptions: {
    threads: {
      isolate: false,
      useAtomics: true
    }
  },
  maxConcurrency: numOfCores > 1 ? numOfCores - 1 : 1,
  server: {
    sourcemap: 'inline' as const
  },
  // default reporter causes formatting issues with stdout since it contains a
  // progress bar and there are prints to stdout during the rendering. As a result
  // we use the basic reporter when logs are requested
  reporters: withLogs()
    ? ['basic', 'hanging-process']
    : ['default', 'hanging-process']
};

const stressTestConfig: UserConfig = {
  ...defaultTestConfig,
  fileParallelism: false,
  testTimeout: 600_000,
  teardownTimeout: 16_000,
  maxConcurrency: 1
};

/**********************************************************************************/

export default defineConfig({
  test: isStressTest() ? stressTestConfig : defaultTestConfig
});
