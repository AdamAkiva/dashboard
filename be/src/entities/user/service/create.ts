import type { DatabaseHandler } from '../../../db/index.js';
import {
  userDebug,
  type RequestContext,
  type User
} from '../../../types/index.js';

import {
  executePreparedQuery,
  userCreationError
} from '../../utils/service.js';

import type { createOne as createOneValidation } from '../validator.js';

/**********************************************************************************/

type UserCreateOneValidationData = ReturnType<typeof createOneValidation>;

/**********************************************************************************/

export async function createOne(
  ctx: RequestContext,
  userData: UserCreateOneValidationData
): Promise<User> {
  const { db } = ctx;
  const handler = db.getHandler();

  const { password, ...userInfo } = userData;
  const createdAt = new Date().toISOString();

  // According to: https://www.answeroverflow.com/m/1164318289674125392
  // handler and transaction can be used interchangeably, hopefully that is the
  // case. Should check it at some point
  return await handler.transaction(async () => {
    try {
      const userId = await createUserInfo({
        db: db,
        userInfo: userInfo,
        createdAt: createdAt
      });
      const results = await Promise.allSettled([
        createUserCredentials({
          db: db,
          credentials: {
            email: userInfo.email,
            password: password
          },
          userId: userId,
          createdAt: createdAt
        }),
        createUserDefaultSettings({
          db: db,
          userId: userId,
          createdAt: createdAt
        })
      ]);
      for (const result of results) {
        if (result.status === 'rejected') {
          throw result.reason;
        }
      }

      return {
        ...userInfo,
        id: userId,
        createdAt: createdAt,
        isActive: true
      };
    } catch (err) {
      throw userCreationError(err, userInfo.email);
    }
  });
}

/**********************************************************************************/

async function createUserInfo(params: {
  db: DatabaseHandler;
  userInfo: Omit<UserCreateOneValidationData, 'password'>;
  createdAt: string;
}) {
  const { db, userInfo, createdAt } = params;

  return (
    await executePreparedQuery({
      db: db,
      queryName: 'createUserInfoQuery',
      phValues: { ...userInfo, createdAt: createdAt },
      debug: { instance: userDebug, msg: 'Creating user info entry' }
    })
  )[0].userId;
}

async function createUserCredentials(params: {
  db: DatabaseHandler;
  credentials: Pick<UserCreateOneValidationData, 'email' | 'password'>;
  userId: string;
  createdAt: string;
}) {
  const { db, credentials, userId, createdAt } = params;

  await executePreparedQuery({
    db: db,
    queryName: 'createUserCredentialsQuery',
    phValues: {
      ...credentials,
      userId: userId,
      createdAt: createdAt
    },
    debug: { instance: userDebug, msg: 'Creating user credentials entry' }
  });
}

async function createUserDefaultSettings(params: {
  db: DatabaseHandler;
  userId: string;
  createdAt: string;
}) {
  const { db, userId, createdAt } = params;

  await executePreparedQuery({
    db: db,
    queryName: 'createUserDefaultSettingsQuery',
    phValues: { userId: userId, createdAt: createdAt },
    debug: { instance: userDebug, msg: 'Creating default user settings entry' }
  });
}
