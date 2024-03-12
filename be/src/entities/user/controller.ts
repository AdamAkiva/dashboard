import {
  userDebug,
  type NextFunction,
  type Request,
  type Response
} from '../../types/index.js';
import { StatusCodes } from '../../utils/index.js';

import { asyncDebugWrapper, debugWrapper } from '../utils/index.js';

import * as Service from './service/index.js';
import * as Validator from './validator.js';

/**********************************************************************************/

export async function readOne(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = debugWrapper(
      { fn: Validator.readOne, args: req },
      { instance: userDebug, msg: 'readOne validation' }
    );

    const user = await asyncDebugWrapper(
      { fn: Service.readOne, args: { ctx: res.locals.ctx, userId: userId } },
      { instance: userDebug, msg: 'readOne service' }
    );

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
    const userData = debugWrapper(
      { fn: Validator.createOne, args: req },
      { instance: userDebug, msg: 'createOne validation' }
    );

    const createdUser = await asyncDebugWrapper(
      {
        fn: Service.createOne,
        args: { ctx: res.locals.ctx, userData: userData }
      },
      { instance: userDebug, msg: 'createOne service' }
    );

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
    const userUpdates = debugWrapper(
      { fn: Validator.updateOne, args: req },
      { instance: userDebug, msg: 'updateOne validation' }
    );

    const updatedUser = await asyncDebugWrapper(
      {
        fn: Service.updateOne,
        args: { ctx: res.locals.ctx, updates: userUpdates }
      },
      { instance: userDebug, msg: 'updateOne service' }
    );

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
    const userId = debugWrapper(
      { fn: Validator.reactivateOne, args: req },
      { instance: userDebug, msg: 'reactivateOne validation' }
    );

    const reactivatedUser = await asyncDebugWrapper(
      {
        fn: Service.reactivateOne,
        args: { ctx: res.locals.ctx, userId: userId }
      },
      { instance: userDebug, msg: 'reactivateOne service' }
    );

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
    const userId = debugWrapper(
      { fn: Validator.deleteOne, args: req },
      { instance: userDebug, msg: 'deleteOne validation' }
    );

    const deletedUserId = await asyncDebugWrapper(
      { fn: Service.deleteOne, args: { ctx: res.locals.ctx, userId: userId } },
      { instance: userDebug, msg: 'deleteOne service' }
    );

    return res.status(StatusCodes.SUCCESS).json(deletedUserId);
  } catch (err) {
    return next(err);
  }
}
