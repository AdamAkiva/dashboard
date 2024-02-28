import {
  StatusCodes,
  describe,
  expect,
  healthCheckURL,
  it,
  sendHttpRequest
} from '../utils.js';

/**********************************************************************************/

describe.concurrent('General tests', () => {
  describe('Health check', () => {
    describe('Host', () => {
      it('Valid host', async () => {
        const res = await sendHttpRequest<never>(healthCheckURL, {
          method: 'get'
        });

        expect(res.statusCode).toBe(StatusCodes.NO_CONTENT);
        expect(res.data).toStrictEqual('');
      });
    });
  });
});
