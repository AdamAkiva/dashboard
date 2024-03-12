import type { DBHandler, DBModels } from '../../../db/index.js';
import {
  eq,
  userDebug,
  type RequestContext,
  type User
} from '../../../types/index.js';

import type { reactivateOne as reactivateOneValidation } from '../validator.js';

import { userAlreadyActive, userNotFoundError } from './utils.js';

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
    user: { userInfoModel, userCredentialsModel }
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
  if (!users[0].archivedAt) {
    throw userAlreadyActive(userId);
  }

  await reactivateUser({
    handler: handler,
    models: { userCredentialsModel: userCredentialsModel },
    userId: userId
  });

  return {
    ...users[0]
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
      archivedAt: userCredentialsModel.archivedAt
    })
    .from(userInfoModel)
    .where(eq(userInfoModel.id, userId))
    .innerJoin(userCredentialsModel, eq(userCredentialsModel.userId, userId));
  userDebug('Done checking whether the user is active');

  return users;
}

async function reactivateUser(params: {
  handler: DBHandler;
  models: { userCredentialsModel: DBModels['user']['userCredentialsModel'] };
  userId: string;
}) {
  const {
    handler,
    models: { userCredentialsModel },
    userId
  } = params;

  userDebug('Reactivating user');
  await handler
    .update(userCredentialsModel)
    .set({ archivedAt: null })
    .where(eq(userCredentialsModel.userId, userId));
  userDebug('Done reactivating user');
}
