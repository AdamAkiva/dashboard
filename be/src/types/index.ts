import { createServer, type Server } from 'node:http';
import { relative } from 'node:path';
import { URL } from 'node:url';
import utils from 'node:util';

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
  Router,
  type Application,
  type NextFunction,
  type Request,
  type Response
} from 'express';
import got, { type OptionsOfTextResponseBody } from 'got';
import postgres from 'postgres';
import { z as Zod } from 'zod';

/**********************************************************************************/

export type Mode = 'development' | 'production' | 'test';

export type LogLevel = 'error' | 'info' | 'warn';

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
  inArray,
  isNotNull,
  isNull,
  ne,
  notInArray,
  postgres,
  relative,
  Router,
  SQL,
  sql,
  URL,
  utils,
  Zod,
  type Application,
  type NextFunction,
  type OptionsOfTextResponseBody,
  type Request,
  type Response,
  type Server
};
