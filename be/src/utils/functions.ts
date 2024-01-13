import { postgres as pg, type Request } from '../types/index.js';
import { STATUS } from './constants.js';
import DashboardError from './error.js';

/**********************************************************************************/

/**
 * Generics allows for VSCode type completion
 * The compare disregard case (more formally known as case-insensitive compare)
 * @returns 0 if s1 and s2 are lexicographic equal.
 * A negative value if s1 is lexicographic less than s2.
 * A positive value if s1 is lexicographic greater than s2.
 */
export const strcasecmp = <T extends string>(s1: T, s2: T) => {
  return s1.localeCompare(s2, undefined, {
    sensitivity: 'accent'
  });
};

export const findClientIp = (req: Request) => {
  return req.ip ?? 'Unknown';
};

export const filterNullAndUndefined = <T>(
  value?: T | null | undefined
): value is T => {
  return value != null;
};

export const sanitizeError = (err: unknown) => {
  if (err instanceof pg.PostgresError) {
    return new DashboardError(err.message, STATUS.GATEWAY_TIMEOUT.CODE);
  }

  if (err instanceof Error) {
    return err;
  }

  return new DashboardError(
    'Thrown a non-error object. Should not be possible',
    STATUS.SERVER_ERROR.CODE
  );
};
