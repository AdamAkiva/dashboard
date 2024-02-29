import type { DatabaseHandler } from '../../../db/index.js';
import { userDebug, type RequestContext } from '../../../types/index.js';

import { executePreparedQuery } from '../../utils/index.js';

import type { deleteOne as deleteOneValidation } from '../validator.js';

/**********************************************************************************/

type UserDeleteOneValidationData = ReturnType<typeof deleteOneValidation>;
type UserUpdateQueryArguments = { userId: string; updatedAt: string };

/**********************************************************************************/

export async function deleteOne(
  ctx: RequestContext,
  userId: UserDeleteOneValidationData
): Promise<string> {
  const { db } = ctx;
  const handler = db.getHandler();

  const userStatuses = await getUserStatus(db, userId);
  if (!userStatuses.length) {
    return '';
  }

  if (!userStatuses[0].isActive) {
    await deleteUser(db, userId);

    return userId;
  }

  await handler.transaction(async () => {
    const args = { userId: userId, updatedAt: new Date().toISOString() };
    const results = await Promise.allSettled([
      deactivateUser(db, args),
      updateUserInfoTimestamp(db, args),
      updateUserSettingsTimestamp(db, args)
    ]);
    for (const result of results) {
      if (result.status === 'rejected') {
        throw result.reason;
      }
    }
  });

  return userId;
}

/**********************************************************************************/

async function getUserStatus(db: DatabaseHandler, userId: string) {
  return await executePreparedQuery({
    db: db,
    queryName: 'isUserActiveQuery',
    phValues: { userId: userId },
    debug: { instance: userDebug, msg: 'Checking whether the user is active' }
  });
}

async function deleteUser(db: DatabaseHandler, userId: string) {
  await executePreparedQuery({
    db: db,
    queryName: 'deleteUserQuery',
    phValues: { userId: userId },
    debug: { instance: userDebug, msg: 'Deleting user' }
  });
}

async function deactivateUser(
  db: DatabaseHandler,
  args: UserUpdateQueryArguments
) {
  await executePreparedQuery({
    db: db,
    queryName: 'deactivateUserQuery',
    phValues: args,
    debug: { instance: userDebug, msg: 'Deactivating user' }
  });
}

async function updateUserInfoTimestamp(
  db: DatabaseHandler,
  args: UserUpdateQueryArguments
) {
  await executePreparedQuery({
    db: db,
    queryName: 'updateUserInfoTimestampQuery',
    phValues: args,
    debug: { instance: userDebug, msg: 'Updating user info timestamp' }
  });
}

async function updateUserSettingsTimestamp(
  db: DatabaseHandler,
  args: UserUpdateQueryArguments
) {
  await executePreparedQuery({
    db: db,
    queryName: 'updateUserSettingsTimestampQuery',
    phValues: args,
    debug: { instance: userDebug, msg: 'Updating user settings timestamp' }
  });
}
