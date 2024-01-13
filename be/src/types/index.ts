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
  type NextFunction,
  type Request,
  type Response
} from 'express';
import got, { type OptionsOfTextResponseBody } from 'got';
import { pinoHttp, type HttpLogger } from 'pino-http';
import postgres from 'postgres';
import { z as Zod } from 'zod';

/**********************************************************************************/

export type Mode = 'development' | 'production' | 'test';

export type LogLevel = 'error' | 'info' | 'warn';

export type UnknownObject = { [key: string]: unknown };

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
  got,
  hostname,
  inArray,
  isNotNull,
  isNull,
  json,
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
  type NextFunction,
  type OptionsOfTextResponseBody,
  type Request,
  type Response,
  type Server
};
