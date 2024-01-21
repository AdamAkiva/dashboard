import { Router, json } from '../../types/index.js';

import * as userController from './controller.js';

/**********************************************************************************/

export const router = Router();

router.get('/users', json({ limit: '1kb' }), userController.readMany);
