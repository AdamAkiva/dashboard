import type { DatabaseHandler } from '../../../db/index.js';
import {
  userDebug,
  type DeletedUser,
  type RequestContext
} from '../../../utils/index.js';

import { asyncDebugWrapper, executePreparedQuery } from '../../utils.js';

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
    await asyncDebugWrapper(
      async () => {
        return await executePreparedQuery({
          db: db,
          queryName: 'deleteUser',
          phValues: { userId: userId }
        });
      },
      { instance: userDebug, msg: 'Deleting user' }
    );
  } else {
    await asyncDebugWrapper(
      async () => {
        return await executePreparedQuery({
          db: db,
          queryName: 'deactivateUser',
          phValues: { archivedAt: new Date().toISOString(), userId: userId }
        });
      },
      { instance: userDebug, msg: 'Archiving user' }
    );
  }

  return userId;
}

/**********************************************************************************/

async function getUserStatus(db: DatabaseHandler, userId: string) {
  const isArchived = await asyncDebugWrapper(
    async () => {
      return await executePreparedQuery({
        db: db,
        queryName: 'checkUserIsArchivedQuery',
        phValues: { userId: userId }
      });
    },
    { instance: userDebug, msg: 'Checking whether the user is archived' }
  );

  // User not found, meaning the result is fine, they no longer exists by proxy,
  // hence, return an empty string indicating a success
  if (!isArchived.length) {
    return '';
  }

  // User exists, return when they were archived or null if they are active
  return isArchived[0].archivedAt;
}
