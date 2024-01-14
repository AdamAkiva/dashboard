import type { DatabaseHandler } from '../db/index.js';
import {
  sql,
  type NextFunction,
  type Request,
  type Response
} from '../types/index.js';
import {
  DashboardError,
  STATUS,
  logMiddleware,
  strcasecmp
} from '../utils/index.js';

/**********************************************************************************/

export const checkMethod = (allowedMethods: Set<string>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!allowedMethods.has(req.method)) {
      return res.status(STATUS.NOT_ALLOWED.CODE).send(STATUS.NOT_ALLOWED.MSG);
    }

    return next();
  };
};

export const healthCheck = (db: DatabaseHandler) => {
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

    let notReadyMsg = '';
    try {
      await db.getHandler().execute(sql`SELECT NOW()`);
    } catch (err) {
      notReadyMsg += '\nDatabase is unavailable';
    }
    if (notReadyMsg) {
      notReadyMsg = `Application is not available: ${notReadyMsg}`;
    }
    if (notReadyMsg) {
      return res.status(STATUS.SERVICE_UNAVAILABLE.CODE).send(notReadyMsg);
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
  return res.status(STATUS.NOT_FOUND.CODE).send(STATUS.NOT_FOUND.MSG);
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