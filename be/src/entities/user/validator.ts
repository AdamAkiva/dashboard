import {
  Zod,
  isValidPhoneNumber,
  type ExtractSetType,
  type Request
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

type AllowedGenderValues = ExtractSetType<typeof ALLOWED_GENDER_VALUES>;

const {
  USER_EMAIL_MIN_LENGTH,
  USER_EMAIL_MAX_LENGTH,
  USER_PASSWORD_MIN_LENGTH,
  USER_PASSWORD_MAX_LENGTH,
  USER_FIRST_NAME_MIN_LENGTH,
  USER_FIRST_NAME_MAX_LENGTH,
  USER_LAST_NAME_MIN_LENGTH,
  USER_LAST_NAME_MAX_LENGTH,
  USER_ADDRESS_MIN_LENGTH,
  USER_ADDRESS_MAX_LENGTH
} = VALIDATION;

const ALLOWED_GENDER_VALUES = new Set(['male', 'female', 'other'] as const);

// The non literal values are constants defined by the server
// eslint-disable-next-line security/detect-non-literal-regexp
const passwordRegex = new RegExp(
  `^(?=.*[A-Z])(?=.*[!@#$%^&*()_+-=[]{};':"\\|,.<>/?]).{${USER_PASSWORD_MIN_LENGTH},${USER_PASSWORD_MAX_LENGTH}}$/`
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
      invalid_type_error: invalidObjectErr('user'),
      required_error: requiredErr('user')
    }
  ).strict(invalidObjectErr('params'));

  const paramsRes = paramsSchema.safeParse(params);
  const err = checkAndParseErrors(
    paramsRes,
    validateEmptyObject('user', { ...body, ...query })
  );
  if (err) {
    throw err;
  }

  return (paramsRes as ValidatedType<typeof paramsSchema>).data.userId;
}

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
        `Password should be between ${USER_PASSWORD_MIN_LENGTH} and ${USER_PASSWORD_MAX_LENGTH}.\n` +
          ' The password should contain at least 1 upper case and special letters'
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
      }).transform((phone, ctx) => {
        if (!isValidPhoneNumber(phone, 'IL')) {
          ctx.addIssue({
            code: Zod.ZodIssueCode.custom,
            message: 'Invalid phone number'
          });

          return Zod.NEVER;
        }

        return phone;
      }),
      gender: Zod.string({
        invalid_type_error: invalidStringErr('gender'),
        required_error: requiredErr('gender')
      }).transform((gender, ctx) => {
        const loweredCase = gender.toLowerCase() as AllowedGenderValues;
        if (!ALLOWED_GENDER_VALUES.has(loweredCase)) {
          ctx.addIssue({
            code: Zod.ZodIssueCode.custom,
            message: 'Invalid gender value'
          });

          return Zod.NEVER;
        }

        return loweredCase;
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
      invalid_type_error: invalidObjectErr('user'),
      required_error: requiredErr('user')
    }
  ).strict(invalidObjectErr('user'));

  const paramsRes = bodySchema.safeParse(body);
  const err = checkAndParseErrors(
    paramsRes,
    validateEmptyObject('user', { ...params, ...query })
  );
  if (err) {
    throw err;
  }

  return (paramsRes as ValidatedType<typeof bodySchema>).data;
}

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
      invalid_type_error: invalidObjectErr('user'),
      required_error: requiredErr('user')
    }
  ).strict(invalidObjectErr('params'));

  const bodySchema = Zod.object(
    {
      email: Zod.string({
        invalid_type_error: invalidStringErr('email'),
        required_error: requiredErr('email')
      })
        .min(USER_EMAIL_MIN_LENGTH, minErr('email', USER_EMAIL_MIN_LENGTH))
        .max(USER_EMAIL_MAX_LENGTH, maxErr('email', USER_EMAIL_MAX_LENGTH))
        .email('Invalid email address')
        .optional(),
      password: Zod.string({
        invalid_type_error: invalidStringErr('password'),
        required_error: requiredErr('password')
      })
        .regex(
          passwordRegex,
          `Password should be between ${USER_PASSWORD_MIN_LENGTH} and ${USER_PASSWORD_MAX_LENGTH}.\n` +
            ' The password should contain at least 1 upper case and special letters'
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
        .transform((phone, ctx) => {
          if (!isValidPhoneNumber(phone, 'IL')) {
            ctx.addIssue({
              code: Zod.ZodIssueCode.custom,
              message: 'Invalid phone'
            });

            return Zod.NEVER;
          }

          return phone;
        })
        .optional(),
      gender: Zod.string({
        invalid_type_error: invalidStringErr('gender')
      })
        .transform((gender, ctx) => {
          const loweredCase = gender.toLowerCase() as AllowedGenderValues;
          if (!ALLOWED_GENDER_VALUES.has(loweredCase)) {
            ctx.addIssue({
              code: Zod.ZodIssueCode.custom,
              message: 'Invalid gender'
            });

            return Zod.NEVER;
          }

          return loweredCase;
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
      invalid_type_error: invalidObjectErr('user'),
      required_error: requiredErr('user')
    }
  )
    .strict(invalidObjectErr('user'))
    .transform((val, ctx) => {
      if (Object.keys(val).length === 0) {
        ctx.addIssue({
          code: Zod.ZodIssueCode.custom,
          message: 'Empty update is not allowed'
        });

        return Zod.NEVER;
      }

      return val;
    });

  const paramsRes = paramsSchema.safeParse(params);
  const bodyRes = bodySchema.safeParse(body);
  const err = checkAndParseErrors(
    paramsRes,
    bodyRes,
    validateEmptyObject('user', query)
  );
  if (err) {
    throw err;
  }

  return {
    ...(paramsRes as ValidatedType<typeof paramsSchema>).data,
    ...(bodyRes as ValidatedType<typeof bodySchema>).data
  };
}

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
    validateEmptyObject('user', { ...body, ...query })
  );
  if (err) {
    throw err;
  }

  return (paramsRes as ValidatedType<typeof paramsSchema>).data.userId;
}
