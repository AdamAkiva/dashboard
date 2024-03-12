import { pg, type RequestContext } from '../../../types/index.js';
import {
  DashboardError,
  ERR_CODES,
  StatusCodes
} from '../../../utils/index.js';

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

export function userUpdatedReadFailed(params: {
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
