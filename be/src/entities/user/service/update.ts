import type { DBModels, Transaction } from '../../../db/index.js';
import { userDebug, type RequestContext } from '../../../types/index.js';
import {
  getPreparedStatements,
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
) {
  const { db } = ctx;
  const handler = db.getHandler();
  const models = db.getModels();
  const { readUserQuery } = getPreparedStatements(handler, models);

  const { password, userId, ...userInfo } = updates;
  const updatedAt = new Date().toISOString();

  await handler.transaction(async (transaction) => {
    const results = await Promise.allSettled([
      isAllowedToUpdate({
        transaction: transaction,
        models: models,
        userId: userId
      }),
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
    userDebug('Fetching user after update');
    const updatedUser = (await readUserQuery.execute({ userId: userId }))[0];
    userDebug('Done fetching user after update');

    return updatedUser;
  } catch (err) {
    throw userUpdatedButReadFailed(userId, err);
  }
}

/**********************************************************************************/

async function isAllowedToUpdate(params: {
  transaction: Transaction;
  models: DBModels;
  userId: string;
}) {
  const { transaction, models, userId } = params;
  const { isUserActiveQuery } = getPreparedStatements(transaction, models);

  userDebug('Checking whether user is active');
  const users = await isUserActiveQuery.execute({
    userId: userId
  });
  userDebug('Done checking whether user is active');
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
  const { transaction, models, userInfo, userId, updatedAt } = params;
  const { updateUserInfoQuery } = getPreparedStatements(transaction, models);

  if (!Object.keys(userInfo).length) {
    return;
  }

  userDebug('Updating user info entry');
  const updates = await updateUserInfoQuery.execute({
    ...userInfo,
    userId: userId,
    updatedAt: updatedAt
  });
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
  const { transaction, models, credentials, userId, updatedAt } = params;
  const { updateUserCredentialsQuery } = getPreparedStatements(
    transaction,
    models
  );

  if (!Object.keys(credentials).length) {
    return;
  }

  userDebug('Updating user credentials entry');
  const updates = await updateUserCredentialsQuery.execute({
    ...credentials,
    userId: userId,
    updatedAt: updatedAt
  });
  userDebug('Done updating user credentials entry');
  if (!updates.length) {
    throw userNotFoundError(userId);
  }
}
