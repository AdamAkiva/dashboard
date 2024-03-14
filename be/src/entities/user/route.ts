import { Router, json } from '../../types/index.js';

import * as Controller from './controller.js';

/**********************************************************************************/

const { readMany, createOne, readOne, updateOne, deleteOne, reactivateOne } =
  Controller;

/**********************************************************************************/

export default Router()
  .get('/users', json({ limit: '4kb' }), readMany)
  .post('/users', json({ limit: '16kb' }), createOne)
  .get('/users/:userId', json({ limit: '2kb' }), readOne)
  .patch('/users/:userId', json({ limit: '16kb' }), updateOne)
  .delete('/users/:userId', json({ limit: '2kb' }), deleteOne)
  .patch('/users/reactivate/:userId', json({ limit: '2kb' }), reactivateOne);
