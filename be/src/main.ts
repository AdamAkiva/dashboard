/**
 * DON'T change the import to the local one, this needs to happen before everything.
 * This makes sure the first thing the code does is changing the captureRejections
 * option to true to account for all new instances of EventEmitter. If every
 * module only exports functions and has no global variables, then, in theory
 * you could do it in a later stage. With that said we don't want to trust the
 * initialization order, so we make sure it is the first thing that is being done
 * When the server runs
 */
//
import { EventEmitter } from 'node:events';

// See: https://nodejs.org/api/events.html#capture-rejections-of-promises
EventEmitter.captureRejections = true;

/**********************************************************************************/

import { DatabaseHandler } from './db/index.js';
import { HttpServer } from './server/index.js';
import { generalDebug, sql } from './types/index.js';
import { Logger, getEnv } from './utils/index.js';

/**********************************************************************************/

async function startServer() {
  generalDebug('Application starting...');

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
    // The reason for it being a callback it the ability to unit test it
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

  // Attaching the event handlers after the server initialization for two reasons.
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
