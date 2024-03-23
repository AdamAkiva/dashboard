import {
  userDebug,
  type RequestContext,
  type User
} from '../../../types/index.js';

import { executePreparedQuery, userNotFoundError } from '../../utils/index.js';

import type { readOne as readOneValidation } from '../validator.js';

/**********************************************************************************/

type UserReadOneValidationData = ReturnType<typeof readOneValidation>;

/**********************************************************************************/

export async function readOne(
  ctx: RequestContext,
  userId: UserReadOneValidationData
): Promise<User> {
  const { db } = ctx;

  const users = await executePreparedQuery({
    db: db,
    queryName: 'readUserQuery',
    phValues: { userId: userId },
    debug: { instance: userDebug, msg: 'Fetching user' }
  });
  if (!users.length) {
    throw userNotFoundError(userId);
  }

  return users[0];
}
