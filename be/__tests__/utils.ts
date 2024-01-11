import { randomUUID } from 'node:crypto';

import { beforeEach, describe, expect, it } from '@jest/globals';

import { HttpServer } from '../src/server/index.js';
import { got, type OptionsOfTextResponseBody } from '../src/types/index.js';
import { Logger, STATUS, VALIDATION } from '../src/utils/index.js';

/**********************************************************************************/

type UnknownObject = { [key: string]: unknown };

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

export const omit = <T extends UnknownObject, K extends string & keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> => {
  const cpy = { ...obj };
  for (const key of keys) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete cpy[key];
  }

  return cpy as Omit<T, K>;
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

export const cleanupDatabase = async (server: HttpServer) => {
  const { getHandler, getModels } = server.getDatabase();
  const handler = getHandler();
  const models = getModels();

  /* eslint-disable drizzle/enforce-delete-with-where */
  await handler.delete(models.userModel);
  /* eslint-enable drizzle/enforce-delete-with-where */
};

export const sendHttpRequest = async <ReturnType = unknown>(
  url: string,
  options: OptionsOfTextResponseBody = {}
) => {
  const res = await got(url, {
    ...options,
    // GOT has retry built in for GET requests, we don't want that for tests
    // in order for the tests to be consistent
    retry: { limit: 0 }, // Force no retries
    timeout: { request: 16_000 }, // millis
    throwHttpErrors: false
  });

  // Used to handle a case of a return value which is non JSON parsable, e.g
  // a string
  try {
    return {
      data: JSON.parse(res.body) as ReturnType,
      statusCode: res.statusCode
    };
  } catch (err) {
    return {
      data: res.body as ReturnType,
      statusCode: res.statusCode
    };
  }
};

/**********************************************************************************/

const { server: serverEnv } = getTestEnv();

export const baseURL = `${serverEnv.base}:${serverEnv.port}/${serverEnv.apiRoute}`;
export const healthCheckURL = `${serverEnv.base}:${serverEnv.port}/health`;

/**********************************************************************************/

export {
  beforeEach,
  describe,
  expect,
  HttpServer,
  it,
  randomUUID,
  STATUS,
  VALIDATION
};
