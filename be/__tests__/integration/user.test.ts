import {
  StatusCodes,
  VALIDATION,
  beforeAll,
  checkUserExists,
  checkUserPasswordMatch,
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
  type UpdateUser,
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

        const { data, statusCode } = await sendHttpRequest<User>(userURL, {
          method: 'post',
          json: userData
        });
        expect(statusCode).toBe(StatusCodes.CREATED);
        expect(omit(data, 'id')).toStrictEqual(omit(userData, 'password'));
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
        responses.forEach(({ data, statusCode }) => {
          expect(statusCode).toBe(StatusCodes.CREATED);
          const userData = usersData.find((user) => {
            return user.email === data.email;
          })!;
          expect(omit(data, 'id')).toStrictEqual(omit(userData, 'password'));
        });
      });
      it('A lot', async () => {
        const usersData: CreateUser[] = [...Array(1_024)].map(() => {
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
        responses.forEach(({ data, statusCode }) => {
          expect(statusCode).toBe(StatusCodes.CREATED);
          const userData = usersData.find((user) => {
            return user.email === data.email;
          })!;
          expect(omit(data, 'id')).toStrictEqual(omit(userData, 'password'));
        });
      });
    });
    describe('Invalid', () => {
      describe('Email', () => {
        it('Without', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Empty', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too short', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too long', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Invalid format', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
      });
      describe('Password', () => {
        it('Without', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Empty', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too short', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too long', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
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
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Empty', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too short', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too long', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
      });
      describe('Last name', () => {
        it('Without', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Empty', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too short', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too long', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
      });
      describe('Phone', () => {
        it('Without', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Empty', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too short', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too long', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Invalid format', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
      });
      describe('Gender', () => {
        it('Without', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Empty', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: '' as CreateUser['gender'],
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Invalid format', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
            method: 'post',
            json: {
              email: `${randStr()}@bla.com`,
              password: 'Bamba123!@#',
              firstName: 'TMP',
              lastName: 'TMP',
              phone: '052-2222222',
              gender: 'aaa' as CreateUser['gender'],
              address: 'TMP'
            } satisfies CreateUser
          });
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
      });
      describe('Address', () => {
        it('Without', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Empty', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too short', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too long', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(userURL, {
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
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
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
        expect(omit(res.data, 'id')).toStrictEqual(omit(userData, 'password'));

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
        expect(omit(res.data, 'id')).toStrictEqual(omit(userData, 'password'));

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
    // Match this number to the amount of tests needing a unique user
    // database entry
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
        const { data, statusCode } = await sendHttpRequest<User>(
          `${userURL}/${usersData[0].id}`,
          { method: 'get' }
        );
        expect(statusCode).toBe(StatusCodes.SUCCESS);
        expect(data).toStrictEqual(usersData[0]);
      });
      it('Single inactive', async () => {
        await deactivateUser(globalThis.db, usersData[1].id);

        const { data, statusCode } = await sendHttpRequest<User>(
          `${userURL}/${usersData[1].id}`,
          { method: 'get' }
        );
        expect(statusCode).toBe(StatusCodes.SUCCESS);
        expect(data).toStrictEqual(usersData[1]);
      });
    });
    describe('Invalid', () => {
      describe('User id', () => {
        it('Without', async () => {
          const { data, statusCode } = await sendHttpRequest<unknown>(
            `${userURL}/`,
            { method: 'get' }
          );
          expect(statusCode).toBe(StatusCodes.NOT_FOUND);
          expect(typeof data === 'string').toBe(true);
        });
        it('Empty', async () => {
          const { data, statusCode } = await sendHttpRequest<unknown>(
            `${userURL}/''`,
            { method: 'get' }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Invalid format', async () => {
          const { data, statusCode } = await sendHttpRequest<unknown>(
            `${userURL}/abcdefg12345`,
            { method: 'get' }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
      });
      it('Non-existent user', async () => {
        const { data, statusCode } = await sendHttpRequest<unknown>(
          `${userURL}/${randomUUID()}`,
          { method: 'get' }
        );
        expect(statusCode).toBe(StatusCodes.NOT_FOUND);
        expect(typeof data === 'string').toBe(true);
      });
    });
  });

  /********************************************************************************/

  describe('Update', () => {
    // Match this number to the amount of tests needing a unique user
    // database entry
    const USERS_AMOUNT = 11;
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
      it('Update email', async () => {
        const updatedEmail = `${randStr()}@bla.com`;

        const { data, statusCode } = await sendHttpRequest<User>(
          `${userURL}/${usersData[0].id}`,
          {
            method: 'patch',
            json: { email: updatedEmail } satisfies UpdateUser
          }
        );
        expect(statusCode).toBe(StatusCodes.SUCCESS);
        expect(data).toStrictEqual({ ...usersData[0], email: updatedEmail });
      });
      it('Update password', async () => {
        const updatedPassword = `Bisli123!@#`;

        const { statusCode } = await sendHttpRequest<User>(
          `${userURL}/${usersData[1].id}`,
          {
            method: 'patch',
            json: { password: updatedPassword } satisfies UpdateUser
          }
        );
        expect(statusCode).toBe(StatusCodes.SUCCESS);
        // Currently there is not route to get password, and there probably will
        // never be one, so we check directly against the database
        expect(
          await checkUserPasswordMatch({
            db: globalThis.db,
            userId: usersData[1].id,
            expectedPassword: updatedPassword
          })
        );
      });
      it('Update first name', async () => {
        const updatedFirstName = 'BLA';

        const { data, statusCode } = await sendHttpRequest<User>(
          `${userURL}/${usersData[2].id}`,
          {
            method: 'patch',
            json: { firstName: updatedFirstName } satisfies UpdateUser
          }
        );
        expect(statusCode).toBe(StatusCodes.SUCCESS);
        expect(data).toStrictEqual({
          ...usersData[2],
          firstName: updatedFirstName
        });
      });
      it('Update last name', async () => {
        const updatedLastName = 'BLA';

        const { data, statusCode } = await sendHttpRequest<User>(
          `${userURL}/${usersData[3].id}`,
          {
            method: 'patch',
            json: { lastName: updatedLastName } satisfies UpdateUser
          }
        );
        expect(statusCode).toBe(StatusCodes.SUCCESS);
        expect(data).toStrictEqual({
          ...usersData[3],
          lastName: updatedLastName
        });
      });
      it('Update phone', async () => {
        const updatedPhone = '054-3333333';

        const { data, statusCode } = await sendHttpRequest<User>(
          `${userURL}/${usersData[4].id}`,
          {
            method: 'patch',
            json: { phone: updatedPhone } satisfies UpdateUser
          }
        );
        expect(statusCode).toBe(StatusCodes.SUCCESS);
        expect(data).toStrictEqual({ ...usersData[4], phone: updatedPhone });
      });
      it('Update gender', async () => {
        const updatedGender = 'other';

        const { data, statusCode } = await sendHttpRequest<User>(
          `${userURL}/${usersData[5].id}`,
          {
            method: 'patch',
            json: { gender: updatedGender } satisfies UpdateUser
          }
        );
        expect(statusCode).toBe(StatusCodes.SUCCESS);
        expect(data).toStrictEqual({ ...usersData[5], gender: updatedGender });
      });
      it('Update address', async () => {
        const updatedAddress = 'BLA';

        const { data, statusCode } = await sendHttpRequest<User>(
          `${userURL}/${usersData[6].id}`,
          {
            method: 'patch',
            json: { address: updatedAddress } satisfies UpdateUser
          }
        );
        expect(statusCode).toBe(StatusCodes.SUCCESS);
        expect(data).toStrictEqual({
          ...usersData[6],
          address: updatedAddress
        });
      });
      it('All possible fields', async () => {
        const updatedData: UpdateUser = {
          email: `${randStr()}@bla.com`,
          password: 'Bisli123!@#',
          firstName: 'BLA',
          lastName: 'BLA',
          phone: '054-3333333',
          gender: 'other',
          address: 'BLA'
        };

        const { data, statusCode } = await sendHttpRequest<User>(
          `${userURL}/${usersData[7].id}`,
          { method: 'patch', json: updatedData }
        );
        expect(statusCode).toBe(StatusCodes.SUCCESS);
        expect(data).toStrictEqual({
          ...usersData[7],
          ...omit(updatedData, 'password')
        });
        // Currently there is not route to get password, and there probably will
        // never be one, so we check directly against the database
        expect(
          await checkUserPasswordMatch({
            db: globalThis.db,
            userId: usersData[7].id,
            expectedPassword: updatedData.password!
          })
        );
      });
    });
    describe('Invalid', () => {
      describe('Email', () => {
        it('Empty', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                email: ''
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too short', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                email: 'a'.repeat(VALIDATION.USER_EMAIL_MIN_LENGTH - 1)
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too long', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                email: 'a'.repeat(VALIDATION.USER_EMAIL_MAX_LENGTH + 1)
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Invalid format', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                email: `${randStr()}@bla`
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
      });
      describe('Password', () => {
        it('Empty', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                password: ''
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too short', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                password: 'a'.repeat(VALIDATION.USER_PASSWORD_MIN_LENGTH - 1)
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too long', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                password: 'a'.repeat(VALIDATION.USER_PASSWORD_MAX_LENGTH + 1)
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Invalid format', async () => {
          let res = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                password: 'BAMBA123!@#' // Missing lower case character(s)
              } satisfies UpdateUser
            }
          );
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);

          res = await sendHttpRequest<string>(`${userURL}/${randomUUID()}`, {
            method: 'patch',
            json: {
              password: 'bamba123!@#' // Missing upper case character(s)
            } satisfies UpdateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);

          res = await sendHttpRequest<string>(`${userURL}/${randomUUID()}`, {
            method: 'patch',
            json: {
              password: 'Bamba123' // Missing special character(s)
            } satisfies UpdateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);

          res = await sendHttpRequest<string>(`${userURL}/${randomUUID()}`, {
            method: 'patch',
            json: {
              password: 'bamba!@#' // Missing digit character
            } satisfies UpdateUser
          });
          expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof res.data === 'string').toBe(true);
        });
      });
      describe('First name', () => {
        it('Empty', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                firstName: ''
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too short', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                firstName: 'a'.repeat(VALIDATION.USER_FIRST_NAME_MIN_LENGTH - 1)
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too long', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                firstName: 'a'.repeat(VALIDATION.USER_FIRST_NAME_MAX_LENGTH + 1)
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
      });
      describe('Last name', () => {
        it('Empty', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                lastName: ''
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too short', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                lastName: 'a'.repeat(VALIDATION.USER_LAST_NAME_MIN_LENGTH - 1)
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too long', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                lastName: 'a'.repeat(VALIDATION.USER_LAST_NAME_MAX_LENGTH + 1)
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
      });
      describe('Phone', () => {
        it('Empty', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                phone: ''
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too short', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                phone: '1'.repeat(VALIDATION.USER_PHONE_MIN_LENGTH - 1)
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too long', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                phone: '1'.repeat(VALIDATION.USER_PHONE_MAX_LENGTH + 1)
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Invalid format', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                phone: '052-2abc222'
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
      });
      describe('Gender', () => {
        it('Empty', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                gender: '' as UpdateUser['gender']
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Invalid format', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                gender: 'aaa' as UpdateUser['gender']
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
      });
      describe('Address', () => {
        it('Empty', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                address: ''
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too short', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                address: 'a'.repeat(VALIDATION.USER_ADDRESS_MIN_LENGTH - 1)
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Too long', async () => {
          const { data, statusCode } = await sendHttpRequest<string>(
            `${userURL}/${randomUUID()}`,
            {
              method: 'patch',
              json: {
                address: 'a'.repeat(VALIDATION.USER_ADDRESS_MAX_LENGTH + 1)
              } satisfies UpdateUser
            }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
      });
      it('Duplicate with active user', async () => {
        const { data, statusCode } = await sendHttpRequest<string>(
          `${userURL}/${usersData[8].id}`,
          {
            method: 'patch',
            json: {
              email: usersData[1].email
            } satisfies UpdateUser
          }
        );
        expect(statusCode).toBe(StatusCodes.CONFLICT);
        expect(typeof data === 'string').toBe(true);
      });
      it('Duplicate with inactive user', async () => {
        await deactivateUser(globalThis.db, usersData[10].id);

        const { data, statusCode } = await sendHttpRequest<string>(
          `${userURL}/${usersData[9].id}`,
          {
            method: 'patch',
            json: {
              email: usersData[10].email
            } satisfies UpdateUser
          }
        );
        expect(statusCode).toBe(StatusCodes.CONFLICT);
        expect(typeof data === 'string').toBe(true);
      });
    });
  });

  /********************************************************************************/

  describe('Delete', () => {
    // Match this number to the amount of tests needing a unique user
    // database entry
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
        const { data, statusCode } = await sendHttpRequest<string>(
          `${userURL}/${usersData[0].id}`,
          { method: 'delete' }
        );
        expect(statusCode).toBe(StatusCodes.SUCCESS);
        expect(data).toStrictEqual(usersData[0].id);
      });
      it('Delete user', async () => {
        await deactivateUser(globalThis.db, usersData[1].id);

        const { data, statusCode } = await sendHttpRequest<string>(
          `${userURL}/${usersData[1].id}`,
          { method: 'delete' }
        );
        expect(statusCode).toBe(StatusCodes.SUCCESS);
        expect(data).toStrictEqual(usersData[1].id);
        expect(await checkUserExists(globalThis.db, usersData[1].id)).toBe(
          false
        );
      });
      it('Delete non-existent user', async () => {
        const { data, statusCode } = await sendHttpRequest<string>(
          `${userURL}/${randomUUID()}`,
          { method: 'delete' }
        );
        expect(statusCode).toBe(StatusCodes.SUCCESS);
        expect(data).toStrictEqual('');
      });
    });
    describe('Invalid', () => {
      describe('User id', () => {
        it('Without', async () => {
          const { data, statusCode } = await sendHttpRequest<unknown>(
            `${userURL}/`,
            { method: 'delete' }
          );
          expect(statusCode).toBe(StatusCodes.NOT_FOUND);
          expect(typeof data === 'string').toBe(true);
        });
        it('Empty', async () => {
          const { data, statusCode } = await sendHttpRequest<unknown>(
            `${userURL}/''`,
            { method: 'delete' }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
        it('Invalid format', async () => {
          const { data, statusCode } = await sendHttpRequest<unknown>(
            `${userURL}/abcdefg12345`,
            { method: 'delete' }
          );
          expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
          expect(typeof data === 'string').toBe(true);
        });
      });
    });
  });
});
