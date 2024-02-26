import type { DBHandler, DBModels } from '../../../db/index.js';
import {
  userDebug,
  type RequestContext,
  type User
} from '../../../types/index.js';
import type { createOne as createOneValidation } from '../validator.js';

/**********************************************************************************/

type UserCreateOneValidationData = ReturnType<typeof createOneValidation>;

/**********************************************************************************/

export async function createOne(
  ctx: RequestContext,
  args: UserCreateOneValidationData
): Promise<User> {
  const { db } = ctx;
  const handler = db.getHandler();
  const models = db.getModels();

  const { password, ...userInfo } = args;
  const createdAt = new Date().toISOString();

  const userId = await createUser({
    handler: handler,
    models: models,
    userInfo: userInfo,
    createdAt: createdAt
  });
  await Promise.allSettled([
    createCredentials({
      handler: handler,
      models: models,
      credentials: {
        userId: userId,
        email: userInfo.email,
        password: password
      },
      createdAt: createdAt
    }),
    createDefaultSettings({
      handler: handler,
      models: models,
      userId: userId,
      createdAt: createdAt
    })
  ]);

  return {
    ...userInfo,
    id: userId,
    createdAt: createdAt
  };
}

async function createUser(params: {
  handler: DBHandler;
  models: DBModels;
  userInfo: Omit<UserCreateOneValidationData, 'password'>;
  createdAt: string;
}) {
  const {
    handler,
    models: {
      user: { userModel }
    },
    userInfo,
    createdAt
  } = params;

  userDebug('Creating user entry');
  const userId = (
    await handler
      .insert(userModel)
      .values({
        ...userInfo,
        createdAt: createdAt
      })
      .returning({ userId: userModel.id })
  )[0].userId;
  userDebug('Done creating user entry');

  return userId;
}

async function createCredentials(params: {
  handler: DBHandler;
  models: DBModels;
  credentials: { userId: string; email: string; password: string };
  createdAt: string;
}) {
  const {
    handler,
    models: {
      user: { userCredentialsModel }
    },
    credentials,
    createdAt
  } = params;

  userDebug('Creating user credentials entry');
  await handler.insert(userCredentialsModel).values({
    ...credentials,
    createdAt: createdAt
  });
  userDebug('Done creating user credentials entry');
}

async function createDefaultSettings(params: {
  handler: DBHandler;
  models: DBModels;
  userId: string;
  createdAt: string;
}) {
  const {
    handler,
    models: {
      user: { userSettingsModel }
    },
    userId,
    createdAt
  } = params;

  userDebug('Creating default user settings entry');
  await handler
    .insert(userSettingsModel)
    .values({ userId: userId, createdAt: createdAt });
  userDebug('Done creating user default settings entry');
}
