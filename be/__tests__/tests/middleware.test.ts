import {
  Middlewares,
  STATUS,
  describe,
  expect,
  getExpressMocks,
  inject,
  it,
  sendHttpRequest,
  vi
} from '../utils.js';

/**********************************************************************************/

describe('Middleware tests', () => {
  const { healthCheckURL } = inject('urls');

  describe('Check method', () => {
    it.concurrent.skip('Valid', () => {});
    it.concurrent.skip('Invalid', () => {});
  });
  describe('Health check', () => {
    describe('Valid', () => {
      it.concurrent('Mock', async () => {
        const readyCallbackMock = vi.fn(async () => {
          return await Promise.resolve('');
        });

        const { req, res } = getExpressMocks({
          method: 'GET',
          headers: { host: 'localhost' }
        });
        await Middlewares.healthCheck(readyCallbackMock)(req, res);

        expect(readyCallbackMock).toHaveBeenCalledTimes(1);
        expect(readyCallbackMock).toHaveBeenCalledWith();
        expect(res.statusCode).toBe(STATUS.NO_CONTENT.CODE);
        expect(res._getData()).toStrictEqual('');
      });
      it.concurrent('Real', async () => {
        const res = await sendHttpRequest<never>(healthCheckURL);

        expect(res.statusCode).toBe(STATUS.NO_CONTENT.CODE);
        expect(res.data).toStrictEqual('');
      });
    });
    describe('Invalid', () => {
      it.concurrent(`Not a 'GET' request`, async () => {
        const readyCallbackMock = vi.fn(async () => {
          return await Promise.resolve('');
        });

        const { req, res } = getExpressMocks({
          method: 'POST',
          headers: { host: 'localhost' }
        });
        await Middlewares.healthCheck(readyCallbackMock)(req, res);

        expect(readyCallbackMock).toHaveBeenCalledTimes(0);
        expect(res.statusCode).toBe(STATUS.BAD_REQUEST.CODE);
        expect(res._getJSONData()).toStrictEqual(
          `Health check must be a 'GET' request`
        );
      });
      it.concurrent('Invalid host name', async () => {
        const readyCallbackMock = vi.fn(async () => {
          return await Promise.resolve('');
        });

        const { req, res } = getExpressMocks({
          method: 'GET',
          headers: { host: '213.72.121.17' }
        });
        await Middlewares.healthCheck(readyCallbackMock)(req, res);

        expect(readyCallbackMock).toHaveBeenCalledTimes(0);
        expect(res.statusCode).toBe(STATUS.FORBIDDEN.CODE);
        expect(res._getJSONData()).toStrictEqual(STATUS.FORBIDDEN.MSG);
      });
      it.concurrent('One or more services are not yet ready', async () => {
        const errMsg = 'Database is not ready';
        const readyCallbackMock = vi.fn(async () => {
          return await Promise.resolve(`${errMsg}\n`);
        });

        const { req, res } = getExpressMocks({
          method: 'GET',
          headers: { host: 'localhost' }
        });
        await Middlewares.healthCheck(readyCallbackMock)(req, res);

        expect(readyCallbackMock).toHaveBeenCalledTimes(1);
        expect(readyCallbackMock).toHaveBeenCalledWith();
        expect(res.statusCode).toBe(STATUS.GATEWAY_TIMEOUT.CODE);
        expect(res._getJSONData().includes(errMsg)).toBe(true);
      });
    });
  });
  describe('Attach context', () => {
    it.concurrent.skip('Valid', () => {});
    it.concurrent.skip('Invalid', () => {});
  });
  it.concurrent.skip('Handle missed routes', () => {});
  describe('Error handler', () => {
    it.concurrent.skip('Headers sent', () => {});
    it.concurrent.skip('Request too big', () => {});
    it.concurrent.skip('Dashboard error', () => {});
    it.concurrent.skip('Unexpected error', () => {});
  });
});
