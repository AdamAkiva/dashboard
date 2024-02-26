import { Zod } from '../../types/index.js';
import { DashboardError, StatusCodes } from '../../utils/index.js';

/**********************************************************************************/

export type ValidatedType<T extends Zod.ZodType> = Zod.SafeParseSuccess<
  Zod.infer<T>
>;

export const VALIDATION = {
  USER_EMAIL_MIN_LENGTH: 3,
  USER_EMAIL_MAX_LENGTH: 512,
  USER_PASSWORD_MIN_LENGTH: 8,
  USER_PASSWORD_MAX_LENGTH: 64,
  USER_FIRST_NAME_MIN_LENGTH: 1,
  USER_FIRST_NAME_MAX_LENGTH: 256,
  USER_LAST_NAME_MIN_LENGTH: 1,
  USER_LAST_NAME_MAX_LENGTH: 256,
  USER_ADDRESS_MIN_LENGTH: 1,
  USER_ADDRESS_MAX_LENGTH: 256
} as const;

/**********************************************************************************/

export function validateEmptyObject(name: string, obj: unknown) {
  return Zod.object({}).strict(name).safeParse(obj);
}

export function checkAndParseErrors(
  ...results: Zod.SafeParseReturnType<unknown, unknown>[]
) {
  const errs: Zod.ZodError<unknown>[] = [];
  results.forEach((result) => {
    if (!result.success) {
      errs.push(result.error);
    }
  });
  if (!errs.length) {
    return undefined;
  }

  return parseErrors(errs);
}

/**********************************************************************************/

function parseErrors(errs: Zod.ZodError<unknown>[]) {
  const delimiter = ', ';

  let errMsg = '';
  for (const err of errs) {
    errMsg += parseErrorMessages(err.issues, delimiter);
  }

  // This removes the last delimiter (if the string ended with one)
  errMsg = errMsg.replace(/, $/, '');

  return new DashboardError(errMsg, StatusCodes.BAD_REQUEST);
}

function parseErrorMessages(issues: Zod.ZodIssue[], delimiter: string): string {
  return issues
    .map(({ message }) => {
      return message;
    })
    .join(delimiter)
    .concat(delimiter);
}

/**********************************************************************************/

export function invalidStructure(fieldName: string) {
  return `'${fieldName}' has invalid structure`;
}

export function invalidArrayErr(fieldName: string) {
  return `'${fieldName}' is not a valid array`;
}

export function invalidObjectErr(fieldName: string) {
  return `'${fieldName}' is not a valid object`;
}

export function invalidStringErr(fieldName: string) {
  return `'${fieldName}' is not a valid string`;
}

export function invalidUuid(fieldName: string) {
  return `'${fieldName}' is not a valid uuid`;
}

export function invalidBoolean(fieldName: string) {
  return `'${fieldName}' is not a valid boolean`;
}

/**********************************************************************************/

export function requiredErr(fieldName: string) {
  return `'${fieldName}' is required`;
}

export function emptyErr(fieldName: string) {
  return `'${fieldName}' must contain one or more element(s)`;
}

/**********************************************************************************/

export function minErr(fieldName: string, minAmount: number) {
  return `'${fieldName}' must contain at least ${String(minAmount)} characters`;
}

export function maxErr(fieldName: string, maxAmount: number) {
  return `'${fieldName}' must contain at most ${String(maxAmount)} characters`;
}
