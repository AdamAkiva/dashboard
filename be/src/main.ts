import { DatabaseHandler } from './db/index.js';
import { HttpServer } from './server/index.js';
import { EventEmitter, sql } from './types/index.js';
import { getEnv, logMiddleware, logger } from './utils/index.js';

/**********************************************************************************/

async function startServer() {
  EventEmitter.captureRejections = true;

  const { mode, server: serverEnv, db: dbUri } = getEnv();
  const allowedMethods = new Set<string>([
    'HEAD',
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ]);

  const db = new DatabaseHandler({
    mode: mode,
    conn: {
      name: `dashboard-pg-${mode}`,
      uri: dbUri,
      healthCheckQuery: DatabaseHandler.HEALTH_CHECK_QUERY
    },
    logger: logger
  });
  const server = new HttpServer({ mode: mode, db: db, logger: logger });

  await server.attachMiddlewares(allowedMethods, serverEnv.allowedOrigins);
  server.attachRoutes({
    allowedHosts: serverEnv.healthCheck.allowedHosts,
    readyCheck: async () => {
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
    logMiddleware: logMiddleware,
    routes: {
      api: `/${serverEnv.apiRoute}`,
      health: `/${serverEnv.healthCheck.route}`
    }
  });

  process
    .on('warning', (err) => {
      logger.warn(err, 'Warn');
    })
    .once('SIGINT', () => {
      server.close();
    })
    .once('SIGTERM', () => {
      server.close();
    })
    .once('unhandledRejection', globalErrorHandler(server, 'rejection'))
    .once('uncaughtException', globalErrorHandler(server, 'exception'));

  server.listen(serverEnv.port, () => {
    logger.info(
      `Server is running in '${mode}' mode on:` +
        ` ${serverEnv.url}:${serverEnv.port}/${serverEnv.apiRoute}`
    );
  });
}

function globalErrorHandler(
  server: HttpServer,
  reason: 'exception' | 'rejection'
) {
  return (err: unknown) => {
    logger.fatal(err, `Unhandled ${reason}`);

    server.close();

    // See: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html#error-exception-handling
    process.exitCode = 1;
  };
}

/**********************************************************************************/

await startServer();
