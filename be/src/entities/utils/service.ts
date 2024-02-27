import type { DBHandler, DBModels, Transaction } from '../../db/index.js';
import { eq, sql } from '../../types/index.js';
import { DashboardError, StatusCodes, logger } from '../../utils/index.js';

/**********************************************************************************/

// TODO
// Find away to make this returned object initialize only once on the one hand.
// On the other hand, the function should use the DI pattern, so no global
// initialization is allowed
export function getPreparedStatements(
  handler: DBHandler | Transaction,
  models: DBModels
) {
  const {
    user: { userInfoModel, userCredentialsModel, userSettingsModel }
  } = models;

  return {
    readUserQuery: handler
      .select({
        id: userInfoModel.id,
        email: userInfoModel.email,
        firstName: userInfoModel.firstName,
        lastName: userInfoModel.lastName,
        phone: userInfoModel.phone,
        gender: userInfoModel.gender,
        address: userInfoModel.address,
        createdAt: userInfoModel.createdAt,
        isActive: userCredentialsModel.isActive
      })
      .from(userInfoModel)
      .where(eq(userInfoModel.id, sql.placeholder('userId')))
      .innerJoin(
        userCredentialsModel,
        eq(userCredentialsModel.userId, sql.placeholder('userId'))
      )
      .prepare('readUserQuery'),
    isUserActiveQuery: handler
      .select({
        isActive: userCredentialsModel.isActive
      })
      .from(userCredentialsModel)
      .where(eq(userCredentialsModel.userId, sql.placeholder('userId')))
      .prepare('isUserActiveQuery'),
    createUserInfoQuery: handler
      .insert(userInfoModel)
      .values({
        email: sql.placeholder('email'),
        firstName: sql.placeholder('firstName'),
        lastName: sql.placeholder('lastName'),
        gender: sql.placeholder('gender'),
        phone: sql.placeholder('phone'),
        address: sql.placeholder('address'),
        createdAt: sql.placeholder('createdAt')
      })
      .returning({
        userId: userInfoModel.id,
        email: userInfoModel.email,
        firstName: userInfoModel.firstName,
        lastName: userInfoModel.lastName,
        gender: userInfoModel.gender,
        phone: userInfoModel.phone,
        address: userInfoModel.address,
        createdAt: userInfoModel.createdAt
      })
      .prepare('createUserInfoQuery'),
    createCredentialsQuery: handler
      .insert(userCredentialsModel)
      .values({
        userId: sql.placeholder('userId'),
        email: sql.placeholder('email'),
        password: sql.placeholder('password'),
        createdAt: sql.placeholder('createdAt')
      })
      .prepare('createCredentialsQuery'),
    createDefaultSettingsQuery: handler
      .insert(userSettingsModel)
      .values({
        userId: sql.placeholder('userId'),
        createdAt: sql.placeholder('createdAt')
      })
      .prepare('createDefaultSettingsQuery'),
    activateUser: handler
      .update(userCredentialsModel)
      .set({
        isActive: true
      })
      .where(eq(userCredentialsModel.email, sql.placeholder('email')))
      .returning({ userId: userCredentialsModel.userId })
      .prepare('activateUser'),
    updateUserInfoQuery: handler
      .update(userInfoModel)
      .set({
        // @ts-expect-error Currently this is a type error, but works on runtime.
        // Remove this ignore When the PR is merged https://github.com/drizzle-team/drizzle-orm/pull/1666
        email: sql.placeholder('email'),
        // @ts-expect-error Currently this is a type error, but works on runtime.
        // Remove this ignore When the PR is merged https://github.com/drizzle-team/drizzle-orm/pull/1666
        firstName: sql.placeholder('firstName'),
        // @ts-expect-error Currently this is a type error, but works on runtime.
        // Remove this ignore When the PR is merged https://github.com/drizzle-team/drizzle-orm/pull/1666
        lastName: sql.placeholder('lastName'),
        // @ts-expect-error Currently this is a type error, but works on runtime.
        // Remove this ignore When the PR is merged https://github.com/drizzle-team/drizzle-orm/pull/1666
        gender: sql.placeholder('gender'),
        // @ts-expect-error Currently this is a type error, but works on runtime.
        // Remove this ignore When the PR is merged https://github.com/drizzle-team/drizzle-orm/pull/1666
        phone: sql.placeholder('phone'),
        // @ts-expect-error Currently this is a type error, but works on runtime.
        // Remove this ignore When the PR is merged https://github.com/drizzle-team/drizzle-orm/pull/1666
        address: sql.placeholder('address'),
        // @ts-expect-error Currently this is a type error, but works on runtime.
        // Remove this ignore When the PR is merged https://github.com/drizzle-team/drizzle-orm/pull/1666
        updatedAt: sql.placeholder('updatedAt')
      })
      .where(eq(userInfoModel.id, sql.placeholder('userId')))
      // Returning to check whether the update occurred or not
      .returning({ id: userInfoModel.id })
      .prepare('updateUserInfoQuery'),
    // Type error, works in runtime, can be removed when this PR is merged:
    // https://github.com/drizzle-team/drizzle-orm/pull/1666
    updateUserCredentialsQuery: handler
      .update(userCredentialsModel)
      .set({
        // @ts-expect-error Currently this is a type error, but works on runtime.
        // Remove this ignore When the PR is merged https://github.com/drizzle-team/drizzle-orm/pull/1666
        email: sql.placeholder('email'),
        // @ts-expect-error Currently this is a type error, but works on runtime.
        // Remove this ignore When the PR is merged https://github.com/drizzle-team/drizzle-orm/pull/1666
        password: sql.placeholder('password'),
        // @ts-expect-error Currently this is a type error, but works on runtime.
        // Remove this ignore When the PR is merged https://github.com/drizzle-team/drizzle-orm/pull/1666
        updatedAt: sql.placeholder('updatedAt')
      })
      .where(eq(userCredentialsModel.userId, sql.placeholder('userId')))
      // Returning to check whether the update occurred or not
      .returning({ userId: userCredentialsModel.userId })
      .prepare('updateUserCredentialsQuery'),
    deactivateUserQuery: handler
      .update(userCredentialsModel)
      .set({ isActive: false })
      .where(eq(userCredentialsModel.userId, sql.placeholder('userId')))
      .prepare('deactivateUserQuery'),
    deleteUserQuery: handler
      .delete(userInfoModel)
      .where(eq(userInfoModel.id, sql.placeholder('userId')))
      .prepare('deleteUserQuery')
  } as const;
}

export function userNotFoundError(userId: string) {
  return new DashboardError(
    `User '${userId}' not found`,
    StatusCodes.NOT_FOUND
  );
}

export function userNotAllowedToBeUpdated(userId: string) {
  return new DashboardError(
    `User '${userId}' is deactivated and therefore can't be updated`,
    StatusCodes.BAD_REQUEST
  );
}

export function userUpdatedButReadFailed(userId: string, err: unknown) {
  const errMsg =
    `User '${userId}' was updated successfully, however, sending it back` +
    ' to the client failed';
  logger.error(err, errMsg);

  return new DashboardError(errMsg, StatusCodes.SERVER_ERROR);
}
