import {
  StatusCodes,
  VALIDATION,
  beforeAll,
  checkUserExists,
  createUsers,
  deactivateUser,
  describe,
  expect,
  getRoutes,
  isStressTest,
  it,
  omit,
  randStr,
  randomUUID,
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
    describe('Invalid', () => {
      describe('Email', () => {
        it('Without', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              password: 'Bla123!@#',
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            }
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Empty', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: '',
              password: 'Bla123!@#',
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Too short', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr(1)}@a.c`,
              password: 'Bla123!@#',
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Too long', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr(VALIDATION.USER_EMAIL_MAX_LENGTH)}@bla.com`,
              password: 'Bla123!@#',
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Invalid format', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla`,
              password: 'Bla123!@#',
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
      });
      describe('Password', () => {
        it('Without', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            }
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Empty', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: '',
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Too short', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'a'.repeat(VALIDATION.USER_PASSWORD_MIN_LENGTH - 1),
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Too long', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'a'.repeat(VALIDATION.USER_PASSWORD_MAX_LENGTH + 1),
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Invalid format', async () => {
          let res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'BAMBA123!@#', // Missing lower case character(s)
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);

          res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'bamba123!@#', // Missing upper case character(s)
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);

          res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123', // Missing special character(s)
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);

          res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'bamba!@#', // Missing digit character
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
      });
      describe('First name', () => {
        it('Without', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            }
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Empty', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: '',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Too short', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'a'.repeat(VALIDATION.USER_FIRST_NAME_MIN_LENGTH - 1),
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Too long', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'a'.repeat(VALIDATION.USER_FIRST_NAME_MAX_LENGTH + 1),
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
      });
      describe('Last name', () => {
        it('Without', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            }
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Empty', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'TMP',
              lastName: '',
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Too short', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'TMP',
              lastName: 'a'.repeat(VALIDATION.USER_LAST_NAME_MIN_LENGTH - 1),
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Too long', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'TMP',
              lastName: 'a'.repeat(VALIDATION.USER_LAST_NAME_MAX_LENGTH + 1),
              phone: '052-2222222',
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
      });
      describe('Phone', () => {
        it('Without', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'TMP',
              lastName: 'TMP',
              gender: 'male',
              address: 'TMP'
            }
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Empty', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '',
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Too short', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '1'.repeat(VALIDATION.USER_PHONE_MIN_LENGTH - 1),
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Too long', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '1'.repeat(VALIDATION.USER_PHONE_MAX_LENGTH + 1),
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Invalid format', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2abc222',
              gender: 'male',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
      });
      describe('Gender', () => {
        it('Without', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              address: 'TMP'
            }
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Empty', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: '',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Invalid format', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'aaa',
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
      });
      describe('Address', () => {
        it('Without', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male'
            }
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Empty', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: ''
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Too short', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'a'.repeat(VALIDATION.USER_ADDRESS_MIN_LENGTH - 1)
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Too long', async () => {
          const res = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'male',
              address: 'a'.repeat(VALIDATION.USER_ADDRESS_MAX_LENGTH + 1)
            } satisfies CreateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
      });
      it('Duplicate with active user', async () => {
        const userData: CreateUser = {
          email: `${randStr()}@bla.com`,
          password: 'Bla123!@#',
          firstName: 'TMP',
          lastName: 'TMP',
          phone: '052-2222222',
          gender: 'male',
          address: 'TMP'
        };

        let res = await sendHttpRequest<User>(userURL, {
          method: 'post',
          json: userData
        });
        expect(res.statusCode).toBe(StatusCodes.CREATED);
        expect(omit(res.data, 'id', 'createdAt', 'isActive')).toStrictEqual(
          omit(userData, 'password')
        );

        res = await sendHttpRequest<User>(userURL, {
          method: 'post',
          json: userData
        });
        expect(res.statusCode).toBe(StatusCodes.CONFLICT);
        expect(typeof res.data === 'string').toBe(true);
      });
      it('Duplicate with inactive user', async () => {
        const userData: CreateUser = {
          email: `${randStr()}@bla.com`,
          password: 'Bla123!@#',
          firstName: 'TMP',
          lastName: 'TMP',
          phone: '052-2222222',
          gender: 'male',
          address: 'TMP'
        };

        let res = await sendHttpRequest<User>(userURL, {
          method: 'post',
          json: userData
        });
        expect(res.statusCode).toBe(StatusCodes.CREATED);
        expect(omit(res.data, 'id', 'createdAt', 'isActive')).toStrictEqual(
          omit(userData, 'password')
        );

        await deactivateUser(globalThis.db, res.data.id);

        res = await sendHttpRequest<User>(userURL, {
          method: 'post',
          json: userData
        });
        expect(res.statusCode).toBe(StatusCodes.CONFLICT);
        expect(typeof res.data === 'string').toBe(true);
      });
    });
  });

  /********************************************************************************/

  // For all the tests below, we wish we could have used a beforeEachHook to
  // create a user before each test, however, since the tests run concurrently
  // it is not safe, and the result may differ as a result of which test ran
  // first (race-condition). The way we resolved it is to create X number of
  // users and use a different one in every test

  describe('Read', () => {
    const USERS_AMOUNT = 2;
    let usersData: User[] = [];

    beforeAll(async () => {
      usersData = await createUsers(
        [...Array(USERS_AMOUNT)].map(() => {
          return {
            email: `${randStr()}@bla.com`,
            password: 'Bla123!@#',
            firstName: 'TMP',
            lastName: 'TMP',
            phone: '052-2222222',
            gender: 'male',
            address: 'TMP'
          };
        })
      );
    });

    describe('Valid', () => {
      it('Single active', async () => {
        const res = await sendHttpRequest<User>(
          `${userURL}/${usersData[0].id}`,
          { method: 'get' }
        );
        expect(res.statusCode).toBe(StatusCodes.SUCCESS);
        expect(res.data).toStrictEqual(usersData[0]);
      });
      it('Single inactive', async () => {
        await deactivateUser(globalThis.db, usersData[1].id);

        const res = await sendHttpRequest<User>(
          `${userURL}/${usersData[1].id}`,
          { method: 'get' }
        );
        expect(res.statusCode).toBe(StatusCodes.SUCCESS);
        expect(res.data).toStrictEqual({ ...usersData[1], isActive: false });
      });
    });
    describe('Invalid', () => {
      describe('User id', () => {
        it('Without', async () => {
          const res = await sendHttpRequest<unknown>(`${userURL}/`, {
            method: 'get'
          });
          expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Empty', async () => {
          const res = await sendHttpRequest<unknown>(`${userURL}/''`, {
            method: 'get'
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Invalid format', async () => {
          const res = await sendHttpRequest<unknown>(
            `${userURL}/abcdefg12345`,
            { method: 'get' }
          );
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
      });
      it('Non-existent user', async () => {
        const res = await sendHttpRequest<unknown>(
          `${userURL}/${randomUUID()}`,
          { method: 'get' }
        );
        expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
        expect(typeof res.data === 'string').toBe(true);
      });
    });
  });

  /********************************************************************************/

  describe.skip('Update', () => {
    const USERS_AMOUNT = 1;
    let usersData: User[] = [];

    beforeAll(async () => {
      usersData = await createUsers(
        [...Array(USERS_AMOUNT)].map(() => {
          return {
            email: `${randStr()}@bla.com`,
            password: 'Bla123!@#',
            firstName: 'TMP',
            lastName: 'TMP',
            phone: '052-2222222',
            gender: 'male',
            address: 'TMP'
          };
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

  describe('Delete', () => {
    const USERS_AMOUNT = 2;
    let usersData: User[] = [];

    beforeAll(async () => {
      usersData = await createUsers(
        [...Array(USERS_AMOUNT)].map(() => {
          return {
            email: `${randStr()}@bla.com`,
            password: 'Bla123!@#',
            firstName: 'TMP',
            lastName: 'TMP',
            phone: '052-2222222',
            gender: 'male',
            address: 'TMP'
          };
        })
      );
    });

    describe('Valid', () => {
      it('Deactivate user', async () => {
        const res = await sendHttpRequest<string>(
          `${userURL}/${usersData[0].id}`,
          { method: 'delete' }
        );
        expect(res.statusCode).toBe(StatusCodes.SUCCESS);
        expect(res.data).toStrictEqual(usersData[0].id);
      });
      it('Delete user', async () => {
        await deactivateUser(globalThis.db, usersData[1].id);

        const res = await sendHttpRequest<string>(
          `${userURL}/${usersData[1].id}`,
          { method: 'delete' }
        );
        expect(res.statusCode).toBe(StatusCodes.SUCCESS);
        expect(res.data).toStrictEqual(usersData[1].id);
        expect(await checkUserExists(globalThis.db, usersData[1].id)).toBe(
          false
        );
      });
      it('Delete non-existent user', async () => {
        const res = await sendHttpRequest<string>(
          `${userURL}/${randomUUID()}`,
          { method: 'delete' }
        );
        expect(res.statusCode).toBe(StatusCodes.SUCCESS);
        expect(res.data).toStrictEqual('');
      });
    });
    describe('Invalid', () => {
      describe('User id', () => {
        it('Without', async () => {
          const res = await sendHttpRequest<unknown>(`${userURL}/`, {
            method: 'delete'
          });
          expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Empty', async () => {
          const res = await sendHttpRequest<unknown>(`${userURL}/''`, {
            method: 'delete'
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
        it('Invalid format', async () => {
          const res = await sendHttpRequest<unknown>(
            `${userURL}/abcdefg12345`,
            { method: 'delete' }
          );
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
      });
    });
  });
});
