import type { DBHandler, DBModels, Transaction } from '../../../db/index.js';
import { eq, userDebug, type RequestContext } from '../../../types/index.js';

import type { deleteOne as deleteOneValidation } from '../validator.js';

/**********************************************************************************/

type UserDeleteOneValidationData = ReturnType<typeof deleteOneValidation>;

/**********************************************************************************/

export async function deleteOne(
  ctx: RequestContext,
  userId: UserDeleteOneValidationData
): Promise<string> {
  const { db } = ctx;
  const handler = db.getHandler();
  const {
    user: { userInfoModel, userCredentialsModel, userSettingsModel }
  } = db.getModels();

  const usersStatuses = await getUserStatus({
    handler: handler,
    models: { userCredentialsModel: userCredentialsModel },
    userId: userId
  });
  if (!usersStatuses.length) {
    return '';
  }

  if (!usersStatuses[0].isActive) {
    await deleteUser({
      handler: handler,
      models: { userInfoModel: userInfoModel },
      userId: userId
    });

    return userId;
  }

  await handler.transaction(async (transaction) => {
    const updatedAt = new Date().toISOString();

    const results = await Promise.allSettled([
      deactivateUser({
        transaction: transaction,
        models: { userCredentialsModel: userCredentialsModel },
        userId: userId,
        updatedAt: updatedAt
      }),
      updateUserInfoTimestamp({
        transaction: transaction,
        models: { userInfoModel: userInfoModel },
        userId: userId,
        updatedAt: updatedAt
      }),
      updateUserSettingsTimestamp({
        transaction: transaction,
        models: { userSettingsModel: userSettingsModel },
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

  return userId;
}

/**********************************************************************************/

async function getUserStatus(params: {
  handler: DBHandler;
  models: { userCredentialsModel: DBModels['user']['userCredentialsModel'] };
  userId: string;
}) {
  const {
    handler,
    models: { userCredentialsModel },
    userId
  } = params;
  userDebug('Checking whether the user is active');
  const isActive = await handler
    .select({ isActive: userCredentialsModel.isActive })
    .from(userCredentialsModel)
    .where(eq(userCredentialsModel.userId, userId));
  userDebug('Done checking whether the user is active');

  return isActive;
}

async function deleteUser(params: {
  handler: DBHandler;
  models: { userInfoModel: DBModels['user']['userInfoModel'] };
  userId: string;
}) {
  const {
    handler,
    models: { userInfoModel },
    userId
  } = params;

  userDebug('Deleting user');
  await handler.delete(userInfoModel).where(eq(userInfoModel.id, userId));
  userDebug('Done deleting user');
}

async function deactivateUser(params: {
  transaction: Transaction;
  models: { userCredentialsModel: DBModels['user']['userCredentialsModel'] };
  userId: string;
  updatedAt: string;
}) {
  const {
    transaction,
    models: { userCredentialsModel },
    userId,
    updatedAt
  } = params;

  userDebug('Deactivating user');
  await transaction
    .update(userCredentialsModel)
    .set({ isActive: false, updatedAt: updatedAt })
    .where(eq(userCredentialsModel.userId, userId));
  userDebug('Done deactivating user');
}

async function updateUserInfoTimestamp(params: {
  transaction: Transaction;
  models: { userInfoModel: DBModels['user']['userInfoModel'] };
  userId: string;
  updatedAt: string;
}) {
  const {
    transaction,
    models: { userInfoModel },
    userId,
    updatedAt
  } = params;

  userDebug('Updating user info timestamp');
  await transaction
    .update(userInfoModel)
    .set({ updatedAt: updatedAt })
    .where(eq(userInfoModel.id, userId));
  userDebug('Done updating user info timestamp');
}

async function updateUserSettingsTimestamp(params: {
  transaction: Transaction;
  models: { userSettingsModel: DBModels['user']['userSettingsModel'] };
  userId: string;
  updatedAt: string;
}) {
  const {
    transaction,
    models: { userSettingsModel },
    userId,
    updatedAt
  } = params;

  userDebug('Updating user settings timestamp');
  await transaction
    .update(userSettingsModel)
    .set({ updatedAt: updatedAt })
    .where(eq(userSettingsModel.userId, userId));
  userDebug('Done updating user settings timestamp');
}
