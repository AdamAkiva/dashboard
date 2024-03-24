import type { DBPreparedQueries, DatabaseHandler } from '../../db/index.js';
import {
  pg,
  type Debug,
  type RequestContext,
  type UnknownObject
} from '../../types/index.js';
import { DashboardError, ERR_CODES, StatusCodes } from '../../utils/index.js';

/**********************************************************************************/

export async function executePreparedQuery<
  T extends keyof DBPreparedQueries
>(params: {
  db: DatabaseHandler;
  queryName: T;
  phValues?: UnknownObject;
  debug: { instance: ReturnType<typeof Debug>; msg: string };
}) {
  const {
    db,
    queryName,
    phValues,
    debug: { instance: debugInstance, msg }
  } = params;
  const preparedQueries = db.getPreparedQueries();

  debugInstance(msg);
  const res = (await preparedQueries[queryName].execute(phValues)) as Awaited<
    ReturnType<DBPreparedQueries[T]['execute']>
  >;
  debugInstance(`Done ${msg.charAt(0).toLowerCase() + msg.slice(1)}`);

  return res;
}

/**********************************************************************************/

export function userNotFoundError(userId: string) {
  return new DashboardError(
    `User '${userId}' not found`,
    StatusCodes.NOT_FOUND
  );
}

export function userCreationError(err: unknown, userEmail: string) {
  if (
    err instanceof pg.PostgresError &&
    err.code === ERR_CODES.PG.UNIQUE_VIOLATION
  ) {
    return new DashboardError(
      `User '${userEmail}' already exists`,
      StatusCodes.CONFLICT
    );
  }

  return err;
}

export function userUpdateError(err: unknown, userEmail?: string) {
  if (
    userEmail &&
    err instanceof pg.PostgresError &&
    err.code === ERR_CODES.PG.UNIQUE_VIOLATION
  ) {
    return new DashboardError(
      `User '${userEmail}' already exists`,
      StatusCodes.CONFLICT
    );
  }

  return err;
}

export function userNotAllowedToBeUpdated(userId: string) {
  return new DashboardError(
    `User '${userId}' is deactivated and therefore can't be updated`,
    StatusCodes.BAD_REQUEST
  );
}

export function userUpdatedButReadFailed(params: {
  err: unknown;
  userId: string;
  logger: RequestContext['logger'];
}) {
  const { err, userId, logger } = params;

  const errMsg =
    `User '${userId}' was updated successfully, however, sending it back` +
    ' to the client failed';
  logger.error(err, errMsg);

  return new DashboardError(errMsg, StatusCodes.SERVER_ERROR);
}

export function userAlreadyActive(userId: string) {
  return new DashboardError(
    `User '${userId}' is already active`,
    StatusCodes.BAD_REQUEST
  );
}
