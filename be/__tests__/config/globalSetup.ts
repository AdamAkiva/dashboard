import { DatabaseHandler } from '../../src/db/index.js';
import { HttpServer } from '../../src/server/index.js';
import { EventEmitter, sql } from '../../src/types/index.js';
import { logger } from '../../src/utils/index.js';

import { getTestEnv, mockLogs, type Provide } from './utils.js';

/**********************************************************************************/

export async function setup({ provide }: Provide) {
  EventEmitter.captureRejections = true;

  const { mode, server: serverEnv, db: dbUri } = getTestEnv();
  const loggingMocks = mockLogs();

  provide('urls', {
    baseURL: `${serverEnv.base}:${serverEnv.port}/${serverEnv.apiRoute}`,
    healthCheckURL: `${serverEnv.base}:${serverEnv.port}/${serverEnv.healthCheck.route}`
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
    logger: loggingMocks.logger
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
        logger.error(err, 'Database error');
        notReadyMsg += '\nDatabase is unavailable';
      }

      return notReadyMsg;
    },
    logMiddleware: loggingMocks.logMiddleware,
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
