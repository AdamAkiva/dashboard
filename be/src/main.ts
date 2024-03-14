import { DatabaseHandler } from './db/index.js';
import { HttpServer } from './server/index.js';
import { EventEmitter, generalDebug, sql } from './types/index.js';
import { Logger, getEnv } from './utils/index.js';

/**********************************************************************************/

async function startServer() {
  generalDebug('Application starting...');
  EventEmitter.captureRejections = true;

  const { mode, server: serverEnv, db: dbUri } = getEnv();

  const logger = new Logger();
  const { handler: loggerHandler, logMiddleware } = logger;

  const db = new DatabaseHandler({
    mode: mode,
    conn: {
      name: `dashboard-pg-${mode}`,
      url: dbUri,
      healthCheckQuery: DatabaseHandler.HEALTH_CHECK_QUERY
    },
    logger: loggerHandler
  });
  const server = new HttpServer({ mode: mode, db: db, logger: loggerHandler });

  // The order matters!
  // These calls setup express middleware, and the configuration middleware
  // must be used BEFORE the routes
  await server.attachConfigurationMiddlewares(serverEnv.allowedOrigins);
  server.attachRoutesMiddlewares({
    allowedHosts: serverEnv.healthCheck.allowedHosts,
    readyCheck: async () => {
      let notReadyMsg = '';
      try {
        await db
          .getHandler()
          .execute(sql.raw(DatabaseHandler.HEALTH_CHECK_QUERY));
      } catch (err) {
        loggerHandler.error(err, 'Database error');
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

  // Attaching the handlers after the server initialization for two reasons.
  // Firstly, if an error occurred before this part, it is 98.7% a developer
  // mistake with the initialization of the server
  // Secondly, this is the first point where there are resources to cleanup
  // if something failed (partially true since the database is ready before
  // the server, but again, that goes more into the first point)
  process
    .on('warning', loggerHandler.warn)
    .once('SIGINT', () => {
      server.close();
    })
    .once('SIGQUIT', () => {
      server.close();
    })
    .once('SIGTERM', () => {
      server.close();
    })
    .once('unhandledRejection', globalErrorHandler(server, 'rejection'))
    .once('uncaughtException', globalErrorHandler(server, 'exception'));

  server.listen(serverEnv.port, () => {
    loggerHandler.info(
      `Server is running in '${mode}' mode on:` +
        ` ${serverEnv.url}:${serverEnv.port}/${serverEnv.apiRoute}`
    );
    generalDebug('Application is ready');
  });
}

function globalErrorHandler(
  server: HttpServer,
  reason: 'exception' | 'rejection'
) {
  return (err: unknown) => {
    console.error(err, `Unhandled ${reason}`);

    server.close();

    // See: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html#error-exception-handling
    process.exit(1);
  };
}

/**********************************************************************************/

await startServer();
