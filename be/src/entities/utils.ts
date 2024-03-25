import type { DatabaseHandler } from '../db/index.js';
import {
  DashboardError,
  StatusCodes,
  Zod,
  type Debug,
  type UnknownObject
} from '../utils/index.js';

/****************************** Service related ***********************************/
/**********************************************************************************/

type DBPreparedQueries = ReturnType<DatabaseHandler['getPreparedQueries']>;

export async function executePreparedQuery<
  T extends keyof DBPreparedQueries
>(params: { db: DatabaseHandler; queryName: T; phValues?: UnknownObject }) {
  const { db, queryName, phValues } = params;
  const preparedQueries = db.getPreparedQueries();

  return (await preparedQueries[queryName].execute(phValues)) as Awaited<
    ReturnType<DBPreparedQueries[T]['execute']>
  >;
}

/***************************** Validation related *********************************/
/**********************************************************************************/

export type ValidatedType<T extends Zod.ZodType> = Zod.SafeParseSuccess<
  Zod.infer<T>
>;

export const VALIDATION = {
  USER_EMAIL_MIN_LENGTH: 6,
  USER_EMAIL_MAX_LENGTH: 256,
  USER_PASSWORD_MIN_LENGTH: 6,
  USER_PASSWORD_MAX_LENGTH: 64,
  USER_FIRST_NAME_MIN_LENGTH: 1,
  USER_FIRST_NAME_MAX_LENGTH: 128,
  USER_LAST_NAME_MIN_LENGTH: 1,
  USER_LAST_NAME_MAX_LENGTH: 256,
  USER_PHONE_MIN_LENGTH: 3,
  USER_PHONE_MAX_LENGTH: 16,
  USER_ADDRESS_MIN_LENGTH: 1,
  USER_ADDRESS_MAX_LENGTH: 256
} as const;

export const emptyObjectSchema = Zod.object({}).strict();

/**********************************************************************************/

export function emptyObjectErrMap(errMsg: string) {
  return ((issue, ctx) => {
    if (issue.code === Zod.ZodIssueCode.unrecognized_keys) {
      return { message: errMsg };
    }

    return { message: ctx.defaultError };
  }) satisfies Zod.ZodErrorMap;
}

export function checkAndParseErrors(
  ...results: Zod.SafeParseReturnType<unknown, unknown>[]
) {
  const errs = results
    .filter((result): result is Zod.SafeParseError<unknown> => {
      return !result.success;
    })
    .map((result) => {
      return result.error;
    });
  if (!errs.length) {
    return undefined;
  }

  return parseErrors(errs);
}

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

export function requiredErr(fieldName: string) {
  return `'${fieldName}' is required`;
}

export function minErr(fieldName: string, minAmount: number) {
  return `'${fieldName}' must contain at least ${String(minAmount)} characters`;
}

export function maxErr(fieldName: string, maxAmount: number) {
  return `'${fieldName}' must contain at most ${String(maxAmount)} characters`;
}

/**********************************************************************************/

export function debugWrapper<T>(
  fn: () => T,
  debug: { instance: ReturnType<typeof Debug>; msg: string }
) {
  const { instance: debugInstance, msg } = debug;

  debugInstance(`Begin --- ${msg}`);
  const res = fn();
  debugInstance(`End   --- ${msg}`);

  return res;
}

export async function asyncDebugWrapper<T>(
  fn: () => Promise<T>,
  debug: { instance: ReturnType<typeof Debug>; msg: string }
) {
  const { instance: debugInstance, msg } = debug;

  debugInstance(`Begin --- ${msg}`);
  const res = await fn();
  debugInstance(`End   --- ${msg}`);

  return res;
}
