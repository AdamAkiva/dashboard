import type { DatabaseHandler } from '../db/index.js';
import type {
  Logger,
  NextFunction,
  Request,
  Response
} from '../types/index.js';
import { DashboardError, strcasecmp } from '../utils/index.js';

/**********************************************************************************/

export function checkMethod(allowedMethods: Set<string>) {
  return function _checkMethod(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const reqMethod = req.method.toUpperCase();

    if (!allowedMethods.has(reqMethod)) {
      return res.status(405).json('Method not allowed');
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
      return res.status(400).json(`Health check must be a 'GET' request`);
    }

    const hostName = req.hostname.toLowerCase();
    if (!allowedHosts.has(hostName)) {
      return res.status(403).json('Forbidden to make healthcheck');
    }

    let notReadyMsg = await isReadyCallback();
    if (notReadyMsg) {
      notReadyMsg = `Application is not available: ${notReadyMsg}`;
    }
    if (notReadyMsg) {
      return res.status(504).json(notReadyMsg);
    }

    return res.status(204).end();
  };
}

export function attachContext(db: DatabaseHandler, logger: Logger) {
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

export function handleMissedRoutes(_: Request, res: Response) {
  return res.status(404).json('Request route does not exist');
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
    return res.status(413).json('Request is too large');
  }

  if (err instanceof DashboardError) {
    return res.status(err.getCode()).json(err.getMessage());
  }

  return res.status(500).json('Unexpected error, please try again');
}
