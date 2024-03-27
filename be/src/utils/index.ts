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
  json,
  Router,
  type Application,
  type NextFunction,
  type Request
} from 'express';
import helmet from 'helmet';
import { isValidPhoneNumber } from 'libphonenumber-js';
import pg from 'postgres';
import { z as Zod } from 'zod';

import { getEnv } from './config.js';
import { ERR_CODES, StatusCodes } from './constants.js';
import DashboardError from './error.js';
import {
  debugEnabled,
  isDevelopmentMode,
  isProductionMode,
  isTestMode,
  objHasValues,
  strcasecmp
} from './functions.js';
import Logger from './logger.js';
import type {
  AddOptional,
  AddRequired,
  ArrayWithAtLeastOneValue,
  CreatedUser,
  DeletedUser,
  EnvironmentVariables,
  MaybeArray,
  Mode,
  ReactivatedUser,
  RequestContext,
  ResolvedValue,
  Response,
  SwapKeysValue,
  UnknownObject,
  UpdatedUser,
  UpdatedUserSettings,
  User,
  Users
} from './types/index.js';

/**********************************************************************************/

export const generalDebug = Debug('dashboard:general');
export const userDebug = Debug('dashboard:user');

/**********************************************************************************/

export {
  and,
  compress,
  cors,
  createServer,
  DashboardError,
  Debug,
  debugEnabled,
  drizzle,
  eq,
  ERR_CODES,
  express,
  getEnv,
  helmet,
  inArray,
  isDevelopmentMode,
  isNotNull,
  isNull,
  isProductionMode,
  isTestMode,
  isValidPhoneNumber,
  json,
  Logger,
  objHasValues,
  pg,
  pid,
  randomUUID,
  relative,
  resolve,
  Router,
  sql,
  StatusCodes,
  strcasecmp,
  URL,
  Zod,
  type AddOptional,
  type AddRequired,
  type Application,
  type ArrayWithAtLeastOneValue,
  type CreatedUser,
  type DeletedUser,
  type DrizzleLogger,
  type EnvironmentVariables,
  type IncomingHttpHeaders,
  type MaybeArray,
  type Mode,
  type NextFunction,
  type ReactivatedUser,
  type Request,
  type RequestContext,
  type ResolvedValue,
  type Response,
  type Server,
  type SQL,
  type SwapKeysValue,
  type UnknownObject,
  type UpdatedUser,
  type UpdatedUserSettings,
  type User,
  type Users
};
