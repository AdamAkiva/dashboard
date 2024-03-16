import type { UnknownObject } from '../types/index.js';

/**********************************************************************************/

/**
 * Generics allows for VSCode type completion
 * The compare disregard case (more formally known as case-insensitive compare)
 * @returns 0 if s1 and s2 are lexicographic equal.
 * A negative value if s1 is lexicographic less than s2.
 * A positive value if s1 is lexicographic greater than s2.
 */
export function strcasecmp<T extends string>(s1: T, s2: T) {
  return s1.localeCompare(s2, undefined, {
    sensitivity: 'accent'
  });
}

export function objHasValues(obj: UnknownObject) {
  let k: keyof typeof obj;
  for (k in obj) {
    if (obj[k] != null) {
      return true;
    }
  }

  return false;
}

export function filterNullAndUndefined<T>(value?: T | null): value is T {
  return value != null;
}

export function debugEnabled() {
  return process.env.DEBUG !== undefined;
}

export function isDevelopmentMode(mode?: string) {
  return mode === 'development';
}

export function isTestMode(mode?: string) {
  return mode === 'test';
}

export function isProductionMode(mode?: string) {
  return mode === 'production';
}
