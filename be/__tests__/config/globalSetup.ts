import { DatabaseHandler } from '../../src/db/index.js';
import { HttpServer } from '../../src/server/index.js';
import { EventEmitter, sql } from '../../src/types/index.js';
import { ERR_CODES, logMiddleware, logger } from '../../src/utils/index.js';

/**********************************************************************************/

// This is not exported by vite package, therefore we defined it
type Provide = { provide: (key: string, value: unknown) => void };

/**********************************************************************************/

export async function setup({ provide }: Provide) {
  EventEmitter.captureRejections = true;

  const { mode, server: serverEnv, db: dbUri } = getTestEnv();
  const healthCheckRoute = serverEnv.healthCheck.route;
  const allowedMethods = new Set<string>([
    'HEAD',
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ]);

  provide('urls', {
    baseURL: `${serverEnv.base}:${serverEnv.port}/${serverEnv.apiRoute}`,
    healthCheckURL: `${serverEnv.base}:${serverEnv.port}/${healthCheckRoute}`
  });

  const db = new DatabaseHandler({
    mode: mode,
    conn: {
      name: `dashboard-pg-${mode}`,
      uri: dbUri,
      healthCheckQuery: DatabaseHandler.HEALTH_CHECK_QUERY
    },
    logger: logger
  });

  const server = new HttpServer({
    mode: mode,
    db: db,
    logger: process.env.DEBUG
      ? logger
      : {
          ...logger,
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
        }
  });
  await server.attachMiddlewares(allowedMethods, new Set());
  server.attachRoutes({
    allowedHosts: serverEnv.healthCheck.allowedHosts,
    async readyCheck() {
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
    },
    logMiddleware: process.env.DEBUG
      ? logMiddleware
      : (_, __, next) => {
          // Disable logging middleware
          next();
        },
    routes: {
      api: `/${serverEnv.apiRoute}`,
      health: `/${serverEnv.healthCheck.route}`
    }
  });

  server.listen(serverEnv.port);

  return async function teardown() {
    const handler = db.getHandler();
    const models = db.getModels();

    /* eslint-disable drizzle/enforce-delete-with-where */
    await handler.delete(models.user.userInfoModel);
    await handler.delete(models.user.userCredentialsModel);
    await handler.delete(models.user.userSettingsModel);
    /* eslint-enable drizzle/enforce-delete-with-where */

    server.close();
  };
}

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

  logger.fatal(
    `Missing or invalid 'NODE_ENV' env value, should never happen.` +
      ' Unresolvable, exiting...'
  );

  process.exit(ERR_CODES.EXIT_NO_RESTART);
}

function checkEnvVariables() {
  let missingValues = '';
  new Map([
    ['TEST_SERVER_PORT', `Missing 'TEST_SERVER_PORT' environment variable`],
    ['API_ROUTE', `Missing 'API_ROUTE' environment variable`],
    ['HEALTH_CHECK_ROUTE', `Missing 'HEALTH_CHECK_ROUTE' environment variable`],
    ['ALLOWED_HOSTS', `Missing 'ALLOWED_HOSTS' environment variable`],
    ['DB_TEST_URI', `Missing 'DB_TEST_URI' environment variable`]
  ]).forEach((val, key) => {
    if (!process.env[key]) {
      missingValues += `* ${val}\n`;
    }
  });

  if (missingValues) {
    logger.fatal(`\nMissing the following environment vars:\n${missingValues}`);

    process.exit(ERR_CODES.EXIT_NO_RESTART);
  }
}
