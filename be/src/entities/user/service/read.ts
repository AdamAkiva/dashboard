import {
  and,
  eq,
  isNotNull,
  userDebug,
  type RequestContext,
  type SQL,
  type User,
  type Users
} from '../../../utils/index.js';

import { asyncDebugWrapper, executePreparedQuery } from '../../utils.js';

import type {
  readUsers as readUsersValidation,
  readUser as readUserValidation
} from '../validator.js';

import { userNotFoundError } from './utils.js';

/**********************************************************************************/

type ReadUsersValidationData = ReturnType<typeof readUsersValidation>;
type ReadUserValidationData = ReturnType<typeof readUserValidation>;

/**********************************************************************************/

export async function readUsers(
  ctx: RequestContext,
  queryParams?: ReadUsersValidationData
): Promise<Users> {
  const { db } = ctx;
  const handler = db.getHandler();
  const { userInfoModel, userCredentialsModel } = db.getModels();

  let users: Users = [];
  if (queryParams) {
    const filters: SQL[] = [eq(userCredentialsModel.userId, userInfoModel.id)];
    if (queryParams.archive) {
      filters.push(isNotNull(userCredentialsModel.archivedAt));
    }
    const innerJoinQuery = filters.length === 1 ? filters[0] : and(...filters);

    users = await asyncDebugWrapper(
      async () => {
        return await handler
          .select({
            id: userInfoModel.id,
            email: userInfoModel.email,
            firstName: userInfoModel.firstName,
            lastName: userInfoModel.lastName,
            phone: userInfoModel.phone,
            gender: userInfoModel.gender,
            address: userInfoModel.address
          })
          .from(userInfoModel)
          .innerJoin(userCredentialsModel, innerJoinQuery);
      },
      { instance: userDebug, msg: 'Fetching archived users' }
    );
  } else {
    users = await asyncDebugWrapper(
      async () => {
        return await executePreparedQuery({
          db: db,
          queryName: 'readUsersQuery'
        });
      },
      { instance: userDebug, msg: 'Fetching users' }
    );
  }

  return users;
}

export async function readUser(
  ctx: RequestContext,
  userId: ReadUserValidationData
): Promise<User> {
  const { db } = ctx;

  const users = await asyncDebugWrapper(
    async () => {
      return await executePreparedQuery({
        db: db,
        queryName: 'readUserQuery',
        phValues: { userId: userId }
      });
    },
    { instance: userDebug, msg: 'Fetching user' }
  );
  if (!users.length) {
    throw userNotFoundError(userId);
  }

  return users[0];
}
