import {
  eq,
  sql,
  userDebug,
  type RequestContext,
  type User
} from '../../../types/index.js';
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
  const handler = db.getHandler();
  const {
    user: { userModel }
  } = db.getModels();

  // TODO
  // Think where you can put this in order for it to make sense
  const fetchUsersQuery = handler
    .select({
      id: userModel.id,
      email: userModel.email,
      firstName: userModel.firstName,
      lastName: userModel.lastName,
      phone: userModel.phone,
      gender: userModel.gender,
      address: userModel.address,
      createdAt: userModel.createdAt
    })
    .from(userModel)
    .where(eq(userModel.id, sql.placeholder('id')))
    .prepare('fetchUserQuery');
  console.log(fetchUsersQuery.getQuery().sql);

  userDebug('Fetching user');
  const users = await fetchUsersQuery.execute({ id: userId });
  userDebug('Done fetching user');
  if (!users.length) {
    throw userNotFoundError(userId);
  }
  const user = users[0];

  return user;
}
