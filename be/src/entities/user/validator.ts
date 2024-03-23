import {
  Zod,
  isValidPhoneNumber,
  type CreateUser,
  type Request,
  type UpdateUser
} from '../../types/index.js';

import {
  VALIDATION,
  checkAndParseErrors,
  invalidObjectErr,
  invalidStringErr,
  invalidUuid,
  maxErr,
  minErr,
  requiredErr,
  validateEmptyObject,
  type ValidatedType
} from '../utils/validator.js';

/**********************************************************************************/

const {
  USER_EMAIL_MIN_LENGTH,
  USER_EMAIL_MAX_LENGTH,
  USER_PASSWORD_MIN_LENGTH,
  USER_PASSWORD_MAX_LENGTH,
  USER_FIRST_NAME_MIN_LENGTH,
  USER_FIRST_NAME_MAX_LENGTH,
  USER_LAST_NAME_MIN_LENGTH,
  USER_LAST_NAME_MAX_LENGTH,
  USER_PHONE_MIN_LENGTH,
  USER_PHONE_MAX_LENGTH,
  USER_ADDRESS_MIN_LENGTH,
  USER_ADDRESS_MAX_LENGTH
} = VALIDATION;

const ALLOWED_GENDER_VALUES = new Set<
  CreateUser['gender'] | UpdateUser['gender']
>(['male', 'female', 'other'] as const);

// The password is required to have:
// At least 1 digit, 1 upper case letter, 1 special character (!@#$%^&*),
// no spaces and be between 6 to 64 characters
// The non literal values are constants defined by the server
// eslint-disable-next-line @security/detect-non-literal-regexp
const passwordRegex = new RegExp(
  `^(?=.*\\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[^\\s]{${USER_PASSWORD_MIN_LENGTH},${USER_PASSWORD_MAX_LENGTH}}$`
);

/**********************************************************************************/

export function readOne(req: Request) {
  const { body, params, query } = req;

  const paramsSchema = Zod.object(
    {
      userId: Zod.string({
        invalid_type_error: invalidStringErr('user id'),
        required_error: requiredErr('user id')
      }).uuid({ message: invalidUuid('user id') })
    },
    {
      invalid_type_error: invalidObjectErr('request params'),
      required_error: requiredErr('request params')
    }
  ).strict(invalidObjectErr('request params'));

  const paramsRes = paramsSchema.safeParse(params);
  const err = checkAndParseErrors(
    paramsRes,
    validateEmptyObject('Expected empty request body and query params', {
      ...body,
      ...query
    })
  );
  if (err) {
    throw err;
  }

  return (paramsRes as ValidatedType<typeof paramsSchema>).data.userId;
}

/**********************************************************************************/

export function createOne(req: Request) {
  const { body, params, query } = req;

  const bodySchema = Zod.object(
    {
      email: Zod.string({
        invalid_type_error: invalidStringErr('email'),
        required_error: requiredErr('email')
      })
        .min(USER_EMAIL_MIN_LENGTH, minErr('email', USER_EMAIL_MIN_LENGTH))
        .max(USER_EMAIL_MAX_LENGTH, maxErr('email', USER_EMAIL_MAX_LENGTH))
        .email('Invalid email address'),
      password: Zod.string({
        invalid_type_error: invalidStringErr('password'),
        required_error: requiredErr('password')
      }).regex(
        passwordRegex,
        'Password must contain at least 1 digit, 1 lower case letter,' +
          ' 1 upper case letter, 1 special character (!@#$%^&*), no spaces,' +
          ` and be between ${USER_PASSWORD_MIN_LENGTH} to ${USER_PASSWORD_MAX_LENGTH} characters`
      ),
      firstName: Zod.string({
        invalid_type_error: invalidStringErr('first name'),
        required_error: requiredErr('first name')
      })
        .min(
          USER_FIRST_NAME_MIN_LENGTH,
          minErr('first name', USER_FIRST_NAME_MIN_LENGTH)
        )
        .max(
          USER_FIRST_NAME_MAX_LENGTH,
          maxErr('first name', USER_FIRST_NAME_MAX_LENGTH)
        ),
      lastName: Zod.string({
        invalid_type_error: invalidStringErr('last name'),
        required_error: requiredErr('last name')
      })
        .min(
          USER_LAST_NAME_MIN_LENGTH,
          minErr('last name', USER_LAST_NAME_MIN_LENGTH)
        )
        .max(
          USER_LAST_NAME_MAX_LENGTH,
          maxErr('last name', USER_LAST_NAME_MAX_LENGTH)
        ),
      phone: Zod.string({
        invalid_type_error: invalidStringErr('phone'),
        required_error: requiredErr('phone')
      })
        .min(USER_PHONE_MIN_LENGTH, minErr('phone', USER_PHONE_MIN_LENGTH))
        .max(USER_PHONE_MAX_LENGTH, maxErr('phone', USER_PHONE_MAX_LENGTH))
        .superRefine((phone, ctx) => {
          if (!isValidPhoneNumber(phone, 'IL')) {
            ctx.addIssue({
              code: Zod.ZodIssueCode.custom,
              message: 'Invalid phone',
              fatal: true
            });

            return Zod.NEVER;
          }
        }),
      gender: Zod.string({
        invalid_type_error: invalidStringErr('gender'),
        required_error: requiredErr('gender')
      }).transform((gender, ctx) => {
        const loweredCaseVal = gender.toLowerCase() as CreateUser['gender'];
        if (!ALLOWED_GENDER_VALUES.has(loweredCaseVal)) {
          ctx.addIssue({
            code: Zod.ZodIssueCode.custom,
            message: 'Invalid gender'
          });

          return Zod.NEVER;
        }

        return loweredCaseVal;
      }),
      address: Zod.string({
        invalid_type_error: invalidStringErr('address'),
        required_error: requiredErr('address')
      })
        .min(
          USER_ADDRESS_MIN_LENGTH,
          minErr('address', USER_ADDRESS_MIN_LENGTH)
        )
        .max(
          USER_ADDRESS_MAX_LENGTH,
          maxErr('address', USER_ADDRESS_MAX_LENGTH)
        )
    },
    {
      invalid_type_error: invalidObjectErr('request body'),
      required_error: requiredErr('request body')
    }
  ).strict(invalidObjectErr('request body'));

  const paramsRes = bodySchema.safeParse(body);
  const err = checkAndParseErrors(
    paramsRes,
    validateEmptyObject('Expected empty request params and query', {
      ...params,
      ...query
    })
  );
  if (err) {
    throw err;
  }

  return (paramsRes as ValidatedType<typeof bodySchema>).data;
}

/**********************************************************************************/

export function updateOne(req: Request) {
  const { body, params, query } = req;

  const paramsSchema = Zod.object(
    {
      userId: Zod.string({
        invalid_type_error: invalidStringErr('user id'),
        required_error: requiredErr('user id')
      }).uuid({ message: invalidUuid('user id') })
    },
    {
      invalid_type_error: invalidObjectErr('request params'),
      required_error: requiredErr('request params')
    }
  ).strict(invalidObjectErr('request params'));

  const bodySchema = Zod.object(
    {
      email: Zod.string({
        invalid_type_error: invalidStringErr('email')
      })
        .min(USER_EMAIL_MIN_LENGTH, minErr('email', USER_EMAIL_MIN_LENGTH))
        .max(USER_EMAIL_MAX_LENGTH, maxErr('email', USER_EMAIL_MAX_LENGTH))
        .email('Invalid email address')
        .optional(),
      password: Zod.string({
        invalid_type_error: invalidStringErr('password')
      })
        .regex(
          passwordRegex,
          'Password must contain at least 1 digit, 1 lower case letter,' +
            ' 1 upper case letter, 1 special character (!@#$%^&*), no spaces,' +
            ` and be between ${USER_PASSWORD_MIN_LENGTH} to ${USER_PASSWORD_MAX_LENGTH} characters`
        )
        .optional(),
      firstName: Zod.string({
        invalid_type_error: invalidStringErr('first name')
      })
        .min(
          USER_FIRST_NAME_MIN_LENGTH,
          minErr('first name', USER_FIRST_NAME_MIN_LENGTH)
        )
        .max(
          USER_FIRST_NAME_MAX_LENGTH,
          maxErr('first name', USER_FIRST_NAME_MAX_LENGTH)
        )
        .optional(),
      lastName: Zod.string({
        invalid_type_error: invalidStringErr('last name')
      })
        .min(
          USER_LAST_NAME_MIN_LENGTH,
          minErr('last name', USER_LAST_NAME_MIN_LENGTH)
        )
        .max(
          USER_LAST_NAME_MAX_LENGTH,
          maxErr('last name', USER_LAST_NAME_MAX_LENGTH)
        )
        .optional(),
      phone: Zod.string({
        invalid_type_error: invalidStringErr('phone')
      })
        .superRefine((phone, ctx) => {
          if (!isValidPhoneNumber(phone, 'IL')) {
            ctx.addIssue({
              code: Zod.ZodIssueCode.custom,
              message: 'Invalid phone',
              fatal: true
            });

            return Zod.NEVER;
          }
        })
        .optional(),
      gender: Zod.string({
        invalid_type_error: invalidStringErr('gender')
      })
        .transform((gender, ctx) => {
          const loweredCaseVal = gender.toLowerCase() as UpdateUser['gender'];
          if (loweredCaseVal === undefined) {
            return undefined;
          }
          if (!ALLOWED_GENDER_VALUES.has(loweredCaseVal)) {
            ctx.addIssue({
              code: Zod.ZodIssueCode.custom,
              message: 'Invalid gender'
            });

            return Zod.NEVER;
          }

          return loweredCaseVal;
        })
        .optional(),
      address: Zod.string({
        invalid_type_error: invalidStringErr('address')
      })
        .min(
          USER_ADDRESS_MIN_LENGTH,
          minErr('address', USER_ADDRESS_MIN_LENGTH)
        )
        .max(
          USER_ADDRESS_MAX_LENGTH,
          maxErr('address', USER_ADDRESS_MAX_LENGTH)
        )
        .optional()
    },
    {
      invalid_type_error: invalidObjectErr('request body'),
      required_error: requiredErr('request body')
    }
  )
    .strict(invalidObjectErr('request body'))
    .superRefine((val, ctx) => {
      if (!Object.keys(val).length) {
        ctx.addIssue({
          code: Zod.ZodIssueCode.custom,
          message: 'Empty update is not allowed',
          fatal: true
        });

        return Zod.NEVER;
      }
    });

  const paramsRes = paramsSchema.safeParse(params);
  const bodyRes = bodySchema.safeParse(body);
  const err = checkAndParseErrors(
    paramsRes,
    bodyRes,
    validateEmptyObject('Expected empty query params', query)
  );
  if (err) {
    throw err;
  }

  return {
    ...(paramsRes as ValidatedType<typeof paramsSchema>).data,
    ...(bodyRes as ValidatedType<typeof bodySchema>).data
  };
}

export function reactivateOne(req: Request) {
  const { body, params, query } = req;

  const paramsSchema = Zod.object(
    {
      userId: Zod.string({
        invalid_type_error: invalidStringErr('user id'),
        required_error: requiredErr('user id')
      }).uuid({ message: invalidUuid('user id') })
    },
    {
      invalid_type_error: invalidObjectErr('request params'),
      required_error: requiredErr('request params')
    }
  ).strict(invalidObjectErr('request params'));

  const paramsRes = paramsSchema.safeParse(params);
  const err = checkAndParseErrors(
    paramsRes,
    validateEmptyObject('Expected empty request body and query params', {
      ...body,
      ...query
    })
  );
  if (err) {
    throw err;
  }

  return (paramsRes as ValidatedType<typeof paramsSchema>).data.userId;
}

/**********************************************************************************/

export function deleteOne(req: Request) {
  const { body, params, query } = req;

  const paramsSchema = Zod.object(
    {
      userId: Zod.string({
        invalid_type_error: invalidStringErr('user id'),
        required_error: requiredErr('user id')
      }).uuid({ message: invalidUuid('user id') })
    },
    {
      invalid_type_error: invalidObjectErr('user'),
      required_error: requiredErr('user')
    }
  ).strict(invalidObjectErr('params'));

  const paramsRes = paramsSchema.safeParse(params);
  const err = checkAndParseErrors(
    paramsRes,
    validateEmptyObject('Expected empty request body and query params', {
      ...body,
      ...query
    })
  );
  if (err) {
    throw err;
  }

  return (paramsRes as ValidatedType<typeof paramsSchema>).data.userId;
}
