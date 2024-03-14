import type { DatabaseHandler } from '../db/index.js';
import type { NextFunction, Request, Response } from '../types/index.js';
import {
  DashboardError,
  StatusCodes,
  strcasecmp,
  type Logger
} from '../utils/index.js';

/**********************************************************************************/

export function checkMethod(allowedMethods: Set<string>) {
  return function _checkMethod(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const reqMethod = req.method.toUpperCase();

    if (!allowedMethods.has(reqMethod)) {
      // Reason for explicitly adding the header:
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Allow
      return res
        .set('Allow', Array.from(allowedMethods).join(', '))
        .status(StatusCodes.NOT_ALLOWED)
        .json(`${reqMethod} is not a support method`);
    }

    return next();
  };
}

export function healthCheck(
  allowedHosts: Set<string>,
  isReadyCallback: () => Promise<string> | string
) {
  return async function _healthCheck(req: Request, res: Response) {
    if (strcasecmp(req.method, 'HEAD') && strcasecmp(req.method, 'GET')) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(`Health check must be a 'HEAD' or 'GET' request`);
    }

    const hostName = req.hostname.toLowerCase();
    if (!allowedHosts.has(hostName)) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(`'${req.hostname}' is forbidden to make a healthcheck`);
    }

    let notReadyMsg = await isReadyCallback();
    if (notReadyMsg) {
      notReadyMsg = `Application is not available: ${notReadyMsg}`;
    }
    if (notReadyMsg) {
      return res.status(StatusCodes.GATEWAY_TIMEOUT).json(notReadyMsg);
    }

    return res.status(StatusCodes.NO_CONTENT).end();
  };
}

export function attachContext(db: DatabaseHandler, logger: Logger['handler']) {
  return function _attachContext(
    _: Request,
    res: Response,
    next: NextFunction
  ) {
    res.locals.ctx = {
      db: db,
      logger: logger
    };

    return next();
  };
}

export function handleMissedRoutes(req: Request, res: Response) {
  return res.status(StatusCodes.NOT_FOUND).json(`'${req.url}' does not exist`);
}

// eslint-disable-next-line @typescript-eslint/max-params
export function errorHandler(
  err: Error,
  _: Request,
  res: Response,
  next: NextFunction
) {
  if (res.headersSent) {
    return next(err);
  }
  res.err = err; // Needed in order to display the correct stack trace in the logs

  if (!strcasecmp(err.name, 'PayloadTooLargeError')) {
    return res
      .status(StatusCodes.CONTENT_TOO_LARGE)
      .json('Request is too large');
  }

  if (err instanceof DashboardError) {
    return res.status(err.getCode()).json(err.getMessage());
  }

  return res
    .status(StatusCodes.SERVER_ERROR)
    .json('Unexpected error, please try again');
}
