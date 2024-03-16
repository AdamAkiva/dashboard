import {
  userDebug,
  type NextFunction,
  type Request,
  type Response
} from '../../types/index.js';
import { StatusCodes } from '../../utils/index.js';

import * as Service from './service/index.js';
import * as Validator from './validator.js';

/**********************************************************************************/

export async function readUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    userDebug('readUsers validation');
    const queryParams = Validator.readUsers(req);
    userDebug('Done readUsers validation');

    userDebug('readUsers service');
    const users = await Service.readUsers(res.locals.ctx, queryParams);
    userDebug('Done readUsers service');

    return res.status(StatusCodes.SUCCESS).json(users);
  } catch (err) {
    return next(err);
  }
}

export async function readUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    userDebug('readUser validation');
    const userId = Validator.readUser(req);
    userDebug('Done readUser validation');

    userDebug('readUser service');
    const user = await Service.readUser(res.locals.ctx, userId);
    userDebug('Done readUser service');

    return res.status(StatusCodes.SUCCESS).json(user);
  } catch (err) {
    return next(err);
  }
}

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    userDebug('createUser validation');
    const userData = Validator.createUser(req);
    userDebug('Done createUser validation');

    userDebug('createUser service');
    const createdUser = await Service.createUser(res.locals.ctx, userData);
    userDebug('Done createUser service');

    return res.status(StatusCodes.CREATED).json(createdUser);
  } catch (err) {
    return next(err);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    userDebug('updateUser validation');
    const userUpdates = Validator.updateUser(req);
    userDebug('Done updateUser validation');

    userDebug('updateUser service');
    const updatedUser = await Service.updateUser(res.locals.ctx, userUpdates);
    userDebug('Done updateUser service');

    return res.status(StatusCodes.SUCCESS).json(updatedUser);
  } catch (err) {
    return next(err);
  }
}

export async function reactivateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    userDebug('reactivateUser validation');
    const userId = Validator.reactivateUser(req);
    userDebug('Done reactivateUser validation');

    userDebug('reactivateUser service');
    const reactivatedUser = await Service.reactivateUser(
      res.locals.ctx,
      userId
    );
    userDebug('Done reactivateUser service');

    return res.status(StatusCodes.SUCCESS).json(reactivatedUser);
  } catch (err) {
    return next(err);
  }
}

export async function deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    userDebug('deleteUser validation');
    const userId = Validator.deleteUser(req);
    userDebug('Done deleteUser validation');

    userDebug('deleteUser service');
    const deletedUserId = await Service.deleteUser(res.locals.ctx, userId);
    userDebug('Done deleteUser service');

    return res.status(StatusCodes.SUCCESS).json(deletedUserId);
  } catch (err) {
    return next(err);
  }
}
