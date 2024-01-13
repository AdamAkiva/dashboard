import { userService } from '../services/index.js';
import type { NextFunction, Request, Response } from '../types/index.js';
import { STATUS } from '../utils/index.js';

/**********************************************************************************/

export const readMany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await userService.readMany(req);

    return res.status(STATUS.SUCCESS.CODE).json(users);
  } catch (err) {
    return next(err);
  }
};
