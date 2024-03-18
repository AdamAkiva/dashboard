import { Router, json } from '../../types/index.js';

import {
  createUser,
  deleteUser,
  reactivateUser,
  readUser,
  readUsers,
  updateUser,
  updateUserSettings
} from './controller.js';

/**********************************************************************************/

export default Router()
  .get('/users', json({ limit: '4kb' }), readUsers)
  .post('/users', json({ limit: '16kb' }), createUser)
  .get('/users/:userId', json({ limit: '2kb' }), readUser)
  .patch('/users/:userId', json({ limit: '16kb' }), updateUser)
  .delete('/users/:userId', json({ limit: '2kb' }), deleteUser)
  .patch('/users/reactivate/:userId', json({ limit: '2kb' }), reactivateUser)
  .patch('/users/settings/:userId', json({ limit: '4kb' }), updateUserSettings);
