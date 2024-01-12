/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpServer } from '../../src/server/index.js';
import { Logger } from '../../src/utils/index.js';

/**********************************************************************************/

export let server: HttpServer | undefined = undefined;

type TestEnv = {
  mode: 'test';
  server: {
    base: 'http://localhost';
    port: string;
    apiRoute: string;
    healthCheckRoute: string;
  };
  db: string;
};

/**********************************************************************************/

let teardownHappened = false;

export const setup = async ({ provide }: any) => {
  const { mode, server: serverEnv, db: dbUri } = getTestEnv();

  provide('urls', {
    baseURL: `${serverEnv.base}:${serverEnv.port}/${serverEnv.apiRoute}`,
    healthCheckURL: `${serverEnv.base}:${serverEnv.port}/${serverEnv.healthCheckRoute}`
  });

  server = await HttpServer.create({
    mode: mode,
    dbData: { name: 'dashboard-pg-test', uri: dbUri },
    routes: {
      api: `/${serverEnv.apiRoute}`,
      health: `/${serverEnv.healthCheckRoute}`
    },
    allowedOrigins: []
  });

  server.listen(serverEnv.port);
};

export const teardown = async () => {
  if (!server) {
    throw new Error('Server is not defined');
  }
  if (teardownHappened) {
    throw new Error('Teardown already occurred');
  }
  teardownHappened = true;

  const { getHandler, getModels } = server.getDatabase();
  const handler = getHandler();
  const models = getModels();

  /* eslint-disable drizzle/enforce-delete-with-where */
  await handler.delete(models.userModel);
  /* eslint-enable drizzle/enforce-delete-with-where */

  server.close();
};

/**********************************************************************************/

let env: TestEnv | undefined = undefined;
export const getTestEnv = () => {
  if (env) {
    return env;
  }

  const mode = process.env.NODE_ENV;
  checkRuntimeEnv(mode);
  checkEnvVariables();

  env = {
    mode: process.env.NODE_ENV as 'test',
    server: {
      base: 'http://localhost',
      port: process.env.TEST_SERVER_PORT!,
      apiRoute: process.env.API_ROUTE!,
      healthCheckRoute: process.env.HEALTH_CHECK_ROUTE!
    },
    db: process.env.DB_TEST_URI!
  };

  return env;
};

const checkRuntimeEnv = (mode?: string | undefined): mode is 'test' => {
  if (mode && mode === 'test') {
    return true;
  }

  Logger.nativeLog(
    'error',
    `Missing/Invalid 'NODE_ENV' value, are you sure you run the correct script?`
  );

  process.kill(process.pid, 'SIGTERM');
  throw new Error('Graceful shutdown');
};

const checkEnvVariables = () => {
  let missingValues = '';
  checkMissingEnvVariables().forEach((val, key) => {
    if (!process.env[key]) {
      missingValues += `* ${val}\n`;
    }
  });

  if (missingValues) {
    Logger.nativeLog('error', `\n${missingValues}`);

    process.kill(process.pid, 'SIGTERM');
    throw new Error('Graceful shutdown');
  }
};

const checkMissingEnvVariables = () => {
  return new Map<string, string>([
    ['TEST_SERVER_PORT', `Missing 'TEST_SERVER_PORT', env variable`],
    ['API_ROUTE', `Missing 'API_ROUTE', env variable`],
    ['HEALTH_CHECK_ROUTE', `Missing 'HEALTH_CHECK_ROUTE', env variable`],
    ['DB_TEST_URI', `Missing 'DB_TEST_URI', env variable`]
  ]);
};
