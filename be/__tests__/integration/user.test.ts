import {
  StatusCodes,
  describe,
  expect,
  getRoutes,
  isStressTest,
  it,
  omit,
  randStr,
  sendHttpRequest,
  type CreateUser,
  type ResolvedValue,
  type User
} from '../utils.js';

/**********************************************************************************/

describe.skipIf(isStressTest()).concurrent('User tests', () => {
  const userURL = getRoutes().user;

  describe('Create', () => {
    describe('Valid', () => {
      it('Single', async () => {
        const userData: CreateUser = {
          email: `${randStr()}@bla.com`,
          password: 'Bla123!@#',
          firstName: 'TMP',
          lastName: 'TMP',
          phone: '052-2222222',
          gender: 'male',
          address: 'TMP'
        };

        const res = await sendHttpRequest<User>(userURL, {
          method: 'post',
          json: userData
        });
        expect(res.statusCode).toBe(StatusCodes.CREATED);
        expect(omit(res.data, 'id', 'createdAt', 'isActive')).toStrictEqual(
          omit(userData, 'password')
        );
      });
      it('Multiple', async () => {
        const usersData: CreateUser[] = [...Array(10)].map(() => {
          return {
            email: `${randStr()}@bla.com`,
            password: 'Bla123!@#',
            firstName: 'TMP',
            lastName: 'TMP',
            phone: '052-2222222',
            gender: 'male',
            address: 'TMP'
          };
        });

        const results = await Promise.allSettled(
          usersData.map(async (userData) => {
            return await sendHttpRequest<User>(userURL, {
              method: 'post',
              json: userData
            });
          })
        );
        for (const result of results) {
          if (result.status === 'rejected') {
            throw result.reason;
          }
        }

        const responses = (
          results as ResolvedValue<ReturnType<typeof sendHttpRequest<User>>>[]
        ).map(({ value }) => {
          return value;
        });
        responses.forEach((response) => {
          expect(response.statusCode).toBe(StatusCodes.CREATED);
          const userData = usersData.find((user) => {
            return user.email === response.data.email;
          })!;
          expect(
            omit(response.data, 'id', 'createdAt', 'isActive')
          ).toStrictEqual(omit(userData, 'password'));
        });
      });
      it('A lot', async () => {
        const usersData: CreateUser[] = [...Array(1_000)].map(() => {
          return {
            email: `${randStr()}@bla.com`,
            password: 'Bla123!@#',
            firstName: 'TMP',
            lastName: 'TMP',
            phone: '052-2222222',
            gender: 'male',
            address: 'TMP'
          };
        });

        const results = await Promise.allSettled(
          usersData.map(async (userData) => {
            return await sendHttpRequest<User>(userURL, {
              method: 'post',
              json: userData
            });
          })
        );
        for (const result of results) {
          if (result.status === 'rejected') {
            throw result.reason;
          }
        }

        const responses = (
          results as ResolvedValue<ReturnType<typeof sendHttpRequest<User>>>[]
        ).map(({ value }) => {
          return value;
        });
        responses.forEach((response) => {
          expect(response.statusCode).toBe(StatusCodes.CREATED);
          const userData = usersData.find((user) => {
            return user.email === response.data.email;
          })!;
          expect(
            omit(response.data, 'id', 'createdAt', 'isActive')
          ).toStrictEqual(omit(userData, 'password'));
        });
      });
    });
    describe.skip('Invalid', () => {});
  });

  /********************************************************************************/

  describe.skip('Read', () => {
    describe('Valid', () => {});
    describe('Invalid', () => {});
  });

  /********************************************************************************/

  describe.skip('Update', () => {
    describe('Valid', () => {});
    describe('Invalid', () => {});
  });

  /********************************************************************************/

  describe.skip('Delete', () => {
    describe('Valid', () => {});
    describe('Invalid', () => {});
  });

  /********************************************************************************/
});
