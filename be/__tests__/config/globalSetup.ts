import { DatabaseHandler } from '../../src/db/index.js';
import { HttpServer } from '../../src/server/index.js';
import { EventEmitter, sql } from '../../src/types/index.js';

import { cleanupDatabase, getTestEnv, mockLogger } from './utils.js';

/**********************************************************************************/

// This is not exported by vite package, therefore we defined it
type Provide = { provide: (key: string, value: unknown) => void };

/**********************************************************************************/

export async function setup({ provide }: Provide) {
  EventEmitter.captureRejections = true;

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
    async readyCheck() {
      let notReadyMsg = '';
      try {
        await db
          .getHandler()
          .execute(sql.raw(DatabaseHandler.HEALTH_CHECK_QUERY));
      } catch (err) {
        handler.error(err, 'Database error');
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

  server.listen(serverEnv.port);

  return async function teardown() {
    await cleanupDatabase(db);
    server.close();
  };
}
