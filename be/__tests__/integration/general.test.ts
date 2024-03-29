import {
  StatusCodes,
  afterAll,
  databaseSetup,
  databaseTeardown,
  describe,
  expect,
  getRoutes,
  isStressTest,
  it,
  sendHttpRequest
} from '../utils.js';

/**********************************************************************************/

const db = databaseSetup();
afterAll(async () => {
  await databaseTeardown(db);
});

describe.skipIf(isStressTest()).concurrent('General tests', () => {
  const healthCheckURL = getRoutes().health;

  describe('Health check', () => {
    describe('Host', () => {
      it('Valid host', async () => {
        const { data, statusCode } = await sendHttpRequest<unknown>(
          healthCheckURL,
          {
            method: 'get'
          }
        );
        expect(statusCode).toBe(StatusCodes.NO_CONTENT);
        expect(typeof data === 'string').toBe(true);
        expect(data).toStrictEqual('');
      });
    });
  });
});
