import { pid, pinoHttp } from '../types/index.js';

import { StatusCodes } from './constants.js';
import { isProductionMode } from './functions.js';

/**********************************************************************************/

export const logMiddleware = pinoHttp({
  level: isProductionMode(process.env.NODE_ENV) ? 'info' : 'trace',
  base: { pid: pid },
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    }
  },
  transport: !isProductionMode(process.env.NODE_ENV)
    ? {
        target: 'pino-pretty',
        options: { colorize: true }
      }
    : undefined,
  customLogLevel: (_, res) => {
    if (res.statusCode === StatusCodes.REDIRECT) {
      return 'silent';
    } else if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500) {
      return 'error';
    }

    return 'info';
  },
  customSuccessMessage: (_, res) => {
    switch (res.statusCode) {
      case StatusCodes.MOVED_PERMANENTLY:
        return 'Moved permanently';
      case StatusCodes.TEMPORARY_REDIRECT:
        return 'Temporary redirect';
      case StatusCodes.PERMANENT_REDIRECT:
        return 'Permanent redirect';
      case StatusCodes.BAD_REQUEST:
        return 'Bad request';
      case StatusCodes.UNAUTHORIZED:
        return 'Unauthorized';
      case StatusCodes.FORBIDDEN:
        return 'Forbidden';
      case StatusCodes.NOT_FOUND:
        return 'Not found';
      case StatusCodes.NOT_ALLOWED:
        return 'Method not allowed';
      case StatusCodes.REQUEST_TIMEOUT:
        return 'Request timeout';
      case StatusCodes.CONFLICT:
        return 'Conflict';
      case StatusCodes.CONTENT_TOO_LARGE:
        return 'Request too large';
      case StatusCodes.TOO_MANY_REQUESTS:
        return 'Too many requests';
    }

    return 'Request successful';
  },
  customErrorMessage: (_, res) => {
    return `Request failed with status code: '${res.statusCode}'`;
  },
  customAttributeKeys: {
    responseTime: 'responseTime(MS)'
  }
});

export const logger = logMiddleware.logger;
