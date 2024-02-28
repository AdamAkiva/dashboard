import type { DBPreparedQueries } from '../../../db/index.js';
import {
  userDebug,
  type RequestContext,
  type User
} from '../../../types/index.js';
import type { createOne as createOneValidation } from '../validator.js';

/**********************************************************************************/

type UserCreateOneValidationData = ReturnType<typeof createOneValidation>;

/**********************************************************************************/

export async function createOne(
  ctx: RequestContext,
  userData: UserCreateOneValidationData
): Promise<User> {
  const { db, preparedQueries } = ctx;
  const handler = db.getHandler();

  const { password, ...userInfo } = userData;
  const createdAt = new Date().toISOString();

  // According to: https://www.answeroverflow.com/m/1164318289674125392
  // handler and transaction can be used interchangeably, hopefully that is the
  // case. Should check it at some point
  return await handler.transaction(async () => {
    const user = await activateUser(preparedQueries, userInfo.email);
    if (user) {
      return user;
    }

    const userId = await createUserInfo({
      preparedQueries: preparedQueries,
      userInfo: userInfo,
      createdAt: createdAt
    });
    const results = await Promise.allSettled([
      createUserCredentials({
        preparedQueries: preparedQueries,
        credentials: {
          email: userInfo.email,
          password: password
        },
        userId: userId,
        createdAt: createdAt
      }),
      createUserDefaultSettings({
        preparedQueries: preparedQueries,
        userId: userId,
        createdAt: createdAt
      })
    ]);
    for (const result of results) {
      if (result.status === 'rejected') {
        throw result.reason;
      }
    }

    return {
      ...userInfo,
      id: userId,
      createdAt: createdAt,
      isActive: true
    };
  });
}

/**********************************************************************************/

async function activateUser(preparedQueries: DBPreparedQueries, email: string) {
  const { activateUser, readUserQuery } = preparedQueries;

  const users = await activateUser.execute({ email: email });
  if (!users.length) {
    return undefined;
  }

  return (await readUserQuery.execute({ userId: users[0].userId }))[0];
}

async function createUserInfo(params: {
  preparedQueries: DBPreparedQueries;
  userInfo: Omit<UserCreateOneValidationData, 'password'>;
  createdAt: string;
}) {
  const { preparedQueries, userInfo, createdAt } = params;
  const { createUserInfoQuery } = preparedQueries;

  userDebug('Creating user info entry');
  const userId = (
    await createUserInfoQuery.execute({
      ...userInfo,
      createdAt: createdAt
    })
  )[0].userId;
  userDebug('Done creating user info entry');

  return userId;
}

async function createUserCredentials(params: {
  preparedQueries: DBPreparedQueries;
  credentials: Pick<UserCreateOneValidationData, 'email' | 'password'>;
  userId: string;
  createdAt: string;
}) {
  const { preparedQueries, credentials, userId, createdAt } = params;
  const { createCredentialsQuery } = preparedQueries;

  userDebug('Creating user credentials entry');
  await createCredentialsQuery.execute({
    ...credentials,
    userId: userId,
    createdAt: createdAt
  });
  userDebug('Done creating user credentials entry');
}

async function createUserDefaultSettings(params: {
  preparedQueries: DBPreparedQueries;
  userId: string;
  createdAt: string;
}) {
  const { userId, preparedQueries, createdAt } = params;
  const { createDefaultSettingsQuery } = preparedQueries;

  userDebug('Creating default user settings entry');
  await createDefaultSettingsQuery.execute({
    userId: userId,
    createdAt: createdAt
  });
  userDebug('Done creating user default settings entry');
}
