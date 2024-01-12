import {
  STATUS,
  describe,
  expect,
  inject,
  it,
  sendHttpRequest
} from '../utils.js';

/**********************************************************************************/

describe('General tests', () => {
  const { healthCheckURL } = inject('urls');

  describe('Ready check', () => {
    describe('Host', () => {
      it.concurrent('Valid host', async () => {
        const res = await sendHttpRequest<never>(healthCheckURL);

        expect(res.statusCode).toBe(STATUS.NO_CONTENT.CODE);
        expect(res.data).toStrictEqual('');
      });
      it.concurrent('Invalid host', async () => {
        const res = await sendHttpRequest<never>(healthCheckURL, {
          headers: { host: '213.57.121.34' }
        });

        expect(res.statusCode).toBe(STATUS.FORBIDDEN.CODE);
      });
    });
  });
});
