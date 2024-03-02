import type { DBHandler, DBModels, Transaction } from '../../../db/index.js';
import {
  eq,
  userDebug,
  type RequestContext,
  type User
} from '../../../types/index.js';

import { userAlreadyActive, userNotFoundError } from '../../utils/index.js';

import type { reactivateOne as reactivateOneValidation } from '../validator.js';

/**********************************************************************************/

type UserReactivateOneValidationData = ReturnType<
  typeof reactivateOneValidation
>;

/**********************************************************************************/

export async function reactivateOne(
  ctx: RequestContext,
  userId: UserReactivateOneValidationData
): Promise<User> {
  const { db } = ctx;
  const handler = db.getHandler();
  const {
    user: { userInfoModel, userCredentialsModel, userSettingsModel }
  } = db.getModels();

  const users = await checkUserStatus({
    handler: handler,
    models: {
      userInfoModel: userInfoModel,
      userCredentialsModel: userCredentialsModel
    },
    userId: userId
  });
  if (!users.length) {
    throw userNotFoundError(userId);
  }
  if (users[0].isActive) {
    throw userAlreadyActive(userId);
  }

  await handler.transaction(async (transaction) => {
    const updatedAt = new Date().toISOString();

    const results = await Promise.allSettled([
      reactivateUser({
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

  return {
    ...users[0],
    isActive: true
  };
}

/**********************************************************************************/

async function checkUserStatus(params: {
  handler: DBHandler;
  models: {
    userInfoModel: DBModels['user']['userInfoModel'];
    userCredentialsModel: DBModels['user']['userCredentialsModel'];
  };
  userId: string;
}) {
  const {
    handler,
    models: { userInfoModel, userCredentialsModel },
    userId
  } = params;

  userDebug('Checking whether the user is active');
  const users = await handler
    .select({
      id: userInfoModel.id,
      email: userInfoModel.email,
      firstName: userInfoModel.firstName,
      lastName: userInfoModel.lastName,
      phone: userInfoModel.phone,
      gender: userInfoModel.gender,
      address: userInfoModel.address,
      createdAt: userInfoModel.createdAt,
      isActive: userCredentialsModel.isActive
    })
    .from(userInfoModel)
    .where(eq(userInfoModel.id, userId))
    .innerJoin(userCredentialsModel, eq(userCredentialsModel.userId, userId));
  userDebug('Done checking whether the user is active');

  return users;
}

async function reactivateUser(params: {
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

  userDebug('Reactivating user');
  await transaction
    .update(userCredentialsModel)
    .set({ isActive: true, updatedAt: updatedAt })
    .where(eq(userCredentialsModel.userId, userId));
  userDebug('Done reactivating user');
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
