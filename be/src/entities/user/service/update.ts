import type { DBHandler, DBModels } from '../../../db/index.js';
import {
  eq,
  userDebug,
  type ReactivatedUser,
  type RequestContext,
  type ResolvedValue,
  type UpdatedUser,
  type UpdatedUserSettings
} from '../../../types/index.js';
import { objHasValues } from '../../../utils/index.js';

import { executePreparedQuery } from '../../utils.js';

import type {
  reactivateUser as reactivateUserValidation,
  updateUserSettings as updateUserSettingsValidation,
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
type UpdateUserSettingsValidationData = ReturnType<
  typeof updateUserSettingsValidation
>;

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
          userCredentialsModel: userCredentialsModel,
          userId: userId
        }),
        updateUserInfo({
          handler: transaction,
          userInfoModel: userInfoModel,
          userInfo: userInfo,
          userId: userId,
          updatedAt: updatedAt
        }),
        updateUserCredentials({
          handler: transaction,
          userCredentialsModel: userCredentialsModel,
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

export async function updateUserSettings(
  ctx: RequestContext,
  userSettingsUpdates: UpdateUserSettingsValidationData
): Promise<UpdatedUserSettings> {
  const { db } = ctx;
  const handler = db.getHandler();
  const {
    user: { userCredentialsModel, userSettingsModel }
  } = db.getModels();

  const results = await Promise.allSettled([
    isAllowedToUpdate({
      handler: handler,
      userCredentialsModel: userCredentialsModel,
      userId: userSettingsUpdates.userId
    }),
    updateUserSettingsEntry({
      handler: handler,
      userSettingsModel: userSettingsModel,
      userSettingsUpdates: userSettingsUpdates
    })
  ]);
  for (const result of results) {
    if (result.status === 'rejected') {
      throw result.reason;
    }
  }

  return (
    results[1] as ResolvedValue<ReturnType<typeof updateUserSettingsEntry>>
  ).value;
}

/**********************************************************************************/

async function isAllowedToUpdate(params: {
  handler: DBHandler;
  userCredentialsModel: DBModels['user']['userCredentialsModel'];
  userId: string;
}) {
  const { handler, userCredentialsModel, userId } = params;

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
  userInfoModel: DBModels['user']['userInfoModel'];
  userInfo: Omit<UpdateUserValidationData, 'password' | 'userId'>;
  userId: string;
  updatedAt: string;
}) {
  const { handler, userInfoModel, userInfo, userId, updatedAt } = params;

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
  userCredentialsModel: DBModels['user']['userCredentialsModel'];
  credentials: Pick<UpdateUserValidationData, 'email' | 'password'>;
  userId: string;
  updatedAt: string;
}) {
  const { handler, userCredentialsModel, credentials, userId, updatedAt } =
    params;

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

async function updateUserSettingsEntry(params: {
  handler: DBHandler;
  userSettingsModel: DBModels['user']['userSettingsModel'];
  userSettingsUpdates: UpdateUserSettingsValidationData;
}) {
  const {
    handler,
    userSettingsModel,
    userSettingsUpdates: { userId, ...settingsUpdates }
  } = params;

  userDebug('Updating user settings entry');
  const updatedUserSettings = await handler
    .update(userSettingsModel)
    .set(settingsUpdates)
    .where(eq(userSettingsModel.userId, userId))
    .returning({
      darkMode: userSettingsModel.darkMode
    });
  userDebug('Done updating user settings entry');
  if (!updatedUserSettings.length) {
    throw userNotFoundError(userId);
  }

  return updatedUserSettings[0];
}
