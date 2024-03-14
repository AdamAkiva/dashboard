import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { createServer, type IncomingHttpHeaders, type Server } from 'node:http';
import { relative, resolve } from 'node:path';
import { pid } from 'node:process';
import { URL } from 'node:url';

import compress from 'compression';
import cors from 'cors';
import Debug from 'debug';
import {
  and,
  eq,
  inArray,
  isNotNull,
  isNull,
  sql,
  type Logger as DrizzleLogger,
  type SQL
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import express, {
  json,
  Router,
  type Application,
  type Response as ExpressResponse,
  type NextFunction,
  type Request
} from 'express';
import helmet from 'helmet';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { pinoHttp, type HttpLogger } from 'pino-http';
import pg from 'postgres';
import { z as Zod } from 'zod';

import type { DatabaseHandler, DBPreparedQueries } from '../db/index.js';
import type { Logger } from '../utils/index.js';

import type { CreateUser, UpdateUser, User } from './api.js';

/******************************** General *****************************************/
/**********************************************************************************/

export type UnknownObject = { [key: string]: unknown };
export type MaybeArray<T = unknown> = T | T[];
export type ArrayWithAtLeastOneValue<T = unknown> = [T, ...T[]];

export type AddRequired<T, K extends keyof T> = Required<Pick<T, K>> & T;
export type AddOptional<T, K extends keyof T> = Omit<T, K> &
  Pick<Partial<T>, K>;
export type SwapKeysValue<T, K extends keyof T, V> = Omit<T, K> & {
  [P in K]: V;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResolvedValue<T = any> = T extends (...args: any) => any
  ? PromiseFulfilledResult<Awaited<ReturnType<T>>>
  : PromiseFulfilledResult<Awaited<T>>;

/**************************** Package related *************************************/
/**********************************************************************************/

export const generalDebug = Debug('dashboard:general');
export const userDebug = Debug('dashboard:user');

export type Response = ExpressResponse<unknown, { ctx: RequestContext }>;

/********************************** HTTP ******************************************/
/**********************************************************************************/

export type Mode = 'development' | 'production' | 'test';
export type EnvironmentVariables = {
  mode: Mode;
  server: {
    port: string;
    url: string;
    apiRoute: string;
    healthCheck: { route: string; allowedHosts: Set<string> };
    allowedOrigins: Set<string>;
  };
  db: string;
};
export type RequestContext = {
  db: DatabaseHandler;
  preparedQueries: DBPreparedQueries;
  logger: Logger['handler'];
};

/**********************************************************************************/

export {
  and,
  compress,
  cors,
  createServer,
  Debug,
  drizzle,
  eq,
  EventEmitter,
  express,
  helmet,
  inArray,
  isNotNull,
  isNull,
  isValidPhoneNumber,
  json,
  pg,
  pid,
  pinoHttp,
  randomUUID,
  relative,
  resolve,
  Router,
  sql,
  URL,
  Zod,
  type Application,
  type CreateUser,
  type DrizzleLogger,
  type HttpLogger,
  type IncomingHttpHeaders,
  type NextFunction,
  type Request,
  type Server,
  type SQL,
  type UpdateUser,
  type User
};
