import type { DatabaseHandler } from '../db/index.js';
import {
  pg,
  type NextFunction,
  type Request,
  type Response
} from '../types/index.js';
import {
  DashboardError,
  ERR_CODES,
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

  // The order is based on two things, type fallback and the chances of each error
  // happening. For example, Dashboard error should be the most common error reason,
  // and it can be the first from a type perspective
  if (err instanceof DashboardError) {
    return res.status(err.getCode()).json(err.getMessage());
  }
  if (!strcasecmp(err.name, 'PayloadTooLargeError')) {
    return res
      .status(StatusCodes.CONTENT_TOO_LARGE)
      .json('Request is too large');
  }
  if (err instanceof pg.PostgresError) {
    return handlePgError(err, res);
  }

  return handleUnexpectedError(err, res);
}

/**********************************************************************************/

function handlePgError(err: pg.PostgresError, res: Response) {
  const { FOREIGN_KEY_VIOLATION, UNIQUE_VIOLATION, TOO_MANY_CONNECTIONS } =
    ERR_CODES.PG;

  switch (err.code) {
    case FOREIGN_KEY_VIOLATION:
    case UNIQUE_VIOLATION:
      res.locals.ctx.logger.fatal(
        err,
        'Should have been handled by the code and never get here. Check the' +
          'code implementation.\nThis may help as well:'
      );
      break;
    case TOO_MANY_CONNECTIONS:
      res.locals.ctx.logger.fatal(
        err,
        'Exceeded database maximum connections.\nThis Should never happen, ' +
          'check the server and database logs to understand why it happened.\n' +
          'This may help as well:'
      );
      break;
  }

  return res
    .status(StatusCodes.SERVER_ERROR)
    .json('Unexpected error, please try again');
}

function handleUnexpectedError(err: unknown, res: Response) {
  if (err instanceof Error) {
    res.locals.ctx.logger.fatal(err, 'Unhandled exception.\nThis may help:');
  } else {
    res.locals.ctx.logger.fatal(
      err,
      'Caught a non-error object.\nThis should never happen.\nThis may help ' +
        'as well:'
    );
  }

  return res
    .status(StatusCodes.SERVER_ERROR)
    .json('Unexpected error, please try again');
}
