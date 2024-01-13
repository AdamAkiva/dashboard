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
      it.skip.concurrent('Invalid host', async () => {
        // TODO Mock this instead. Ky can't override the host header. Therefore
        // call the method directly and mock req object with the host header
        const res = await sendHttpRequest<never>(healthCheckURL, {
          method: 'get',
          headers: { host: '213.57.121.34' }
        });

        expect(res.statusCode).toBe(STATUS.FORBIDDEN.CODE);
      });
    });
  });
});
