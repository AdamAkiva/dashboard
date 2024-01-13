import { userController } from '../controllers/index.js';
import { Router, json } from '../types/index.js';

/**********************************************************************************/

export const userRouter = Router();

userRouter.get('/users', json({ limit: '1kb' }), userController.readMany);
