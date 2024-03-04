import type { DBModels, Transaction } from '../../../db/index.js';
import {
  userDebug,
  type RequestContext,
  type User
} from '../../../types/index.js';

import { userCreationError } from '../../utils/service.js';

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
  const {
    user: { userInfoModel, userCredentialsModel, userSettingsModel }
  } = db.getModels();

  const { password, ...userInfo } = userData;
  const createdAt = new Date().toISOString();

  return await handler.transaction(async (transaction) => {
    try {
      const userId = await createUserInfo({
        transaction: transaction,
        models: { userInfoModel: userInfoModel },
        userInfo: userInfo,
        createdAt: createdAt
      });
      const results = await Promise.allSettled([
        createUserCredentials({
          transaction: transaction,
          models: { userCredentialsModel: userCredentialsModel },
          credentials: {
            email: userInfo.email,
            password: password
          },
          userId: userId,
          createdAt: createdAt
        }),
        createUserDefaultSettings({
          transaction: transaction,
          models: { userSettingsModel: userSettingsModel },
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
  transaction: Transaction;
  models: { userInfoModel: DBModels['user']['userInfoModel'] };
  userInfo: Omit<UserCreateOneValidationData, 'password'>;
  createdAt: string;
}) {
  const {
    transaction,
    models: { userInfoModel },
    userInfo,
    createdAt
  } = params;

  userDebug('Creating user info entry');
  const userId = (
    await transaction
      .insert(userInfoModel)
      .values({
        ...userInfo,
        createdAt: createdAt
      })
      .returning({ userId: userInfoModel.id })
  )[0].userId;
  userDebug('Done creating user info entry');

  return userId;
}

async function createUserCredentials(params: {
  transaction: Transaction;
  models: { userCredentialsModel: DBModels['user']['userCredentialsModel'] };
  credentials: Pick<UserCreateOneValidationData, 'email' | 'password'>;
  userId: string;
  createdAt: string;
}) {
  const {
    transaction,
    models: { userCredentialsModel },
    credentials,
    userId,
    createdAt
  } = params;

  userDebug('Creating user credentials entry');
  await transaction.insert(userCredentialsModel).values({
    ...credentials,
    userId: userId,
    createdAt: createdAt
  });
  userDebug('Done creating user credentials entry');
}

async function createUserDefaultSettings(params: {
  transaction: Transaction;
  models: { userSettingsModel: DBModels['user']['userSettingsModel'] };
  userId: string;
  createdAt: string;
}) {
  const {
    transaction,
    models: { userSettingsModel },
    userId,
    createdAt
  } = params;

  userDebug('Creating default user settings entry');
  await transaction
    .insert(userSettingsModel)
    .values({ userId: userId, createdAt: createdAt });
  userDebug('Done creating default user settings entry');
}
