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
    userDebug('ReadOne validation');
    const args = Validator.readOne(req);
    userDebug('ReadOne validation done');

    userDebug('ReadOne service');
    const user = await Service.readOne(res.locals.ctx, args);
    userDebug('ReadOne service done');

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
    userDebug('CreateOne validation');
    const args = Validator.createOne(req);
    userDebug('CreateOne validation done');

    userDebug('CreateOne service');
    const user = await Service.createOne(res.locals.ctx, args);
    userDebug('CreateOne service done');

    return res.status(StatusCodes.SUCCESS).json(user);
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
    const args = Validator.updateOne(req);
    userDebug('updateOne validation done');

    userDebug('updateOne service');
    const user = await Service.updateOne(res.locals.ctx, args);
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
    userDebug('DeleteOne validation');
    const args = Validator.deleteOne(req);
    userDebug('DeleteOne validation done');

    userDebug('DeleteOne service');
    const user = await Service.deleteOne(res.locals.ctx, args);
    userDebug('DeleteOne service done');

    return res.status(StatusCodes.SUCCESS).json(user);
  } catch (err) {
    return next(err);
  }
}
