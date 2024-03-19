import { Zod, isValidPhoneNumber, type Request } from '../../types/index.js';

import {
  VALIDATION,
  checkAndParseErrors,
  emptyObjectErrMap,
  emptyObjectSchema,
  invalidBoolean,
  invalidObjectErr,
  invalidStringErr,
  invalidUuid,
  maxErr,
  minErr,
  requiredErr,
  type ValidatedType
} from '../utils.js';

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

const ALLOWED_GENDER_VALUES = ['male', 'female', 'other'] as const;

// The password is required to have:
// At least 1 digit, 1 upper case letter, 1 special character (!@#$%^&*),
// no spaces and be between 6 to 64 characters
// The non literal values are constants defined by the server
// eslint-disable-next-line @security/detect-non-literal-regexp
const passwordRegex = new RegExp(
  `^(?=.*\\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[^\\s]{${USER_PASSWORD_MIN_LENGTH},${USER_PASSWORD_MAX_LENGTH}}$`
);

/**********************************************************************************/

export function readUsers(req: Request) {
  const { body, params, query } = req;

  const queryRes = readUsersSchema.safeParse(query);
  const emptyObjectRes = emptyObjectSchema.safeParse(
    { ...body, ...params },
    { errorMap: emptyObjectErrMap('Expected empty request body and params') }
  );
  const err = checkAndParseErrors(queryRes, emptyObjectRes);
  if (err) {
    throw err;
  }

  return (queryRes as ValidatedType<typeof readUsersSchema>).data;
}

export function readUser(req: Request) {
  const { body, params, query } = req;

  const paramsRes = readUserSchema.safeParse(params);
  const emptyObjectRes = emptyObjectSchema.safeParse(
    { ...body, ...query },
    {
      errorMap: emptyObjectErrMap(
        'Expected empty request body and query params'
      )
    }
  );
  const err = checkAndParseErrors(paramsRes, emptyObjectRes);
  if (err) {
    throw err;
  }

  return (paramsRes as ValidatedType<typeof readUserSchema>).data.userId;
}

export function createUser(req: Request) {
  const { body, params, query } = req;

  const paramsRes = createUsersSchema.safeParse(body);
  const emptyObjectRes = emptyObjectSchema.safeParse(
    { ...params, ...query },
    { errorMap: emptyObjectErrMap('Expected empty request params and query') }
  );
  const err = checkAndParseErrors(paramsRes, emptyObjectRes);
  if (err) {
    throw err;
  }

  return (paramsRes as ValidatedType<typeof createUsersSchema>).data;
}

export function updateUser(req: Request) {
  const { body, params, query } = req;

  const paramsRes = userIdSchema.safeParse(params);
  const bodyRes = updateUserSchema.safeParse(body);
  const emptyObjectRes = emptyObjectSchema.safeParse(query, {
    errorMap: emptyObjectErrMap('Expected empty request query params')
  });
  const err = checkAndParseErrors(paramsRes, bodyRes, emptyObjectRes);
  if (err) {
    throw err;
  }

  return {
    ...(paramsRes as ValidatedType<typeof userIdSchema>).data,
    ...(bodyRes as ValidatedType<typeof updateUserSchema>).data
  };
}

export function reactivateUser(req: Request) {
  const { body, params, query } = req;

  const paramsRes = userIdSchema.safeParse(params);
  const emptyObjectRes = emptyObjectSchema.safeParse(
    { ...body, ...query },
    {
      errorMap: emptyObjectErrMap(
        'Expected empty request body and query params'
      )
    }
  );
  const err = checkAndParseErrors(paramsRes, emptyObjectRes);
  if (err) {
    throw err;
  }

  return (paramsRes as ValidatedType<typeof userIdSchema>).data.userId;
}

export function updateUserSettings(req: Request) {
  const { body, params, query } = req;

  const paramsRes = userIdSchema.safeParse(params);
  const bodyRes = updateUserSettingsSchema.safeParse(body);
  const emptyObjectRes = emptyObjectSchema.safeParse(query, {
    errorMap: emptyObjectErrMap('Expected empty request query params')
  });
  const err = checkAndParseErrors(paramsRes, bodyRes, emptyObjectRes);
  if (err) {
    throw err;
  }

  return {
    ...(paramsRes as ValidatedType<typeof userIdSchema>).data,
    ...(bodyRes as ValidatedType<typeof updateUserSettingsSchema>).data
  };
}

export function deleteUser(req: Request) {
  const { body, params, query } = req;

  const paramsRes = deleteUserSchema.safeParse(params);
  const emptyObjectRes = emptyObjectSchema.safeParse(
    { ...body, ...query },
    {
      errorMap: emptyObjectErrMap(
        'Expected empty request body and query params'
      )
    }
  );
  const err = checkAndParseErrors(paramsRes, emptyObjectRes);
  if (err) {
    throw err;
  }

  return (paramsRes as ValidatedType<typeof deleteUserSchema>).data.userId;
}

/********************************** Schemas ***************************************/
/**********************************************************************************/

const readUsersSchema = Zod.object(
  {
    archive: Zod.string({
      invalid_type_error: invalidStringErr('archive')
    })
      .toLowerCase()
      .transform((archive) => {
        if (archive === 'true') {
          return true;
        } else if (archive === 'false') {
          return false;
        }

        return null;
      })
      .pipe(
        Zod.boolean({
          invalid_type_error: invalidBoolean('archive')
        }).optional()
      )
      .optional()
  },
  {
    invalid_type_error: invalidObjectErr('archive')
  }
)
  .strict(invalidObjectErr('user filters'))
  .optional();

const readUserSchema = Zod.object(
  {
    userId: Zod.string({
      invalid_type_error: invalidStringErr('user id'),
      required_error: requiredErr('user id')
    }).uuid({ message: invalidUuid('user id') })
  },
  {
    invalid_type_error: invalidObjectErr('user id'),
    required_error: requiredErr('user id')
  }
).strict(invalidObjectErr('user id'));

const createUsersSchema = Zod.object(
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
    })
      .toLowerCase()
      .pipe(
        Zod.enum(ALLOWED_GENDER_VALUES, {
          invalid_type_error: 'Invalid gender'
        })
      ),
    address: Zod.string({
      invalid_type_error: invalidStringErr('address'),
      required_error: requiredErr('address')
    })
      .min(USER_ADDRESS_MIN_LENGTH, minErr('address', USER_ADDRESS_MIN_LENGTH))
      .max(USER_ADDRESS_MAX_LENGTH, maxErr('address', USER_ADDRESS_MAX_LENGTH))
  },
  {
    invalid_type_error: invalidObjectErr('user data'),
    required_error: requiredErr('user data')
  }
).strict(invalidObjectErr('user data'));

const userIdSchema = Zod.object(
  {
    userId: Zod.string({
      invalid_type_error: invalidStringErr('user id'),
      required_error: requiredErr('user id')
    }).uuid({ message: invalidUuid('user id') })
  },
  {
    invalid_type_error: invalidObjectErr('user id'),
    required_error: requiredErr('user id')
  }
).strict(invalidObjectErr('user id'));

const updateUserSchema = Zod.object(
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
      .toLowerCase()
      .pipe(
        Zod.enum(ALLOWED_GENDER_VALUES, {
          invalid_type_error: 'Invalid gender'
        }).optional()
      )
      .optional(),
    address: Zod.string({
      invalid_type_error: invalidStringErr('address')
    })
      .min(USER_ADDRESS_MIN_LENGTH, minErr('address', USER_ADDRESS_MIN_LENGTH))
      .max(USER_ADDRESS_MAX_LENGTH, maxErr('address', USER_ADDRESS_MAX_LENGTH))
      .optional()
  },
  {
    invalid_type_error: invalidObjectErr('user updates'),
    required_error: requiredErr('user updates')
  }
)
  .strict(invalidObjectErr('user updates'))
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

const updateUserSettingsSchema = Zod.object(
  {
    darkMode: Zod.boolean({
      invalid_type_error: invalidBoolean('dark mode')
    }).optional()
  },
  {
    invalid_type_error: invalidObjectErr('user settings'),
    required_error: requiredErr('user settings')
  }
)
  .strict(invalidObjectErr('user settings'))
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

const deleteUserSchema = Zod.object(
  {
    userId: Zod.string({
      invalid_type_error: invalidStringErr('user id'),
      required_error: requiredErr('user id')
    }).uuid({ message: invalidUuid('user id') })
  },
  {
    invalid_type_error: invalidObjectErr('user id'),
    required_error: requiredErr('user id')
  }
).strict(invalidObjectErr('user id'));
