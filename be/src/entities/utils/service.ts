import { DashboardError, StatusCodes, logger } from '../../utils/index.js';

/**********************************************************************************/

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
