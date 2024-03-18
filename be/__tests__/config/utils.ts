import type { DatabaseHandler } from '../../src/db/index.js';
import type { NextFunction, Request, Response } from '../../src/types/index.js';
import { Logger } from '../../src/utils/index.js';

/**********************************************************************************/

export function withLogs() {
  return process.env.DEBUG && process.env.DEBUG.includes('dashboard:*');
}

export function isStressTest() {
  return !!process.env.STRESS;
}

export async function cleanupDatabase(db: DatabaseHandler) {
  const handler = db.getHandler();
  const models = db.getModels();

  /* eslint-disable drizzle/enforce-delete-with-where */
  await handler.delete(models.user.userInfoModel);
  await handler.delete(models.user.userCredentialsModel);
  await handler.delete(models.user.userSettingsModel);
  /* eslint-enable drizzle/enforce-delete-with-where */
}

export function mockLogger() {
  const logger = new Logger();
  const { logMiddleware, handler } = logger;

  return {
    handler: withLogs()
      ? handler
      : {
          ...handler,
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
    logMiddleware: withLogs()
      ? logMiddleware
      : (_: Request, __: Response, next: NextFunction) => {
          // Disable logging middleware
          next();
        }
  };
}
