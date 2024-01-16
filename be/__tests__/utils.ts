import { randomUUID } from 'node:crypto';

import {
  createRequest,
  createResponse,
  type RequestOptions
} from 'node-mocks-http';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  inject,
  it,
  vi
} from 'vitest';

import usersMockData from './__mocks__/users.json' with { type: 'json' };

import * as controllers from '../src/controllers/index.js';
import * as Middlewares from '../src/server/middleware.js';
import * as services from '../src/services/index.js';
import {
  ky,
  type KyOptions,
  type RequiredFields,
  type UnknownObject,
  type User
} from '../src/types/index.js';
import {
  DashboardError,
  logger,
  STATUS,
  VALIDATION
} from '../src/utils/index.js';

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

export const sendHttpRequest = async <ReturnType = unknown>(
  url: string,
  options: RequiredFields<KyOptions, 'method'> = { method: 'get' }
) => {
  const res = await ky(url, {
    ...options,
    retry: { limit: 0 }, // Force no retries
    timeout: 4_000, // millis
    throwHttpErrors: false
  });

  const contentType = res.headers.get('content-type');
  if (!contentType) {
    return {
      data: '' as ReturnType,
      statusCode: res.status
    };
  }

  if (contentType.includes('application/json')) {
    return {
      data: (await res.json()) as ReturnType,
      statusCode: res.status
    };
  }
  if (contentType.includes('text/html')) {
    return {
      data: (await res.text()) as ReturnType,
      statusCode: res.status
    };
  }

  throw new Error('Unsupported content type');
};

/**********************************************************************************/

export const emptyMockFn = () => {
  // The tests run concurrently, therefore, the mock functions must be a different
  // instance to count their call times/parameters correctly
  return vi.fn(() => {
    // Empty on purpose
  });
};

export const asyncMockFn = <T>(data: T) => {
  return vi.fn(async () => {
    return await Promise.resolve(data);
  });
};

export const getExpressMocks = (
  reqOptions: RequestOptions = {},
  withLogs = false
) => {
  if (!withLogs) {
    vi.spyOn(logger, 'fatal').mockImplementation(emptyMockFn);
    vi.spyOn(logger, 'error').mockImplementation(emptyMockFn);
    vi.spyOn(logger, 'warn').mockImplementation(emptyMockFn);
    vi.spyOn(logger, 'info').mockImplementation(emptyMockFn);
    vi.spyOn(logger, 'debug').mockImplementation(emptyMockFn);
    vi.spyOn(logger, 'trace').mockImplementation(emptyMockFn);
  }

  return {
    req: createRequest({
      ...reqOptions,
      dashboard: {
        logger: logger
      }
    }),
    res: createResponse()
  };
};

/**********************************************************************************/

export {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  controllers,
  createRequest,
  createResponse,
  DashboardError,
  describe,
  expect,
  inject,
  it,
  Middlewares,
  randomUUID,
  services,
  STATUS,
  usersMockData,
  VALIDATION,
  vi,
  type User
};
