import type { DBModels, Transaction } from '../../../db/index.js';
import {
  userDebug,
  type RequestContext,
  type User
} from '../../../types/index.js';
import { getPreparedStatements } from '../../utils/index.js';
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
  const models = db.getModels();

  const { password, ...userInfo } = userData;
  const createdAt = new Date().toISOString();

  return await handler.transaction(async (transaction) => {
    const user = await activateUser({
      transaction: transaction,
      models: models,
      email: userInfo.email
    });
    if (user) {
      return user;
    }

    const userId = await createUserInfo({
      transaction: transaction,
      models: models,
      userInfo: userInfo,
      createdAt: createdAt
    });
    const results = await Promise.allSettled([
      createUserCredentials({
        transaction: transaction,
        models: models,
        credentials: {
          email: userInfo.email,
          password: password
        },
        userId: userId,
        createdAt: createdAt
      }),
      createUserDefaultSettings({
        transaction: transaction,
        models: models,
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
  });
}

/**********************************************************************************/

async function activateUser(params: {
  transaction: Transaction;
  models: DBModels;
  email: string;
}) {
  const { transaction, models, email } = params;
  const { activateUser, readUserQuery } = getPreparedStatements(
    transaction,
    models
  );

  const users = await activateUser.execute({ email: email });
  if (!users.length) {
    return undefined;
  }

  return (await readUserQuery.execute({ userId: users[0].userId }))[0];
}

async function createUserInfo(params: {
  transaction: Transaction;
  models: DBModels;
  userInfo: Omit<UserCreateOneValidationData, 'password'>;
  createdAt: string;
}) {
  const { transaction, models, userInfo, createdAt } = params;
  const { createUserInfoQuery } = getPreparedStatements(transaction, models);

  userDebug('Creating user info entry');
  const userId = (
    await createUserInfoQuery.execute({
      ...userInfo,
      createdAt: createdAt
    })
  )[0].userId;
  userDebug('Done creating user info entry');

  return userId;
}

async function createUserCredentials(params: {
  transaction: Transaction;
  models: DBModels;
  credentials: Pick<UserCreateOneValidationData, 'email' | 'password'>;
  userId: string;
  createdAt: string;
}) {
  const { transaction, models, credentials, userId, createdAt } = params;
  const { createCredentialsQuery } = getPreparedStatements(transaction, models);

  userDebug('Creating user credentials entry');
  await createCredentialsQuery.execute({
    ...credentials,
    userId: userId,
    createdAt: createdAt
  });
  userDebug('Done creating user credentials entry');
}

async function createUserDefaultSettings(params: {
  transaction: Transaction;
  models: DBModels;
  userId: string;
  createdAt: string;
}) {
  const { transaction, models, userId, createdAt } = params;
  const { createDefaultSettingsQuery } = getPreparedStatements(
    transaction,
    models
  );

  userDebug('Creating default user settings entry');
  await createDefaultSettingsQuery.execute({
    userId: userId,
    createdAt: createdAt
  });
  userDebug('Done creating user default settings entry');
}
