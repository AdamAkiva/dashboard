import type { Config } from 'jest';

/**********************************************************************************/

export default {
  testEnvironment: 'node',
  rootDir: '../',
  testTimeout: 16_000,
  workerIdleMemoryLimit: 0.33,
  collectCoverage: true,
  collectCoverageFrom: ['./__tests__/**/*.ts', './src/**/*.ts'],
  coverageProvider: 'v8',
  coverageReporters: ['html', 'text', 'text-summary', 'cobertura'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './coverage', outputName: 'junit.xml' }]
  ],
  verbose: true,
  testMatch: ['**/__tests__/**/*.test.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  setupFilesAfterEnv: ['./__tests__/setup.ts'],
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  transform: { '^.+\\.ts$': '@swc/jest' }
} satisfies Config;
