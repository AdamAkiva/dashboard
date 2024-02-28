import {
  userDebug,
  type RequestContext,
  type User
} from '../../../types/index.js';
import { userNotFoundError } from '../../utils/index.js';
import type { readOne as readOneValidation } from '../validator.js';

/**********************************************************************************/

type UserReadOneValidationData = ReturnType<typeof readOneValidation>;

/**********************************************************************************/

export async function readOne(
  ctx: RequestContext,
  userId: UserReadOneValidationData
): Promise<User> {
  const { preparedQueries } = ctx;
  const { readUserQuery } = preparedQueries;

  userDebug('Fetching user');
  const users = await readUserQuery.execute({ userId: userId });
  userDebug('Done fetching user');
  if (!users.length) {
    throw userNotFoundError(userId);
  }

  return users[0];
}
