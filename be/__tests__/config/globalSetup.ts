/**
 * Making sure the first thing the global test setup does is changing the
 * captureRejections option to true to account for all new instances of
 * EventEmitter. If every module only exports functions and has no global
 * variables, then, in theory you could do it in a later stage. With that said
 * we don't want to trust the initialization order, so we make sure it is the
 * first thing that is being done When the server runs
 */
import { EventEmitter } from 'node:events';

// See: https://nodejs.org/api/events.html#capture-rejections-of-promises
EventEmitter.captureRejections = true;

/**********************************************************************************/

import { DatabaseHandler } from '../../src/db/index.js';
import { HttpServer } from '../../src/server/index.js';
import {
  sql,
  type NextFunction,
  type Request,
  type Response
} from '../../src/types/index.js';
import {
  ERR_CODES,
  Logger,
  debugEnabled,
  isTestMode
} from '../../src/utils/index.js';

/**********************************************************************************/

// A type for provide is not exported by vite package, therefore we defined it
type Provide = { provide: (key: string, value: unknown) => void };

/**********************************************************************************/

export async function setup({ provide }: Provide) {
  const { mode, server: serverEnv, db: dbUrl } = getTestEnv();
  const { logMiddleware, handler } = mockLogger();

  provide('mode', 'test');
  provide('urls', {
    baseURL: `${serverEnv.base}:${serverEnv.port}/${serverEnv.apiRoute}`,
    healthCheckURL: `${serverEnv.base}:${serverEnv.port}/${serverEnv.healthCheck.route}`
  });
  provide('db', {
    name: `dashboard-pg-${mode}`,
    url: dbUrl
  });

  const db = new DatabaseHandler({
    mode: mode,
    conn: {
      name: `dashboard-pg-${mode}`,
      url: dbUrl,
      healthCheckQuery: DatabaseHandler.HEALTH_CHECK_QUERY
    },
    logger: handler
  });

  const server = new HttpServer({
    mode: mode,
    db: db,
    logger: handler
  });

  // The order matters!
  // These calls setup express middleware, and the configuration middleware
  // must be used BEFORE the routes
  await server.attachConfigurationMiddlewares();
  server.attachRoutesMiddlewares({
    allowedHosts: serverEnv.healthCheck.allowedHosts,
    readyCheck: readyCheckCallback(db, handler),
    logMiddleware: logMiddleware,
    routes: {
      api: `/${serverEnv.apiRoute}`,
      health: `/${serverEnv.healthCheck.route}`
    }
  });

  server.listen(serverEnv.port);

  return async function teardown() {
    await databaseTeardown(db);
    server.close();
  };
}

export function mockLogger() {
  const logger = new Logger();
  const { handler: loggerHandler, logMiddleware } = logger;

  function disableLog() {
    // Disable logs
  }

  return {
    handler: debugEnabled()
      ? loggerHandler
      : {
          ...loggerHandler,
          debug: disableLog,
          trace: disableLog,
          info: disableLog,
          warn: disableLog,
          error: disableLog,
          fatal: disableLog
        },
    logMiddleware: debugEnabled()
      ? logMiddleware
      : (_req: Request, _res: Response, next: NextFunction) => {
          // Disable logging middleware
          next();
        }
  };
}

export function withLogs() {
  return process.env.DEBUG && process.env.DEBUG.includes('dashboard:*');
}

export function isStressTest() {
  return !!process.env.STRESS;
}

/**********************************************************************************/

function getTestEnv() {
  const mode = process.env.NODE_ENV;
  checkRuntimeEnv(mode);
  checkEnvVariables();

  return {
    mode: process.env.NODE_ENV as 'test',
    server: {
      base: 'http://localhost',
      port: process.env.TEST_SERVER_PORT!,
      apiRoute: process.env.API_ROUTE!,
      healthCheck: {
        route: process.env.HEALTH_CHECK_ROUTE!,
        allowedHosts: new Set(process.env.ALLOWED_HOSTS!.split(','))
      }
    },
    db: process.env.DB_TEST_URI!
  };
}

function checkRuntimeEnv(mode?: string): mode is 'test' {
  if (isTestMode(mode)) {
    return true;
  }

  console.error(
    `Missing or invalid 'NODE_ENV' env value, should never happen.` +
      ' Unresolvable, exiting...'
  );

  process.exit(ERR_CODES.EXIT_NO_RESTART);
}

function checkEnvVariables() {
  let missingValues = '';
  [
    'TEST_SERVER_PORT',
    'API_ROUTE',
    'HEALTH_CHECK_ROUTE',
    'ALLOWED_HOSTS',
    'DB_TEST_URI'
  ].forEach((val) => {
    if (!process.env[val]) {
      missingValues += `* Missing ${val} environment variable\n`;
    }
  });
  if (missingValues) {
    console.error(
      `\nMissing the following environment vars:\n${missingValues}`
    );

    process.exit(ERR_CODES.EXIT_NO_RESTART);
  }
}

function readyCheckCallback(db: DatabaseHandler, logger: Logger['handler']) {
  return async function readyCheck() {
    let notReadyMsg = '';
    try {
      await db
        .getHandler()
        .execute(sql.raw(DatabaseHandler.HEALTH_CHECK_QUERY));
    } catch (err) {
      logger.error(err, 'Database error');
      notReadyMsg += '\nDatabase is unavailable';
    }

    return notReadyMsg;
  };
}

async function databaseTeardown(db: DatabaseHandler) {
  const handler = db.getHandler();
  const {
    user: { userInfoModel, userCredentialsModel, userSettingsModel }
  } = db.getModels();

  /* eslint-disable @drizzle/enforce-delete-with-where */
  await handler.delete(userInfoModel);
  await handler.delete(userCredentialsModel);
  await handler.delete(userSettingsModel);
  /* eslint-enable @drizzle/enforce-delete-with-where */
}
