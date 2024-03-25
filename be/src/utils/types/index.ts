import type { Response as ExpressResponse } from 'express';

import type { DatabaseHandler } from '../../db/index.js';
import type Logger from '../logger.js';

import type {
  CreatedUser,
  DeletedUser,
  ReactivatedUser,
  UpdatedUser,
  UpdatedUserSettings,
  User,
  Users
} from './api.js';

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

export type Response = ExpressResponse<unknown, { ctx: RequestContext }>;
export type RequestContext = {
  db: DatabaseHandler;
  logger: Logger['handler'];
};

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

/**********************************************************************************/

export {
  type CreatedUser,
  type DeletedUser,
  type ReactivatedUser,
  type UpdatedUser,
  type UpdatedUserSettings,
  type User,
  type Users
};
