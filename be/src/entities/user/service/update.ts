import type { DBPreparedQueries } from '../../../db/index.js';
import { userDebug, type RequestContext } from '../../../types/index.js';
import {
  userNotAllowedToBeUpdated,
  userNotFoundError,
  userUpdatedButReadFailed
} from '../../utils/index.js';
import type { updateOne as updateOneValidation } from '../validator.js';

/**********************************************************************************/

type UserUpdateOneValidationData = ReturnType<typeof updateOneValidation>;

/**********************************************************************************/

export async function updateOne(
  ctx: RequestContext,
  updates: UserUpdateOneValidationData
) {
  const { db, preparedQueries } = ctx;
  const handler = db.getHandler();
  const { readUserQuery } = preparedQueries;

  const { password, userId, ...userInfo } = updates;
  const updatedAt = new Date().toISOString();

  // According to: https://www.answeroverflow.com/m/1164318289674125392
  // handler and transaction can be used interchangeably, hopefully that is the
  // case. Should check it at some point
  await handler.transaction(async () => {
    const results = await Promise.allSettled([
      isAllowedToUpdate(preparedQueries, userId),
      updateUserInfo({
        preparedQueries: preparedQueries,
        userInfo: userInfo,
        userId: userId,
        updatedAt: updatedAt
      }),
      updateUserCredentials({
        preparedQueries: preparedQueries,
        credentials: {
          email: userInfo.email,
          password: password
        },
        userId: userId,
        updatedAt: updatedAt
      })
    ]);
    for (const result of results) {
      if (result.status === 'rejected') {
        throw result.reason;
      }
    }
  });

  try {
    userDebug('Fetching user after update');
    const updatedUser = (await readUserQuery.execute({ userId: userId }))[0];
    userDebug('Done fetching user after update');

    return updatedUser;
  } catch (err) {
    throw userUpdatedButReadFailed(userId, err);
  }
}

/**********************************************************************************/

async function isAllowedToUpdate(
  preparedQueries: DBPreparedQueries,
  userId: string
) {
  const { isUserActiveQuery } = preparedQueries;

  userDebug('Checking whether user is active');
  const users = await isUserActiveQuery.execute({
    userId: userId
  });
  userDebug('Done checking whether user is active');
  if (!users.length) {
    throw userNotFoundError(userId);
  }
  if (!users[0].isActive) {
    throw userNotAllowedToBeUpdated(userId);
  }
}

async function updateUserInfo(params: {
  preparedQueries: DBPreparedQueries;
  userInfo: Omit<UserUpdateOneValidationData, 'password' | 'userId'>;
  userId: string;
  updatedAt: string;
}) {
  const { preparedQueries, userInfo, userId, updatedAt } = params;
  const { updateUserInfoQuery } = preparedQueries;

  if (!Object.keys(userInfo).length) {
    return;
  }

  userDebug('Updating user info entry');
  const updates = await updateUserInfoQuery.execute({
    ...userInfo,
    userId: userId,
    updatedAt: updatedAt
  });
  userDebug('Done updating user info entry');
  if (!updates.length) {
    throw userNotFoundError(userId);
  }
}

async function updateUserCredentials(params: {
  preparedQueries: DBPreparedQueries;
  credentials: Pick<UserUpdateOneValidationData, 'email' | 'password'>;
  userId: string;
  updatedAt: string;
}) {
  const { preparedQueries, credentials, userId, updatedAt } = params;
  const { updateUserCredentialsQuery } = preparedQueries;

  if (!Object.keys(credentials).length) {
    return;
  }

  userDebug('Updating user credentials entry');
  const updates = await updateUserCredentialsQuery.execute({
    ...credentials,
    userId: userId,
    updatedAt: updatedAt
  });
  userDebug('Done updating user credentials entry');
  if (!updates.length) {
    throw userNotFoundError(userId);
  }
}
