import { getEnv } from './config.js';
import { STATUS, VALIDATION } from './constants.js';
import DashboardError from './error.js';
import {
  filterNullAndUndefined,
  findClientIp,
  sanitizeError,
  strcasecmp
} from './functions.js';
import { logMiddleware, logger } from './logger.js';
import {
  emptyErr,
  invalidArrayErr,
  invalidNumberErr,
  invalidObjectErr,
  invalidStringErr,
  invalidStructure,
  invalidUuid,
  maxErr,
  minErr,
  parseErrors,
  requiredErr,
  validateEmptyObject
} from './validation.js';

/**********************************************************************************/

export {
  DashboardError,
  STATUS,
  VALIDATION,
  emptyErr,
  filterNullAndUndefined,
  findClientIp,
  getEnv,
  invalidArrayErr,
  invalidNumberErr,
  invalidObjectErr,
  invalidStringErr,
  invalidStructure,
  invalidUuid,
  logMiddleware,
  logger,
  maxErr,
  minErr,
  parseErrors,
  requiredErr,
  sanitizeError,
  strcasecmp,
  validateEmptyObject
};
