import type {
  DBModels,
  DatabaseHandler,
  Transaction
} from '../../../db/index.js';
import {
  eq,
  userDebug,
  type RequestContext,
  type User
} from '../../../types/index.js';
import { objHasValues } from '../../../utils/index.js';

import {
  executePreparedQuery,
  userNotAllowedToBeUpdated,
  userNotFoundError,
  userUpdatedButReadFailed
} from '../../utils/index.js';

import type { updateOne as updateOneValidation } from '../validator.js';

/**********************************************************************************/

type UserUpdateOneValidationData = ReturnType<typeof updateOneValidation>;

/**********************************************************************************/

export async function updateOne(
  ctx: RequestContext,
  updates: UserUpdateOneValidationData
): Promise<User> {
  const { db } = ctx;
  const handler = db.getHandler();
  const models = db.getModels();

  const { password, userId, ...userInfo } = updates;
  const updatedAt = new Date().toISOString();

  // According to: https://www.answeroverflow.com/m/1164318289674125392
  // handler and transaction can be used interchangeably, hopefully that is the
  // case. Should check it at some point
  await handler.transaction(async (transaction) => {
    const results = await Promise.allSettled([
      isAllowedToUpdate(db, userId),
      updateUserInfo({
        transaction: transaction,
        models: models,
        userInfo: userInfo,
        userId: userId,
        updatedAt: updatedAt
      }),
      updateUserCredentials({
        transaction: transaction,
        models: models,
        credentials: {
          email: userInfo.email,
          password: password
        },
        userId: userId,
        updatedAt: updatedAt
      })
    ]);
    for (const result of results) {
      if (result.status === 'rejected') {
        throw result.reason;
      }
    }
  });

  try {
    return (
      await executePreparedQuery({
        db: db,
        queryName: 'readUserQuery',
        phValues: { userId: userId },
        debug: { instance: userDebug, msg: 'Fetching user after update' }
      })
    )[0];
  } catch (err) {
    throw userUpdatedButReadFailed(err, userId);
  }
}

/**********************************************************************************/

async function isAllowedToUpdate(db: DatabaseHandler, userId: string) {
  const users = await executePreparedQuery({
    db: db,
    queryName: 'isUserActiveQuery',
    phValues: { userId: userId },
    debug: { instance: userDebug, msg: 'Checking whether user is active' }
  });
  if (!users.length) {
    throw userNotFoundError(userId);
  }
  if (!users[0].isActive) {
    throw userNotAllowedToBeUpdated(userId);
  }
}

async function updateUserInfo(params: {
  transaction: Transaction;
  models: DBModels;
  userInfo: Omit<UserUpdateOneValidationData, 'password' | 'userId'>;
  userId: string;
  updatedAt: string;
}) {
  const {
    transaction,
    models: {
      user: { userInfoModel }
    },
    userInfo,
    userId,
    updatedAt
  } = params;

  if (!objHasValues(userInfo)) {
    return;
  }

  userDebug('Updating user info entry');
  // Since the update is dynamic (different fields are possible each time, there's
  // no point of using prepared statements, it has no benefit)
  const updates = await transaction
    .update(userInfoModel)
    .set({ ...userInfo, updatedAt: updatedAt })
    .where(eq(userInfoModel.id, userId))
    .returning({ userId: userInfoModel.id });
  userDebug('Done updating user info entry');
  if (!updates.length) {
    throw userNotFoundError(userId);
  }
}

async function updateUserCredentials(params: {
  transaction: Transaction;
  models: DBModels;
  credentials: Pick<UserUpdateOneValidationData, 'email' | 'password'>;
  userId: string;
  updatedAt: string;
}) {
  const {
    transaction,
    models: {
      user: { userCredentialsModel }
    },
    credentials,
    userId,
    updatedAt
  } = params;

  if (!objHasValues(credentials)) {
    return;
  }

  userDebug('Updating user credentials entry');
  // Since the update is dynamic (different fields are possible each time, there's
  // no point of using prepared statements, it has no benefit)
  const updates = await transaction
    .update(userCredentialsModel)
    .set({
      ...credentials,
      updatedAt: updatedAt
    })
    .where(eq(userCredentialsModel.userId, userId))
    .returning({ userId: userCredentialsModel.userId });
  userDebug('Done updating user credentials entry');
  if (!updates.length) {
    throw userNotFoundError(userId);
  }
}
