import {
  hostname,
  machine,
  pid,
  pinoHttp,
  platform,
  release,
  version
} from '../types/index.js';
import { STATUS } from './constants.js';

/**********************************************************************************/

export const logMiddleware = pinoHttp({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'trace',
  depthLimit: 5,
  edgeLimit: 100,
  messageKey: 'msg',
  errorKey: 'err',
  base: {
    pid: pid,
    host: hostname(),
    platform: platform(),
    machine: machine(),
    release: release(),
    node_ver: version,
    env: process.env.NODE_ENV
  },
  timestamp: () => {
    return `,"timestamp:":"${new Date(Date.now()).toISOString()}"`;
  },
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    }
  },
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: { colorize: true }
        }
      : undefined,
  customLogLevel: (_, res) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500) {
      return 'error';
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'silent';
    }

    return 'info';
  },
  customSuccessMessage: (_, res) => {
    if (res.statusCode === STATUS.NOT_FOUND.CODE) {
      return 'Not found';
    }

    return `Request successful`;
  },
  customErrorMessage: (_, res) => {
    return `Request failed with status code: '${res.statusCode}'`;
  },
  customAttributeKeys: {
    responseTime: 'responseTime(MS)'
  }
});

export const logger = logMiddleware.logger;
