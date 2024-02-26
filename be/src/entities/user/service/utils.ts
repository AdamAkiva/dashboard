import { DashboardError, StatusCodes } from '../../../utils/index.js';

/**********************************************************************************/

export function userNotFoundError(userId: string) {
  return new DashboardError(
    `User '${userId}' not found`,
    StatusCodes.NOT_FOUND
  );
}
