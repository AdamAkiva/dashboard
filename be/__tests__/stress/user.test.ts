import {
  afterAll,
  createUsers,
  databaseInitConnection,
  databaseTeardownConnection,
  describe,
  getRoutes,
  isStressTest,
  it,
  randStr,
  stressTest
} from '../utils.js';

/**********************************************************************************/

const db = databaseInitConnection();
afterAll(async () => {
  await databaseTeardownConnection(db);
});

describe.skipIf(!isStressTest()).concurrent('User stress tests', () => {
  const userURL = getRoutes().user;

  it('Read', async () => {
    const userId = (
      await createUsers([
        {
          email: `${randStr()}@bla.com`,
          password: 'Bamba123!@#',
          firstName: 'TMP',
          lastName: 'TMP',
          phone: '052-2222222',
          gender: 'male',
          address: 'TMP'
        }
      ])
    )[0].id;

    return await stressTest(`${userURL}/${userId}`, {
      method: 'GET'
    });
  });
});
