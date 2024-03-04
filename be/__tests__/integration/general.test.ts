import {
  StatusCodes,
  describe,
  expect,
  getRoutes,
  isStressTest,
  it,
  sendHttpRequest
} from '../utils.js';

/**********************************************************************************/

describe.skipIf(isStressTest()).concurrent('General tests', () => {
  const healthCheckURL = getRoutes().health;

  describe('Health check', () => {
    describe('Host', () => {
      it('Valid host', async () => {
        const { data, statusCode } = await sendHttpRequest<unknown>(healthCheckURL, {
          method: 'get'
        });
        expect(statusCode).toBe(StatusCodes.NO_CONTENT);
        expect(typeof data === 'string').toBe(true);
        expect(data).toStrictEqual('');
      });
    });
  });
});
