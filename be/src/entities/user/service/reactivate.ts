import type { DatabaseHandler } from '../../../db/index.js';
import {
  userDebug,
  type RequestContext,
  type User
} from '../../../types/index.js';

import {
  executePreparedQuery,
  userAlreadyActive,
  userNotFoundError
} from '../../utils/index.js';

import type { reactivateOne as reactivateOneValidation } from '../validator.js';

/**********************************************************************************/

type UserReactivateOneValidationData = ReturnType<
  typeof reactivateOneValidation
>;
type UserUpdateQueryArguments = { userId: string; updatedAt: string };

/**********************************************************************************/

export async function reactivateOne(
  ctx: RequestContext,
  userId: UserReactivateOneValidationData
): Promise<User> {
  const { db } = ctx;
  const handler = db.getHandler();

  const users = await checkUserStatus(db, userId);
  if (!users.length) {
    throw userNotFoundError(userId);
  }
  if (users[0].isActive) {
    throw userAlreadyActive(userId);
  }

  const updatedAt = new Date().toISOString();
  await handler.transaction(async () => {
    const args = { userId: userId, updatedAt: updatedAt };
    const results = await Promise.allSettled([
      reactivateUser(db, args),
      updateUserInfoTimestamp(db, args),
      updateUserSettingsTimestamp(db, args)
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

async function checkUserStatus(db: DatabaseHandler, userId: string) {
  return await executePreparedQuery({
    db: db,
    queryName: 'readUserQuery',
    phValues: { userId: userId },
    debug: { instance: userDebug, msg: 'Checking whether the user is active' }
  });
}

async function reactivateUser(
  db: DatabaseHandler,
  phValues: UserUpdateQueryArguments
) {
  await executePreparedQuery({
    db: db,
    queryName: 'reactivateUserQuery',
    phValues: phValues,
    debug: { instance: userDebug, msg: 'Deactivating user' }
  });
}

async function updateUserInfoTimestamp(
  db: DatabaseHandler,
  phValues: UserUpdateQueryArguments
) {
  await executePreparedQuery({
    db: db,
    queryName: 'updateUserInfoTimestampQuery',
    phValues: phValues,
    debug: { instance: userDebug, msg: 'Updating user info timestamp' }
  });
}

async function updateUserSettingsTimestamp(
  db: DatabaseHandler,
  phValues: UserUpdateQueryArguments
) {
  await executePreparedQuery({
    db: db,
    queryName: 'updateUserSettingsTimestampQuery',
    phValues: phValues,
    debug: { instance: userDebug, msg: 'Updating user settings timestamp' }
  });
}
