import {
  and,
  eq,
  isNotNull,
  userDebug,
  type RequestContext,
  type SQL,
  type User
} from '../../../types/index.js';

import { executePreparedQuery } from '../../utils/index.js';

import type {
  readMany as readManyValidation,
  readOne as readOneValidation
} from '../validator.js';

import { userNotFoundError } from './utils.js';

/**********************************************************************************/

type UserReadManyValidationData = ReturnType<typeof readManyValidation>;
type UserReadOneValidationData = ReturnType<typeof readOneValidation>;

/**********************************************************************************/

export async function readMany(
  ctx: RequestContext,
  queryParams?: UserReadManyValidationData
): Promise<User[]> {
  const { db } = ctx;
  const handler = db.getHandler();
  const {
    user: { userInfoModel, userCredentialsModel }
  } = db.getModels();

  let users: User[] = [];
  if (queryParams) {
    const filters: SQL[] = [eq(userCredentialsModel.userId, userInfoModel.id)];
    if (queryParams.archive) {
      filters.push(isNotNull(userCredentialsModel.archivedAt));
    }
    const innerJoinQuery = filters.length === 1 ? filters[0] : and(...filters);

    userDebug('Fetching archived users');
    users = await handler
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
    userDebug('Done fetching archived users');
  } else {
    userDebug('Fetching users');
    users = await executePreparedQuery({
      db: db,
      queryName: 'readUsersQuery'
    });
    userDebug('Done fetching users');
  }

  return users;
}

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
