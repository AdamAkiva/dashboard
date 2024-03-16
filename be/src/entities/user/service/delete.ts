import type { DatabaseHandler } from '../../../db/index.js';
import {
  userDebug,
  type DeletedUser,
  type RequestContext
} from '../../../types/index.js';

import { executePreparedQuery } from '../../utils.js';

import type { deleteUser as deleteUserValidation } from '../validator.js';

/**********************************************************************************/

type DeleteUserValidationData = ReturnType<typeof deleteUserValidation>;

/**********************************************************************************/

export async function deleteUser(
  ctx: RequestContext,
  userId: DeleteUserValidationData
): Promise<DeletedUser> {
  const { db } = ctx;

  const userStatus = await getUserStatus(db, userId);
  if (userStatus === '') {
    return '';
  }

  if (userStatus) {
    userDebug('Deleting user');
    await executePreparedQuery({
      db: db,
      queryName: 'deleteUser',
      phValues: { userId: userId }
    });
    userDebug('Done deleting user');
  } else {
    userDebug('Archiving user');
    await executePreparedQuery({
      db: db,
      queryName: 'deactivateUser',
      phValues: { archivedAt: new Date().toISOString(), userId: userId }
    });
    userDebug('Done archiving user');
  }

  return userId;
}

/**********************************************************************************/

async function getUserStatus(db: DatabaseHandler, userId: string) {
  userDebug('Checking whether the user is archived');
  const isArchived = await executePreparedQuery({
    db: db,
    queryName: 'checkUserIsArchivedQuery',
    phValues: { userId: userId }
  });
  userDebug('Done checking whether the user is archived');

  // User not found, meaning the result is fine, they no longer exists by proxy,
  // hence, return an empty string indicating a success
  if (!isArchived.length) {
    return '';
  }

  // User exists, return when they were archived or null if they are active
  return isArchived[0].archivedAt;
}
