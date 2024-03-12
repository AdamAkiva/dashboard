import {
  userDebug,
  type RequestContext,
  type User
} from '../../../types/index.js';

import { executePreparedQuery } from '../../utils/index.js';

import type { createOne as createOneValidation } from '../validator.js';

import { userCreationError } from './utils.js';

/**********************************************************************************/

type UserCreateOneValidationData = ReturnType<typeof createOneValidation>;

/**********************************************************************************/

export async function createOne(params: {
  ctx: RequestContext;
  userData: UserCreateOneValidationData;
}): Promise<User> {
  const {
    ctx: { db },
    userData
  } = params;

  const handler = db.getHandler();
  const { password, ...userInfo } = userData;

  const createdAt = new Date().toISOString();

  try {
    return await handler.transaction(async () => {
      const [{ userId }] = await executePreparedQuery({
        db: db,
        queryName: 'createUserInfoQuery',
        phValues: {
          ...userInfo,
          createdAt: createdAt
        },
        debug: { instance: userDebug, msg: 'Creating user info entry' }
      });

      const results = await Promise.allSettled([
        executePreparedQuery({
          db: db,
          queryName: 'createUserCredentialsQuery',
          phValues: {
            userId: userId,
            email: userInfo.email,
            password: password,
            createdAt: createdAt
          },
          debug: {
            instance: userDebug,
            msg: 'Creating user credentials entry'
          }
        }),
        executePreparedQuery({
          db: db,
          queryName: 'createUserDefaultSettingsQuery',
          phValues: {
            userId: userId,
            createdAt: createdAt
          },
          debug: {
            instance: userDebug,
            msg: 'Creating default user settings entry'
          }
        })
      ]);
      for (const result of results) {
        if (result.status === 'rejected') {
          throw result.reason;
        }
      }

      return {
        ...userInfo,
        id: userId
      };
    });
  } catch (err) {
    throw userCreationError(err, userInfo.email);
  }
}
