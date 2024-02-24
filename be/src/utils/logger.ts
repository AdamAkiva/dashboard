import { pid, pinoHttp } from '../types/index.js';

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
    if (res.statusCode === 304) {
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
      case 301:
        return 'Moved permanently';
      case 307:
        return 'Temporary redirect';
      case 308:
        return 'Permanent redirect';
      case 400:
        return 'Bad request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not found';
      case 405:
        return 'Method not allowed';
      case 408:
        return 'Request timeout';
      case 409:
        return 'Conflict';
      case 413:
        return 'Request too large';
      case 429:
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
