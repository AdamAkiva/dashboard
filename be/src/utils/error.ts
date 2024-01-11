import type { LogLevel } from '../types/index.js';

import { STATUS } from './constants.js';
import Logger from './logger.js';

/**********************************************************************************/

export default class DashboardError extends Error {
  private readonly _usrMsg;
  private readonly _statusCode;

  private constructor(params: {
    statusCode: number;
    usrMsg: string;
    logData: {
      moduleMetaData: string;
      callerName: string;
      logLevel: LogLevel;
      logMsg: string;
      logger: Logger;
      err?: Error;
    };
  }) {
    const {
      statusCode,
      usrMsg,
      logData: { moduleMetaData, callerName, logLevel, logMsg, logger, err }
    } = params;

    super(usrMsg);

    this.name = this.constructor.name;
    this._usrMsg = usrMsg;
    this._statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);

    let log = `${Logger.getErrorLocation(
      moduleMetaData,
      callerName
    )} - ${logMsg} (Status code: ${statusCode})`;
    if (err) {
      log += `.\nThis may help: ${err.stack ? err.stack : err.message}`;
    }

    logger[logLevel](log);
  }

  public readonly getStatusCode = () => {
    return this._statusCode;
  };

  public readonly getUsrMsg = () => {
    return this._usrMsg;
  };

  /********************************************************************************/

  public static readonly buildError = (params: {
    err?: unknown;
    statusCode: number;
    usrMsg: string;
    logData: {
      moduleMetaData: string;
      callerName: string;
      logLevel: LogLevel;
      logMsg: string;
    };
    logger: Logger;
  }) => {
    const {
      err,
      statusCode,
      usrMsg,
      logData: { moduleMetaData, callerName, logLevel, logMsg },
      logger
    } = params;

    const notAnErrorObjectWasThrown = err && !(err instanceof Error);
    if (notAnErrorObjectWasThrown) {
      return new DashboardError({
        statusCode: STATUS.SERVER_ERROR.CODE,
        usrMsg: 'Unexpected error, please try again',
        logData: {
          moduleMetaData: moduleMetaData,
          callerName: callerName,
          logLevel: 'error',
          logMsg: 'Thrown a non-error object.',
          logger: logger
        }
      });
    }

    const generalError =
      typeof err === 'undefined' ||
      (err instanceof Error && !(err instanceof DashboardError));
    if (generalError) {
      return new DashboardError({
        statusCode: statusCode,
        usrMsg: usrMsg,
        logData: {
          moduleMetaData: moduleMetaData,
          callerName: callerName,
          logLevel: logLevel,
          logMsg: logMsg,
          logger: logger,
          err: err
        }
      });
    }

    return err as DashboardError;
  };
}
