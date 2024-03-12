import type { DatabaseHandler } from '../../../db/index.js';
import { userDebug, type RequestContext } from '../../../types/index.js';

import { executePreparedQuery } from '../../utils/service.js';

import type { deleteOne as deleteOneValidation } from '../validator.js';

/**********************************************************************************/

type UserDeleteOneValidationData = ReturnType<typeof deleteOneValidation>;

/**********************************************************************************/

export async function deleteOne(params: {
  ctx: RequestContext;
  userId: UserDeleteOneValidationData;
}): Promise<string> {
  const {
    ctx: { db },
    userId
  } = params;
  const userStatus = await getUserStatus(db, userId);
  if (userStatus === '') {
    return '';
  }

  if (userStatus) {
    await executePreparedQuery({
      db: db,
      queryName: 'deleteUser',
      phValues: { userId: userId },
      debug: { instance: userDebug, msg: 'Deleting user' }
    });
  } else {
    await executePreparedQuery({
      db: db,
      queryName: 'deactivateUser',
      phValues: { archivedAt: new Date().toISOString(), userId: userId },
      debug: { instance: userDebug, msg: 'Deactivating user' }
    });
  }

  return userId;
}

/**********************************************************************************/

async function getUserStatus(db: DatabaseHandler, userId: string) {
  const isArchived = await executePreparedQuery({
    db: db,
    queryName: 'checkUserIsArchivedQuery',
    phValues: { userId: userId },
    debug: { instance: userDebug, msg: 'Checking whether the user is active' }
  });

  // User not found, meaning the result is fine, they no longer exists by proxy,
  // hence, return an empty string indicating a success
  if (!isArchived.length) {
    return '';
  }

  // User exists, return when they were archived or null if they are active
  return isArchived[0].archivedAt;
}
