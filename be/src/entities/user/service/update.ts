import type { DBModels, Transaction } from '../../../db/index.js';
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
  userUpdateError,
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
  const { db, logger } = ctx;
  const handler = db.getHandler();
  const {
    user: { userInfoModel, userCredentialsModel }
  } = db.getModels();

  const { password, userId, ...userInfo } = updates;
  const updatedAt = new Date().toISOString();

  await handler.transaction(async (transaction) => {
    try {
      const results = await Promise.allSettled([
        isAllowedToUpdate({
          transaction: transaction,
          models: { userCredentialsModel: userCredentialsModel },
          userId: userId
        }),
        updateUserInfo({
          transaction: transaction,
          models: { userInfoModel: userInfoModel },
          userInfo: userInfo,
          userId: userId,
          updatedAt: updatedAt
        }),
        updateUserCredentials({
          transaction: transaction,
          models: { userCredentialsModel: userCredentialsModel },
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
    } catch (err) {
      throw userUpdateError(err, updates.email);
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
    throw userUpdatedButReadFailed({
      err: err,
      userId: userId,
      logger: logger
    });
  }
}

/**********************************************************************************/

async function isAllowedToUpdate(params: {
  transaction: Transaction;
  models: { userCredentialsModel: DBModels['user']['userCredentialsModel'] };
  userId: string;
}) {
  const {
    transaction,
    models: { userCredentialsModel },
    userId
  } = params;
  const usersStatus = await transaction
    .select({ isActive: userCredentialsModel.isActive })
    .from(userCredentialsModel)
    .where(eq(userCredentialsModel.userId, userId));
  if (!usersStatus.length) {
    throw userNotFoundError(userId);
  }
  if (!usersStatus[0].isActive) {
    throw userNotAllowedToBeUpdated(userId);
  }
}

async function updateUserInfo(params: {
  transaction: Transaction;
  models: { userInfoModel: DBModels['user']['userInfoModel'] };
  userInfo: Omit<UserUpdateOneValidationData, 'password' | 'userId'>;
  userId: string;
  updatedAt: string;
}) {
  const {
    transaction,
    models: { userInfoModel },
    userInfo,
    userId,
    updatedAt
  } = params;

  if (!objHasValues(userInfo)) {
    return;
  }

  userDebug('Updating user info entry');
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
  models: { userCredentialsModel: DBModels['user']['userCredentialsModel'] };
  credentials: Pick<UserUpdateOneValidationData, 'email' | 'password'>;
  userId: string;
  updatedAt: string;
}) {
  const {
    transaction,
    models: { userCredentialsModel },
    credentials,
    userId,
    updatedAt
  } = params;

  if (!objHasValues(credentials)) {
    return;
  }

  userDebug('Updating user credentials entry');
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
