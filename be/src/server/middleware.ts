import type { DatabaseHandler } from '../db/index.js';
import type { NextFunction, Request, Response } from '../types/index.js';
import {
  DashboardError,
  STATUS,
  logMiddleware,
  strcasecmp
} from '../utils/index.js';

/**********************************************************************************/

export const checkMethod = (allowedMethods: Set<string>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const reqMethod = req.method.toUpperCase();

    if (!allowedMethods.has(reqMethod)) {
      return res.status(STATUS.NOT_ALLOWED.CODE).json(STATUS.NOT_ALLOWED.MSG);
    }

    return next();
  };
};

export const healthCheck = (isReadyCallback: () => Promise<string>) => {
  return async (req: Request, res: Response) => {
    if (strcasecmp(req.method, 'GET')) {
      return res
        .status(STATUS.BAD_REQUEST.CODE)
        .json(`Health check must be a 'GET' request`);
    }

    // TODO Add the hostname for every allowed server when it is ready
    // (e.g NGINX, ingress, Apache, etc...)
    const allowedHosts = new Set<string>(['localhost']);
    if (!allowedHosts.has(req.hostname)) {
      return res.status(STATUS.FORBIDDEN.CODE).json(STATUS.FORBIDDEN.MSG);
    }

    let notReadyMsg = await isReadyCallback();
    if (notReadyMsg) {
      notReadyMsg = `Application is not available: ${notReadyMsg}`;
    }
    if (notReadyMsg) {
      return res.status(STATUS.GATEWAY_TIMEOUT.CODE).json(notReadyMsg);
    }

    return res.status(STATUS.NO_CONTENT.CODE).end();
  };
};

export const attachContext = (db: DatabaseHandler) => {
  return (req: Request, _: Response, next: NextFunction) => {
    req.dashboard = {
      logger: logMiddleware.logger,
      db: db
    };

    return next();
  };
};

export const handleMissedRoutes = (_: Request, res: Response) => {
  return res.status(STATUS.NOT_FOUND.CODE).json(STATUS.NOT_FOUND.MSG);
};

export const errorHandler = (
  err: Error,
  _: Request,
  res: Response,
  next: NextFunction
  // eslint-disable-next-line @typescript-eslint/max-params
) => {
  if (res.headersSent) {
    return next(err);
  }
  res.err = err; // Needed in order to display the correct stack trace in the logs

  if (!strcasecmp(err.name, 'PayloadTooLargeError')) {
    return res
      .status(STATUS.PAYLOAD_TOO_LARGE.CODE)
      .json(STATUS.PAYLOAD_TOO_LARGE.MSG);
  }

  if (err instanceof DashboardError) {
    return res.status(err.getCode()).json(err.getMessage());
  }

  return res
    .status(STATUS.SERVER_ERROR.CODE)
    .json('Unexpected error, please try again');
};
