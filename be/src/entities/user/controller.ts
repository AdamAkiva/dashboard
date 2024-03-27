import {
  StatusCodes,
  userDebug,
  type NextFunction,
  type Request,
  type Response
} from '../../utils/index.js';

import { asyncDebugWrapper, debugWrapper } from '../utils.js';

import * as Service from './service/index.js';
import * as Validator from './validator.js';

/**********************************************************************************/

export async function readUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const queryParams = debugWrapper(
      () => {
        return Validator.readUsers(req);
      },
      { instance: userDebug, msg: 'readUsers validation' }
    );

    const users = await asyncDebugWrapper(
      async () => {
        return await Service.readUsers(res.locals.ctx, queryParams);
      },
      { instance: userDebug, msg: 'readUsers service' }
    );

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
    const userId = debugWrapper(
      () => {
        return Validator.readUser(req);
      },
      { instance: userDebug, msg: 'readUser validation' }
    );

    const user = await asyncDebugWrapper(
      async () => {
        return await Service.readUser(res.locals.ctx, userId);
      },
      { instance: userDebug, msg: 'readUser service' }
    );

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
    const userData = debugWrapper(
      () => {
        return Validator.createUser(req);
      },
      { instance: userDebug, msg: 'createUser validation' }
    );

    const createdUser = await asyncDebugWrapper(
      async () => {
        return await Service.createUser(res.locals.ctx, userData);
      },
      { instance: userDebug, msg: 'createUser service' }
    );

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
    const userUpdates = debugWrapper(
      () => {
        return Validator.updateUser(req);
      },
      { instance: userDebug, msg: 'updateUser validation' }
    );

    const updatedUser = await asyncDebugWrapper(
      async () => {
        return await Service.updateUser(res.locals.ctx, userUpdates);
      },
      { instance: userDebug, msg: 'updateUser service' }
    );

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
    const userId = debugWrapper(
      () => {
        return Validator.reactivateUser(req);
      },
      { instance: userDebug, msg: 'reactivateUser validation' }
    );

    const reactivatedUser = await asyncDebugWrapper(
      async () => {
        return await Service.reactivateUser(res.locals.ctx, userId);
      },
      { instance: userDebug, msg: 'reactivateUser service' }
    );

    return res.status(StatusCodes.SUCCESS).json(reactivatedUser);
  } catch (err) {
    return next(err);
  }
}

export async function updateUserSettings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userSettingsUpdates = debugWrapper(
      () => {
        return Validator.updateUserSettings(req);
      },
      { instance: userDebug, msg: 'updateUserSettings validation' }
    );

    const reactivatedUser = await asyncDebugWrapper(
      async () => {
        return await Service.updateUserSettings(
          res.locals.ctx,
          userSettingsUpdates
        );
      },
      { instance: userDebug, msg: 'updateUserSettings service' }
    );

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
    const userId = debugWrapper(
      () => {
        return Validator.deleteUser(req);
      },
      { instance: userDebug, msg: 'deleteUser validation' }
    );

    const deletedUserId = await asyncDebugWrapper(
      async () => {
        return await Service.deleteUser(res.locals.ctx, userId);
      },
      { instance: userDebug, msg: 'deleteUser service' }
    );

    return res.status(StatusCodes.SUCCESS).json(deletedUserId);
  } catch (err) {
    return next(err);
  }
}
