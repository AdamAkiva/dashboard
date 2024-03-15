import { Router, json } from '../../types/index.js';

import * as Controller from './controller.js';

/**********************************************************************************/

const {
  readUsers,
  createUser,
  readUser,
  updateUser,
  deleteUser,
  reactivateUser
} = Controller;

/**********************************************************************************/

export default Router()
  .get('/users', json({ limit: '4kb' }), readUsers)
  .post('/users', json({ limit: '16kb' }), createUser)
  .get('/users/:userId', json({ limit: '2kb' }), readUser)
  .patch('/users/:userId', json({ limit: '16kb' }), updateUser)
  .delete('/users/:userId', json({ limit: '2kb' }), deleteUser)
  .patch('/users/reactivate/:userId', json({ limit: '2kb' }), reactivateUser);
