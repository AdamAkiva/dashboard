import type { DatabaseHandler } from '../../src/db/index.js';
import type { NextFunction, Request, Response } from '../../src/types/index.js';
import { Logger, debugEnabled } from '../../src/utils/index.js';

/**********************************************************************************/

export function withLogs() {
  return process.env.DEBUG === 'dashboard:*';
}

export function isStressTest() {
  return !!process.env.STRESS;
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

export function mockLogger() {
  const logger = new Logger();
  const { handler: loggerHandler, logMiddleware } = logger;

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
      : (_: Request, __: Response, next: NextFunction) => {
          // Disable logging middleware
          next();
        }
  };
}

/**********************************************************************************/

function disableLog() {
  // Disable logs
}
