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

export async function readMany(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    userDebug('readMany validation');
    const queryParams = Validator.readMany(req);
    userDebug('Done readMany validation');

    userDebug('readMany service');
    const users = await Service.readMany(res.locals.ctx, queryParams);
    userDebug('Done readMany service');

    return res.status(StatusCodes.SUCCESS).json(users);
  } catch (err) {
    return next(err);
  }
}

export async function readOne(req: Request, res: Response, next: NextFunction) {
  try {
    userDebug('readOne validation');
    const userId = Validator.readOne(req);
    userDebug('Done readOne validation');

    userDebug('readOne service');
    const user = await Service.readOne(res.locals.ctx, userId);
    userDebug('Done readOne service');

    return res.status(StatusCodes.SUCCESS).json(user);
  } catch (err) {
    return next(err);
  }
}

export async function createOne(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    userDebug('createOne validation');
    const userData = Validator.createOne(req);
    userDebug('Done createOne validation');

    userDebug('createOne service');
    const createdUser = await Service.createOne(res.locals.ctx, userData);
    userDebug('Done createOne service');

    return res.status(StatusCodes.CREATED).json(createdUser);
  } catch (err) {
    return next(err);
  }
}

export async function updateOne(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    userDebug('updateOne validation');
    const userUpdates = Validator.updateOne(req);
    userDebug('Done updateOne validation');

    userDebug('updateOne service');
    const updatedUser = await Service.updateOne(res.locals.ctx, userUpdates);
    userDebug('Done updateOne service');

    return res.status(StatusCodes.SUCCESS).json(updatedUser);
  } catch (err) {
    return next(err);
  }
}

export async function reactivateOne(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    userDebug('reactivateOne validation');
    const userId = Validator.reactivateOne(req);
    userDebug('Done reactivateOne validation');

    userDebug('reactivateOne service');
    const reactivatedUser = await Service.reactivateOne(res.locals.ctx, userId);
    userDebug('Done reactivateOne service');

    return res.status(StatusCodes.SUCCESS).json(reactivatedUser);
  } catch (err) {
    return next(err);
  }
}

export async function deleteOne(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    userDebug('deleteOne validation');
    const userId = Validator.deleteOne(req);
    userDebug('Done deleteOne validation');

    userDebug('deleteOne service');
    const deletedUserId = await Service.deleteOne(res.locals.ctx, userId);
    userDebug('Done deleteOne service');

    return res.status(StatusCodes.SUCCESS).json(deletedUserId);
  } catch (err) {
    return next(err);
  }
}
