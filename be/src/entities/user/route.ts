import { Router, json } from '../../types/index.js';

import { createOne, deleteOne, reactivateOne, readOne, updateOne } from './controller.js';

/**********************************************************************************/

export default Router()
  .post('/users', json({ limit: '16kb' }), createOne)
  .get('/users/:userId', json({ limit: '2kb' }), readOne)
  .patch('/users/:userId', json({ limit: '16kb' }), updateOne)
  .delete('/users/:userId', json({ limit: '2kb' }), deleteOne)
  .patch('/users/reactivate/:userId', json({ limit: '2kb' }), reactivateOne);
