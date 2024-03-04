import type { DatabaseHandler } from '../../src/db/index.js';
import type { NextFunction, Request, Response } from '../../src/types/index.js';
import { logMiddleware, logger } from '../../src/utils/index.js';

/**********************************************************************************/

export function withLogs() {
  return process.env.DEBUG === 'dashboard:*';
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

export function mockLogs() {
  return {
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
        },
    logMiddleware: process.env.DEBUG
      ? logMiddleware
      : (_: Request, __: Response, next: NextFunction) => {
          // Disable logging middleware
          next();
        }
  };
}
