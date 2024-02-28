import { randomUUID } from 'node:crypto';

import autocannon from 'autocannon';
import ky, { type Options as KyOptions } from 'ky';
import {
  createRequest,
  createResponse,
  type RequestOptions,
  type ResponseOptions
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

import { VALIDATION } from '../src/entities/utils/index.js';
import * as Middlewares from '../src/server/middleware.js';
import type {
  AddRequired,
  Request,
  Response,
  UnknownObject
} from '../src/types/index.js';
import { DashboardError, StatusCodes } from '../src/utils/index.js';
import type { CreateUser, UpdateUser, User } from './config/api.js';

/**********************************************************************************/

type HttpOptions = Omit<KyOptions, 'method'> & {
  method: 'delete' | 'get' | 'head' | 'patch' | 'post' | 'put';
};

type StressTestOptions = AddRequired<Omit<autocannon.Options, 'url'>, 'method'>;

/***************************** General utils **************************************/
/**********************************************************************************/

export function omit<T extends {}, K extends string & keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  const cpy = { ...obj };
  for (const key of keys) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete cpy[key];
  }

  return cpy as Omit<T, K>;
}

export function checkMatchIgnoringOrder(
  partialValues: unknown[],
  results: unknown[]
) {
  for (const partialValue of partialValues) {
    expect(results).toEqual(
      expect.arrayContaining([
        recursivelyCheckFields(partialValue as UnknownObject)
      ])
    );
  }
}

function recursivelyCheckFields(obj: UnknownObject): unknown {
  if (typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return expect.arrayContaining(obj.map(recursivelyCheckFields));
  }

  const result: UnknownObject = {};
  for (const key in obj) {
    result[key] = recursivelyCheckFields(obj[key] as UnknownObject);
  }

  return expect.objectContaining(result);
}

/******************************** Routes ******************************************/
/**********************************************************************************/

const { baseURL, healthCheckURL } = inject('urls');

export const userURL = `${baseURL}/users`;

/******************************* API calls ****************************************/
/**********************************************************************************/

export async function sendHttpRequest<ReturnType = unknown>(
  url: string,
  options: HttpOptions
) {
  const res = await ky(url, {
    ...options,
    // Force no retries, if it fails it should since the tests probably check
    // for failure
    retry: { limit: 0 },
    timeout: 16_000, // millis
    throwHttpErrors: false
  });

  const contentType = res.headers.get('content-type');
  if (!contentType) {
    return {
      data: '' as ReturnType,
      statusCode: res.status
    };
  }

  // A special case may happen if the response body is too large.
  // Currently it is unclear to me whether the issue lays with the library or
  // other limitations, but the end result is that parsing the result with
  // json fails. As a result this is the way we chose to implement things

  // Fetch API can only parse the response once, afterwards any additional attempts
  // fail. That's the reason for this structure of conditionals
  const data = await res.text();
  const reqSize = Buffer.byteLength(data);
  // If the request is too large to be parsed, just return it's size in bytes
  if (reqSize >= 1_048_576) {
    return {
      data: reqSize as ReturnType,
      statusCode: res.status
    };
  }

  if (contentType.includes('application/json')) {
    return {
      data: JSON.parse(data) as ReturnType,
      statusCode: res.status
    };
  }
  if (contentType.includes('text/html')) {
    return {
      data: data as ReturnType,
      statusCode: res.status
    };
  }

  throw new Error('Unsupported content type');
}

export function createHttpMocks(
  reqOptions?: RequestOptions,
  resOptions?: ResponseOptions
) {
  return {
    request: createRequest<Request>(reqOptions),
    response: createResponse<Response>(resOptions)
  };
}

export async function stressTest(url: string, options: StressTestOptions) {
  return await new Promise<autocannon.Result>((resolve, reject) => {
    // Pay attention when changing these value.
    // The tcp sockets are reused by autocannon which may cause an infinite
    // timeout, if not configured correctly. Match these values to the
    // `maxRequestsPerSocket` config of the http server
    autocannon(
      {
        url: url,
        ...options,
        connections: 2_048,
        amount: 65_536
      },
      (err, res) => {
        if (err) {
          reject(err);
        }

        expect(res.errors).toBe(0);
        expect(res.timeouts).toBe(0);
        expect(res.mismatches).toBe(0);
        expect(res.non2xx).toBe(0);
        expect(res.resets).toBe(0);

        resolve(res);
      }
    );
  });
}

export async function createUsers(usersData: CreateUser[]) {
  // Don't use Promise.all(), the order needs to be kept the same as the client
  // requested it for the tests to be consistent
  const users: User[] = [];
  for (const userData of usersData) {
    // On purpose
    // eslint-disable-next-line no-await-in-loop
    const { data, statusCode } = await sendHttpRequest<User[]>(userURL, {
      method: 'post',
      json: userData
    });
    expect(statusCode).toBe(StatusCodes.CREATED);

    users.push(...data);
  }

  return users;
}

/**********************************************************************************/

export {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  DashboardError,
  describe,
  expect,
  healthCheckURL,
  it,
  Middlewares,
  randomUUID,
  StatusCodes,
  VALIDATION,
  vi,
  type CreateUser,
  type UpdateUser,
  type User
};
