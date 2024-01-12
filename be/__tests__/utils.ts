import { randomUUID } from 'node:crypto';

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  inject,
  it
} from 'vitest';

import { HttpServer } from '../src/server/index.js';
import { got, type OptionsOfTextResponseBody } from '../src/types/index.js';
import { STATUS, VALIDATION } from '../src/utils/index.js';

/**********************************************************************************/

type UnknownObject = { [key: string]: unknown };

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

/**********************************************************************************/

export {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  HttpServer,
  inject,
  it,
  randomUUID,
  STATUS,
  VALIDATION
};
