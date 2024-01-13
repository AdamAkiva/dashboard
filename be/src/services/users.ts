import type { Request, User } from '../types/index.js';
import { sanitizeError } from '../utils/index.js';

/**********************************************************************************/

export const readMany = async (req: Request): Promise<User[]> => {
  try {
    const { db } = req.dashboard;
    const handler = db.getHandler();
    const { userModel } = db.getModels();

    return await handler
      .select({
        id: userModel.id,
        firstName: userModel.firstName,
        lastName: userModel.lastName,
        email: userModel.email,
        dateOfBirth: userModel.dateOfBirth,
        address: userModel.address,
        phone: userModel.phone
      })
      .from(userModel);
  } catch (err) {
    throw sanitizeError(err);
  }
};
