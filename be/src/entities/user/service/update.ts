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

import { asyncDebugWrapper, executePreparedQuery } from '../../utils.js';

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
  const { userInfoModel, userCredentialsModel } = db.getModels();

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
    return (
      await asyncDebugWrapper(
        async () => {
          return await executePreparedQuery({
            db: db,
            queryName: 'readUserQuery',
            phValues: { userId: userId }
          });
        },
        { instance: userDebug, msg: 'Fetching user after update' }
      )
    )[0];
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

  const userIds = await asyncDebugWrapper(
    async () => {
      return await executePreparedQuery({
        db: db,
        queryName: 'reactivateUser',
        phValues: { userId: userId }
      });
    },
    { instance: userDebug, msg: 'Reactivating user' }
  );
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
  const { userCredentialsModel, userSettingsModel } = db.getModels();

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
  userCredentialsModel: DBModels['userCredentialsModel'];
  userId: string;
}) {
  const { handler, userCredentialsModel, userId } = params;

  const usersStatuses = await asyncDebugWrapper(
    async () => {
      return await handler
        .select({ archivedAt: userCredentialsModel.archivedAt })
        .from(userCredentialsModel)
        .where(eq(userCredentialsModel.userId, userId));
    },
    { instance: userDebug, msg: 'Checking whether the user is archived' }
  );
  if (!usersStatuses.length) {
    throw userNotFoundError(userId);
  }
  if (usersStatuses[0].archivedAt) {
    throw userNotAllowedToBeUpdated(userId);
  }
}

async function updateUserInfo(params: {
  handler: DBHandler;
  userInfoModel: DBModels['userInfoModel'];
  userInfo: Omit<UpdateUserValidationData, 'password' | 'userId'>;
  userId: string;
  updatedAt: string;
}) {
  const { handler, userInfoModel, userInfo, userId, updatedAt } = params;

  if (!objHasValues(userInfo)) {
    return;
  }

  const updates = await asyncDebugWrapper(
    async () => {
      return await handler
        .update(userInfoModel)
        .set({ ...userInfo, updatedAt: updatedAt })
        .where(eq(userInfoModel.id, userId))
        .returning({ userId: userInfoModel.id });
    },
    { instance: userDebug, msg: 'Updating user info entry' }
  );
  if (!updates.length) {
    throw userNotFoundError(userId);
  }
}

async function updateUserCredentials(params: {
  handler: DBHandler;
  userCredentialsModel: DBModels['userCredentialsModel'];
  credentials: Pick<UpdateUserValidationData, 'email' | 'password'>;
  userId: string;
  updatedAt: string;
}) {
  const { handler, userCredentialsModel, credentials, userId, updatedAt } =
    params;

  if (!objHasValues(credentials)) {
    return;
  }

  const updates = await asyncDebugWrapper(
    async () => {
      return await handler
        .update(userCredentialsModel)
        .set({
          ...credentials,
          updatedAt: updatedAt
        })
        .where(eq(userCredentialsModel.userId, userId))
        .returning({ userId: userCredentialsModel.userId });
    },
    { instance: userDebug, msg: 'Updating user credentials entry' }
  );
  if (!updates.length) {
    throw userNotFoundError(userId);
  }
}

async function updateUserSettingsEntry(params: {
  handler: DBHandler;
  userSettingsModel: DBModels['userSettingsModel'];
  userSettingsUpdates: UpdateUserSettingsValidationData;
}) {
  const {
    handler,
    userSettingsModel,
    userSettingsUpdates: { userId, ...settingsUpdates }
  } = params;

  const updatedUserSettings = await asyncDebugWrapper(
    async () => {
      return await handler
        .update(userSettingsModel)
        .set(settingsUpdates)
        .where(eq(userSettingsModel.userId, userId))
        .returning({
          darkMode: userSettingsModel.darkMode
        });
    },
    { instance: userDebug, msg: 'Updating user settings entry' }
  );
  if (!updatedUserSettings.length) {
    throw userNotFoundError(userId);
  }

  return updatedUserSettings[0];
}
