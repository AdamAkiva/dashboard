import { randomUUID } from 'node:crypto';

import { createRequest, createResponse } from 'node-mocks-http';
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
import { HttpServer } from '../src/server/index.js';
import { errorHandler } from '../src/server/middleware.js';
import * as services from '../src/services/index.js';
import {
  got,
  type OptionsOfTextResponseBody,
  type UnknownObject
} from '../src/types/index.js';
import { logger, STATUS, VALIDATION } from '../src/utils/index.js';

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
  options: OptionsOfTextResponseBody = {}
) => {
  const res = await got(url, {
    ...options,
    // GOT has retry built in for GET requests, we don't want that for tests
    // in order for the tests to be consistent
    retry: { limit: 0 }, // Force no retries
    timeout: { request: 8_000 }, // millis
    throwHttpErrors: false
  });

  // Used to handle a case of a return value which is non JSON parsable, e.g
  // a native string type
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

export const getExpressMocks = (withLogs = false) => {
  if (!withLogs) {
    const emptyFunction = () => {
      // Disable logs in tests
    };

    vi.spyOn(logger, 'fatal').mockImplementation(emptyFunction);
    vi.spyOn(logger, 'error').mockImplementation(emptyFunction);
    vi.spyOn(logger, 'warn').mockImplementation(emptyFunction);
    vi.spyOn(logger, 'info').mockImplementation(emptyFunction);
    vi.spyOn(logger, 'debug').mockImplementation(emptyFunction);
    vi.spyOn(logger, 'trace').mockImplementation(emptyFunction);
  }

  return {
    req: createRequest({
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
  describe,
  errorHandler,
  expect,
  HttpServer,
  inject,
  it,
  randomUUID,
  services,
  STATUS,
  usersMockData,
  VALIDATION,
  vi
};
