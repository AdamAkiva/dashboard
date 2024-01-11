import { utils, type Request } from '../types/index.js';

/**********************************************************************************/

export const findClientIp = (req: Request) => {
  return req.ip ?? 'Unknown';
};

export const getStackTrace = (err: Error) => {
  return err.stack ? `.\nStackTrace: ${err.stack}` : '';
};

/**
 * This should used only for **safe** debugging. What we mean is that this
 * function (by default) has no length restrictions, meaning if you inspect
 * a user given object it may cause a overload of memory. If you do want
 * to inspect a user input, please override the default options
 */
export const inspect = (obj: unknown, options: utils.InspectOptions = {}) => {
  return utils.inspect(obj, {
    depth: null,
    maxArrayLength: null,
    maxStringLength: null,
    numericSeparator: true,
    ...options
  });
};

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

/**
 * Type-safe way to remove null and undefined values from an array
 */
export const filterNullAndUndefined = <T>(
  value?: T | null | undefined
): value is T => {
  return value != null;
};
