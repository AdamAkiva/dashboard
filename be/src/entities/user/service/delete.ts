import { userDebug, type RequestContext } from '../../../types/index.js';
import type { deleteOne as deleteOneValidation } from '../validator.js';

/**********************************************************************************/

type UserDeleteOneValidationData = ReturnType<typeof deleteOneValidation>;

/**********************************************************************************/

export async function deleteOne(
  ctx: RequestContext,
  userId: UserDeleteOneValidationData
) {
  const { preparedQueries } = ctx;
  const { deactivateUserQuery, deleteUserQuery, isUserActiveQuery } =
    preparedQueries;

  userDebug('Checking whether the user is active');
  const users = await isUserActiveQuery.execute({ userId: userId });
  userDebug('Done Checking whether the user is active');
  if (!users.length) {
    return '';
  }

  if (users[0].isActive) {
    userDebug('Deactivating user');
    await deactivateUserQuery.execute({ userId: userId });
    userDebug('Done deactivating user');
  } else {
    userDebug('Deleting user');
    await deleteUserQuery.execute({ userId: userId });
    userDebug('Done deleting user');
  }

  return userId;
}
