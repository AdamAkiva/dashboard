import {
  StatusCodes,
  beforeAll,
  createUsers,
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
    describe.skip('Invalid', () => {
      describe('Email', () => {
        it('Without', async () => {});
        it('Empty', async () => {});
        it('Too short', async () => {});
        it('Too long', async () => {});
        it('Invalid format', async () => {});
      });
      describe('Password', () => {
        it('Without', async () => {});
        it('Empty', async () => {});
        it('Too short', async () => {});
        it('Too long', async () => {});
        it('Invalid format', async () => {});
      });
      describe('First name', () => {
        it('Without', async () => {});
        it('Empty', async () => {});
        it('Too long', async () => {});
      });
      describe('Last name', () => {
        it('Without', async () => {});
        it('Empty', async () => {});
        it('Too long', async () => {});
      });
      describe('Phone', () => {
        it('Without', async () => {});
        it('Empty', async () => {});
        it('Too short', async () => {});
        it('Too long', async () => {});
        it('Invalid format', async () => {});
      });
      describe('Gender', () => {
        it('Without', async () => {});
        it('Empty', async () => {});
        it('Invalid format', async () => {});
      });
      describe('Address', () => {
        it('Without', async () => {});
        it('Empty', async () => {});
        it('Too long', async () => {});
      });
      it('Duplicate with active user', async () => {});
      it('Duplicate with inactive user', async () => {});
    });
  });

  /********************************************************************************/

  // For all the tests below, we wish we could have used a beforeEachHook to
  // create a user before each test, however, since the tests run concurrently
  // it is not safe, and the result may differ as a result of which test ran
  // first (race-condition). The way we resolved it is to create X number of
  // users and use a different one in every test

  describe.skip('Read', () => {
    const USERS_AMOUNT = 1;
    const userIds: string[] = [];

    beforeAll(async () => {
      const usersData: CreateUser[] = [...Array(USERS_AMOUNT)].map(() => {
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
      userIds.push(
        ...(await createUsers(usersData)).map(({ id }) => {
          return id;
        })
      );
    });

    describe('Valid', () => {
      it('Single active', async () => {});
      it('Single inactive', async () => {});
    });
    describe('Invalid', () => {
      describe('User id', () => {
        it('Without', async () => {});
        it('Empty', async () => {});
        it('Invalid format', async () => {});
      });
      it('Non-existent user', async () => {});
    });
  });

  /********************************************************************************/

  describe.skip('Update', () => {
    const USERS_AMOUNT = 1;
    const userIds: string[] = [];

    beforeAll(async () => {
      const usersData: CreateUser[] = [...Array(USERS_AMOUNT)].map(() => {
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
      userIds.push(
        ...(await createUsers(usersData)).map(({ id }) => {
          return id;
        })
      );
    });

    describe('Valid', () => {
      it('Update email', async () => {});
      it('Update password', async () => {});
      it('Update first name', async () => {});
      it('Update last name', async () => {});
      it('Update ', async () => {});
      it('Update phone', async () => {});
      it('Update gender', async () => {});
      it('Update address', async () => {});
      it('All possible fields', async () => {});
    });
    describe('Invalid', () => {
      describe('Email', () => {
        it('Empty', async () => {});
        it('Too short', async () => {});
        it('Too long', async () => {});
        it('Invalid format', async () => {});
      });
      describe('Password', () => {
        it('Empty', async () => {});
        it('Too short', async () => {});
        it('Too long', async () => {});
        it('Invalid format', async () => {});
      });
      describe('First name', () => {
        it('Empty', async () => {});
        it('Too long', async () => {});
      });
      describe('Last name', () => {
        it('Empty', async () => {});
        it('Too long', async () => {});
      });
      describe('Phone', () => {
        it('Empty', async () => {});
        it('Too short', async () => {});
        it('Too long', async () => {});
        it('Invalid format', async () => {});
      });
      describe('Gender', () => {
        it('Empty', async () => {});
        it('Invalid format', async () => {});
      });
      describe('Address', () => {
        it('Empty', async () => {});
        it('Too long', async () => {});
      });
      it('Duplicate with active user', async () => {});
      it('Duplicate with inactive user', async () => {});
    });
  });

  /********************************************************************************/

  describe.skip('Delete', () => {
    const USERS_AMOUNT = 1;
    const userIds: string[] = [];

    beforeAll(async () => {
      const usersData: CreateUser[] = [...Array(USERS_AMOUNT)].map(() => {
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
      userIds.push(
        ...(await createUsers(usersData)).map(({ id }) => {
          return id;
        })
      );
    });

    describe('Valid', () => {
      it('Deactivate user', async () => {});
      it('Delete user', async () => {});
      it('Delete non-existent user', async () => {});
    });
    describe('Invalid', () => {
      describe('User id', () => {
        it('Without', async () => {});
        it('Empty', async () => {});
        it('Invalid format', async () => {});
      });
    });
  });
});
