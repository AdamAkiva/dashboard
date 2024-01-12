import type { DatabaseHandler } from '../db/index.js';
import {
  express,
  sql,
  type NextFunction,
  type Request,
  type Response
} from '../types/index.js';
import {
  Logger,
  SMCError,
  STATUS,
  findClientIp,
  strcasecmp
} from '../utils/index.js';

/**********************************************************************************/

export const checkMethod = (allowedMethods: Set<string>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!allowedMethods.has(req.method)) {
      const { NOT_ALLOWED } = STATUS;

      return res.status(NOT_ALLOWED.CODE).send(NOT_ALLOWED.MSG);
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
      const { FORBIDDEN } = STATUS;

      return res.status(FORBIDDEN.CODE).json(STATUS.FORBIDDEN.MSG);
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
    // const authHeader = req.headers.authorization;
    // if (!authHeader) {
    //   const { UNAUTHORIZED } = STATUS;

    //   Logger.nativeLog(
    //     'error',
    //     'Call to attachContext() before calling isUser()/isAdmin()'
    //   );

    //   return res.status(UNAUTHORIZED.CODE).send(UNAUTHORIZED.MSG);
    // }

    req.dashboard = {
      startTime: performance.now(),
      logger: new Logger(),
      db: db
    };

    return next();
  };
};

export const limitReqSize = (limit: string) => {
  return express.json({ limit: limit });
};

export const handleMissedRoutes = (req: Request, res: Response) => {
  const { NOT_FOUND } = STATUS;

  Logger.nativeLog(
    'warn',
    `'${req.method}' request from '${findClientIp(
      req
    )}' for a non-existent route '${req.originalUrl}'`
  );

  return res.status(NOT_FOUND.CODE).send(NOT_FOUND.MSG);
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
  // eslint-disable-next-line @typescript-eslint/max-params
) => {
  const { SERVER_ERROR, PAYLOAD_TOO_LARGE } = STATUS;

  if (!strcasecmp(err.name, 'PayloadTooLargeError')) {
    return res.status(PAYLOAD_TOO_LARGE.CODE).json(PAYLOAD_TOO_LARGE.MSG);
  }

  // Please make sure that each request logs are logged either in the controller
  // (for success) or here (for failure), not in both locations, or any other place
  //. Basically in order to not think about it, just make sure you only log as
  // the last step in the controller (just before sending the client back the
  // data), and then this issue should never occur
  req.dashboard.logger.logRequest(req);

  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof SMCError) {
    return res.status(err.getStatusCode()).json(err.getUsrMsg());
  }

  return res.status(SERVER_ERROR.CODE).json(SERVER_ERROR.MSG);
};
