import type { DBHandler, DBModels } from '../../../db/index.js';
import {
  eq,
  userDebug,
  type ReactivatedUser,
  type RequestContext,
  type UpdatedUser
} from '../../../types/index.js';
import { objHasValues } from '../../../utils/index.js';

import { executePreparedQuery } from '../../utils/index.js';

import type {
  reactivateUser as reactivateUserValidation,
  updateUser as updateUserValidation
} from '../validator.js';

import {
  userNotAllowedToBeUpdated,
  userNotFoundError,
  userUpdateError,
  userUpdatedReadFailed
} from './utils.js';

/**********************************************************************************/

type UpdateUserValidationData = ReturnType<typeof updateUserValidation>;
type ReactivateUserValidationData = ReturnType<typeof reactivateUserValidation>;

/**********************************************************************************/

export async function updateUser(
  ctx: RequestContext,
  updates: UpdateUserValidationData
): Promise<UpdatedUser> {
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

export async function reactivateUser(
  ctx: RequestContext,
  userId: ReactivateUserValidationData
): Promise<ReactivatedUser> {
  const { db } = ctx;

  userDebug('Reactivating user');
  const userIds = await executePreparedQuery({
    db: db,
    queryName: 'reactivateUser',
    phValues: { userId: userId }
  });
  userDebug('Done reactivating user');
  if (!userIds.length) {
    throw userNotFoundError(userId);
  }

  return userIds[0].userId;
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
  userInfo: Omit<UpdateUserValidationData, 'password' | 'userId'>;
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
  credentials: Pick<UpdateUserValidationData, 'email' | 'password'>;
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
