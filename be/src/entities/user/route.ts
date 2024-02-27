import { Router, json } from '../../types/index.js';

import * as Controller from './controller.js';

/**********************************************************************************/

const { createOne, readOne, updateOne, deleteOne } = Controller;

/**********************************************************************************/

export default Router()
  .post('/users', json({ limit: '16kb' }), createOne)
  .get('/users/:userId', json({ limit: '2kb' }), readOne)
  .patch('/users/:userId', json({ limit: '16kb' }), updateOne)
  .delete('/users/:userId', json({ limit: '2kb' }), deleteOne);
