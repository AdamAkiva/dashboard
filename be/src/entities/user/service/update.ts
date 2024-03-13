import type { DBHandler, DBModels } from '../../../db/index.js';
import {
  eq,
  userDebug,
  type RequestContext,
  type User
} from '../../../types/index.js';
import { objHasValues } from '../../../utils/index.js';

import { executePreparedQuery } from '../../utils/index.js';

import type {
  reactivateOne as reactivateOneValidation,
  updateOne as updateOneValidation
} from '../validator.js';

import {
  userAlreadyActive,
  userNotAllowedToBeUpdated,
  userNotFoundError,
  userUpdateError,
  userUpdatedReadFailed
} from './utils.js';

/**********************************************************************************/

type UserUpdateOneValidationData = ReturnType<typeof updateOneValidation>;
type UserReactivateOneValidationData = ReturnType<
  typeof reactivateOneValidation
>;

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
          handler: transaction,
          models: { userCredentialsModel: userCredentialsModel },
          userId: userId
        }),
        updateUserInfo({
          handler: transaction,
          models: { userInfoModel: userInfoModel },
          userInfo: userInfo,
          userId: userId,
          updatedAt: updatedAt
        }),
        updateUserCredentials({
          handler: transaction,
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
    userDebug('Fetching user after update');
    const [user] = await executePreparedQuery({
      db: db,
      queryName: 'readUserQuery',
      phValues: { userId: userId }
    });
    userDebug('Done fetching user after update');

    return user;
  } catch (err) {
    throw userUpdatedReadFailed({
      err: err,
      userId: userId,
      logger: logger
    });
  }
}

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

async function isAllowedToUpdate(params: {
  handler: DBHandler;
  models: { userCredentialsModel: DBModels['user']['userCredentialsModel'] };
  userId: string;
}) {
  const {
    handler,
    models: { userCredentialsModel },
    userId
  } = params;

  userDebug('Checking whether the user is archived');
  const usersStatus = await handler
    .select({ archivedAt: userCredentialsModel.archivedAt })
    .from(userCredentialsModel)
    .where(eq(userCredentialsModel.userId, userId));
  userDebug('Done checking whether the user is archived');
  if (!usersStatus.length) {
    throw userNotFoundError(userId);
  }
  if (usersStatus[0].archivedAt) {
    throw userNotAllowedToBeUpdated(userId);
  }
}

async function updateUserInfo(params: {
  handler: DBHandler;
  models: { userInfoModel: DBModels['user']['userInfoModel'] };
  userInfo: Omit<UserUpdateOneValidationData, 'password' | 'userId'>;
  userId: string;
  updatedAt: string;
}) {
  const {
    handler,
    models: { userInfoModel },
    userInfo,
    userId,
    updatedAt
  } = params;

  if (!objHasValues(userInfo)) {
    return;
  }

  userDebug('Updating user info entry');
  const updates = await handler
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
  handler: DBHandler;
  models: { userCredentialsModel: DBModels['user']['userCredentialsModel'] };
  credentials: Pick<UserUpdateOneValidationData, 'email' | 'password'>;
  userId: string;
  updatedAt: string;
}) {
  const {
    handler,
    models: { userCredentialsModel },
    credentials,
    userId,
    updatedAt
  } = params;

  if (!objHasValues(credentials)) {
    return;
  }

  userDebug('Updating user credentials entry');
  const updates = await handler
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

  userDebug('Checking whether the user is archived');
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
  userDebug('Done checking whether the user is archived');

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
