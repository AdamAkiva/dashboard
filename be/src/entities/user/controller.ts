import {
  userDebug,
  type NextFunction,
  type Request,
  type Response
} from '../../types/index.js';
import { StatusCodes } from '../../utils/index.js';

import { asyncLogWrapper, logWrapper } from '../utils/index.js';

import * as Service from './service/index.js';
import * as Validator from './validator.js';

/**********************************************************************************/

export async function readOne(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = logWrapper(
      function validator() {
        return Validator.readOne(req);
      },
      { instance: userDebug, msg: 'readOne validation' }
    );

    const user = await asyncLogWrapper(
      async function service() {
        return await Service.readOne(res.locals.ctx, userId);
      },
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
    const userData = logWrapper(
      function validator() {
        return Validator.createOne(req);
      },
      { instance: userDebug, msg: 'createOne validation' }
    );

    const createdUser = await asyncLogWrapper(
      async function service() {
        return await Service.createOne(res.locals.ctx, userData);
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
    const userUpdates = logWrapper(
      function validator() {
        return Validator.updateOne(req);
      },
      { instance: userDebug, msg: 'updateOne validation' }
    );

    const updatedUser = await asyncLogWrapper(
      async function service() {
        return await Service.updateOne(res.locals.ctx, userUpdates);
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
    const userId = logWrapper(
      function validator() {
        return Validator.reactivateOne(req);
      },
      { instance: userDebug, msg: 'reactivateOne validation' }
    );

    const reactivatedUser = await asyncLogWrapper(
      async function service() {
        return await Service.reactivateOne(res.locals.ctx, userId);
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
    const userId = logWrapper(
      function validator() {
        return Validator.deleteOne(req);
      },
      { instance: userDebug, msg: 'deleteOne validation' }
    );

    const deletedUserId = await asyncLogWrapper(
      async function service() {
        return await Service.deleteOne(res.locals.ctx, userId);
      },
      { instance: userDebug, msg: 'deleteOne service' }
    );

    return res.status(StatusCodes.SUCCESS).json(deletedUserId);
  } catch (err) {
    return next(err);
  }
}
