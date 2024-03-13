import {
  userDebug,
  type RequestContext,
  type User
} from '../../../types/index.js';

import { executePreparedQuery } from '../../utils/index.js';

import type { readOne as readOneValidation } from '../validator.js';

import { userNotFoundError } from './utils.js';

/**********************************************************************************/

type UserReadOneValidationData = ReturnType<typeof readOneValidation>;

/**********************************************************************************/

export async function readOne(
  ctx: RequestContext,
  userId: UserReadOneValidationData
): Promise<User> {
  const { db } = ctx;

  userDebug('Fetching user');
  const users = await executePreparedQuery({
    db: db,
    queryName: 'readUserQuery',
    phValues: { userId: userId }
  });
  userDebug('Done fetching user');
  if (!users.length) {
    throw userNotFoundError(userId);
  }

  return users[0];
}
