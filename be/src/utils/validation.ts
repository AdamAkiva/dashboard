import { Zod } from '../types/index.js';
import { DashboardError, STATUS } from './index.js';

/**********************************************************************************/

export const validateEmptyObject = (name: string, obj: unknown) => {
  const res = Zod.object({}).strict(name).safeParse(obj);

  if (!res.success) {
    throw parseErrors(res.error);
  }
};

export const parseErrors = (...errs: Zod.ZodError<unknown>[]) => {
  const delimiter = ', ';

  let errMsg = '';
  for (const err of errs) {
    errMsg += parseErrorMessages(err.issues, delimiter);
  }

  // This removes the last delimiter (if the string ended with one)
  errMsg = errMsg.replace(/, $/, '');

  return new DashboardError(errMsg, STATUS.BAD_REQUEST.CODE);
};

const parseErrorMessages = (
  issues: Zod.ZodIssue[],
  delimiter: string
): string => {
  return issues
    .map(({ message }) => {
      return message;
    })
    .join(delimiter)
    .concat(delimiter);
};

/**********************************************************************************/

export const invalidStructure = (fieldName: string) => {
  return `'${fieldName}' has invalid structure`;
};

export const invalidArrayErr = (fieldName: string) => {
  return `'${fieldName}' is not a valid array`;
};

export const invalidObjectErr = (fieldName: string) => {
  return `'${fieldName}' is not a valid object`;
};

export const invalidStringErr = (fieldName: string) => {
  return `'${fieldName}' is not a valid string`;
};

export const invalidNumberErr = (fieldName: string) => {
  return `'${fieldName}' is not a valid number`;
};

export const invalidUuid = (fieldName: string) => {
  return `'${fieldName}' is not a valid uuid`;
};

/**********************************************************************************/

export const requiredErr = (fieldName: string) => {
  return `'${fieldName}' is required`;
};

export const emptyErr = (fieldName: string) => {
  return `'${fieldName}' must contain one or more element(s)`;
};

/**********************************************************************************/

export const minErr = (fieldName: string, minAmount: number) => {
  return `'${fieldName}' must contain at least ${String(minAmount)} characters`;
};

export const maxErr = (fieldName: string, maxAmount: number) => {
  return `'${fieldName}' must contain at most ${String(maxAmount)} characters`;
};
