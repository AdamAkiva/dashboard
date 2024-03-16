import type { DBHandler, DBModels } from '../../../db/index.js';
import {
  userDebug,
  type CreatedUser,
  type RequestContext
} from '../../../types/index.js';

import type { createUser as createUserValidation } from '../validator.js';

import { userCreationError } from './utils.js';

/**********************************************************************************/

type CreateUserValidationData = ReturnType<typeof createUserValidation>;

/**********************************************************************************/

export async function createUser(
  ctx: RequestContext,
  userData: CreateUserValidationData
): Promise<CreatedUser> {
  const { db } = ctx;
  const handler = db.getHandler();
  const {
    user: { userInfoModel, userCredentialsModel, userSettingsModel }
  } = db.getModels();

  const { password, ...userInfo } = userData;
  const creationDate = new Date().toISOString();

  let userId = '';
  try {
    await handler.transaction(async (transaction) => {
      userId = await createUserInfoEntry({
        handler: transaction,
        userInfoModel: userInfoModel,
        userInfo: userInfo,
        creationDate: creationDate
      });

      const results = await Promise.allSettled([
        createUserCredentialsEntry({
          handler: transaction,
          userCredentialsModel: userCredentialsModel,
          userCredentialsInfo: {
            email: userInfo.email,
            password: password
          },
          userId: userId,
          creationDate: creationDate
        }),
        createDefaultUserSettingsEntry({
          handler: transaction,
          userSettingsModel: userSettingsModel,
          userId: userId,
          creationDate: creationDate
        })
      ]);
      for (const result of results) {
        if (result.status === 'rejected') {
          throw result.reason;
        }
      }
    });
  } catch (err) {
    throw userCreationError(err, userInfo.email);
  }

  return {
    ...userInfo,
    id: userId
  };
}

/**********************************************************************************/

async function createUserInfoEntry(params: {
  handler: DBHandler;
  userInfoModel: DBModels['user']['userInfoModel'];
  userInfo: Omit<CreateUserValidationData, 'password'>;
  creationDate: string;
}) {
  const { handler, userInfoModel, userInfo, creationDate } = params;

  userDebug('Creating user info entry');
  const userId = (
    await handler
      .insert(userInfoModel)
      .values({
        ...userInfo,
        createdAt: creationDate,
        updatedAt: creationDate
      })
      .returning({ userId: userInfoModel.id })
  )[0].userId;
  userDebug('Done creating user info entry');

  return userId;
}

async function createUserCredentialsEntry(params: {
  handler: DBHandler;
  userCredentialsModel: DBModels['user']['userCredentialsModel'];
  userCredentialsInfo: Pick<CreateUserValidationData, 'email' | 'password'>;
  userId: string;
  creationDate: string;
}) {
  const {
    handler,
    userCredentialsModel,
    userCredentialsInfo,
    userId,
    creationDate
  } = params;

  userDebug('Creating user credentials entry');
  await handler.insert(userCredentialsModel).values({
    userId: userId,
    ...userCredentialsInfo,
    createdAt: creationDate,
    updatedAt: creationDate
  });
  userDebug('Done creating user credentials entry');
}

async function createDefaultUserSettingsEntry(params: {
  handler: DBHandler;
  userSettingsModel: DBModels['user']['userSettingsModel'];
  userId: string;
  creationDate: string;
}) {
  const { handler, userSettingsModel, userId, creationDate } = params;

  userDebug('Creating default user settings entry');
  await handler.insert(userSettingsModel).values({
    userId: userId,
    createdAt: creationDate,
    updatedAt: creationDate
  });
  userDebug('Done creating default user settings entry');
}
