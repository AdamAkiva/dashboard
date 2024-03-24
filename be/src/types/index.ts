import { randomUUID } from 'node:crypto';
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
  Router,
  json,
  type Application,
  type NextFunction,
  type Request
} from 'express';
import helmet from 'helmet';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { pinoHttp, type HttpLogger } from 'pino-http';
import pg from 'postgres';
import { z as Zod } from 'zod';

import type {
  CreatedUser,
  DeletedUser,
  ReactivatedUser,
  UpdatedUser,
  UpdatedUserSettings,
  User,
  Users
} from './api.js';
import type {
  AddOptional,
  AddRequired,
  ArrayWithAtLeastOneValue,
  EnvironmentVariables,
  MaybeArray,
  Mode,
  RequestContext,
  ResolvedValue,
  Response,
  SwapKeysValue,
  UnknownObject
} from './types.js';

/**********************************************************************************/

export const generalDebug = Debug('dashboard:general');
export const userDebug = Debug('dashboard:user');

/**********************************************************************************/

export {
  Debug,
  Router,
  URL,
  Zod,
  and,
  compress,
  cors,
  createServer,
  drizzle,
  eq,
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
  sql,
  type AddOptional,
  type AddRequired,
  type Application,
  type ArrayWithAtLeastOneValue,
  type CreatedUser,
  type DeletedUser,
  type DrizzleLogger,
  type EnvironmentVariables,
  type HttpLogger,
  type IncomingHttpHeaders,
  type MaybeArray,
  type Mode,
  type NextFunction,
  type ReactivatedUser,
  type Request,
  type RequestContext,
  type ResolvedValue,
  type Response,
  type SQL,
  type Server,
  type SwapKeysValue,
  type UnknownObject,
  type UpdatedUser,
  type UpdatedUserSettings,
  type User,
  type Users
};
