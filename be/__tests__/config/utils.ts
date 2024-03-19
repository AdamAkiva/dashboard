import { DatabaseHandler } from '../../src/db/index.js';
import type { NextFunction, Request, Response } from '../../src/types/index.js';
import { ERR_CODES, Logger, debugEnabled } from '../../src/utils/index.js';

/**********************************************************************************/

export function getTestEnv() {
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

function checkRuntimeEnv(mode?: string | undefined): mode is 'test' {
  if (mode && mode === 'test') {
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

/**********************************************************************************/

export function withLogs() {
  return process.env.DEBUG && process.env.DEBUG.includes('dashboard:*');
}

export function isStressTest() {
  return !!process.env.STRESS;
}

/**********************************************************************************/

export function databaseSetup() {
  const { mode, db: dbUrl } = getTestEnv();

  return new DatabaseHandler({
    mode: mode,
    conn: {
      name: `dashboard-pg-${mode}`,
      url: dbUrl,
      healthCheckQuery: DatabaseHandler.HEALTH_CHECK_QUERY
    },
    logger: mockLogger().handler
  });
}

export async function databaseTeardown(db: DatabaseHandler) {
  await cleanupDatabase(db);
  await db.close();
}

export async function cleanupDatabase(db: DatabaseHandler) {
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

/**********************************************************************************/

export function mockLogger() {
  const logger = new Logger();
  const { handler: loggerHandler, logMiddleware } = logger;

  return {
    handler: debugEnabled()
      ? loggerHandler
      : {
          ...loggerHandler,
          debug: () => {
            // Disable logs
          },
          trace: () => {
            // Disable logs
          },
          info: () => {
            // Disable logs
          },
          warn: () => {
            // Disable logs
          }
        },
    logMiddleware: debugEnabled()
      ? logMiddleware
      : (_: Request, __: Response, next: NextFunction) => {
          // Disable logging middleware
          next();
        }
  };
}
