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

export async function readOne(req: Request, res: Response, next: NextFunction) {
  try {
    userDebug('readOne validation');
    const userId = Validator.readOne(req);
    userDebug('readOne validation done');

    userDebug('readOne service');
    const user = await Service.readOne(res.locals.ctx, userId);
    userDebug('readOne service done');

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
    userDebug('createOne validation done');

    userDebug('createOne service');
    const user = await Service.createOne(res.locals.ctx, userData);
    userDebug('createOne service done');

    return res.status(StatusCodes.CREATED).json(user);
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
    const updates = Validator.updateOne(req);
    userDebug('updateOne validation done');

    userDebug('updateOne service');
    const user = await Service.updateOne(res.locals.ctx, updates);
    userDebug('updateOne service done');

    return res.status(StatusCodes.SUCCESS).json(user);
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
    userDebug('deleteOne validation done');

    userDebug('deleteOne service');
    const user = await Service.deleteOne(res.locals.ctx, userId);
    userDebug('deleteOne service done');

    return res.status(StatusCodes.SUCCESS).json(user);
  } catch (err) {
    return next(err);
  }
}

/**********************************************************************************/

export async function reactivateOne(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    userDebug('reactivateOne validation');
    const userId = Validator.reactivateOne(req);
    userDebug('reactivateOne validation done');

    userDebug('reactivateOne service');
    const user = await Service.reactivateOne(res.locals.ctx, userId);
    userDebug('reactivateOne service done');

    return res.status(StatusCodes.SUCCESS).json(user);
  } catch (err) {
    return next(err);
  }
}
