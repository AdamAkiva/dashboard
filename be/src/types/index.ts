import { createServer, type Server } from 'node:http';
import { hostname, machine, platform, release } from 'node:os';
import { pid, version } from 'node:process';
import { URL } from 'node:url';

import compress from 'compression';
import cors from 'cors';
import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  ne,
  notInArray,
  sql,
  SQL
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import express, {
  json,
  Router,
  type Application,
  type Request as ExpressRequest,
  type NextFunction,
  type Response
} from 'express';
import type core from 'express-serve-static-core';
import ky, { type Options as KyOptions } from 'ky';
import { pinoHttp, type HttpLogger } from 'pino-http';
import postgres from 'postgres';
import type qs from 'qs';
import type { JsonObject } from 'swagger-ui-express';
import { z as Zod } from 'zod';

/**********************************************************************************/

export type Mode = 'development' | 'production' | 'test';

export type UnknownObject = { [key: string]: unknown };
export type RequiredFields<T, K extends keyof T> = Required<Pick<T, K>> & T;

export type Request = ExpressRequest<
  core.ParamsDictionary,
  UnknownObject,
  UnknownObject,
  qs.ParsedQs,
  UnknownObject
>;

export type EnvironmentVariables = {
  mode: Mode;
  server: {
    port: string;
    url: string;
    apiRoute: string;
    healthCheckRoute: string;
    allowedOrigins: string[] | string;
  };
  db: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResolvedValue<T> = T extends (...args: any) => any
  ? PromiseFulfilledResult<Awaited<ReturnType<T>>>
  : PromiseFulfilledResult<Awaited<T>>;

/**********************************************************************************/

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  address: string;
  phone: string;
};

/**********************************************************************************/

export {
  and,
  asc,
  compress,
  cors,
  createServer,
  desc,
  drizzle,
  eq,
  express,
  hostname,
  inArray,
  isNotNull,
  isNull,
  json,
  ky,
  machine,
  ne,
  notInArray,
  pid,
  pinoHttp,
  platform,
  postgres,
  release,
  Router,
  SQL,
  sql,
  URL,
  version,
  Zod,
  type Application,
  type HttpLogger,
  type JsonObject,
  type KyOptions,
  type NextFunction,
  type Response,
  type Server
};
