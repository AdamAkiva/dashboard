import type { UserConfig } from 'vitest';
import { defineConfig } from 'vitest/config';

/**********************************************************************************/

const defaultConfig: UserConfig = {
  root: './',
  testTimeout: 8_000,
  teardownTimeout: 4_000,
  globalSetup: './__tests__/config/globalSetup.ts',
  restoreMocks: true,
  logHeapUsage: true,
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
  reporters: ['default', 'hanging-process']
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

/**********************************************************************************/

export function isStressTest() {
  return !!process.env.STRESS;
}
