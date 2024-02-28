import {
  Middlewares,
  StatusCodes,
  createHttpMocks,
  describe,
  expect,
  healthCheckURL,
  it,
  sendHttpRequest,
  vi
} from './utils.js';

/**********************************************************************************/

describe.concurrent('General tests', () => {
  describe('Health check', () => {
    describe('Method', () => {
      it('Valid method', () => {
        const { request, response } = createHttpMocks({
          method: 'GET'
        });
        const callbackMock = vi.fn();

        const checkMethodMiddleware = Middlewares.checkMethod(
          new Set([
            'HEAD',
            'GET',
            'POST',
            'PUT',
            'PATCH',
            'DELETE',
            'OPTIONS'
          ] as const)
        );
        checkMethodMiddleware(request, response, callbackMock);
        expect(callbackMock).toHaveBeenCalledTimes(1);
      });
      it('Invalid method', () => {
        const { request, response } = createHttpMocks({
          method: 'GET'
        });
        const callbackMock = vi.fn();

        const checkMethodMiddleware = Middlewares.checkMethod(
          new Set([
            'HEAD',
            'POST',
            'PUT',
            'PATCH',
            'DELETE',
            'OPTIONS'
          ] as const)
        );
        checkMethodMiddleware(request, response, callbackMock);
        expect(callbackMock).toHaveBeenCalledTimes(0);
        expect(response.statusCode).toBe(StatusCodes.NOT_ALLOWED);
      });
    });
    describe('Host', () => {
      it('Valid host', async () => {
        const res = await sendHttpRequest<never>(healthCheckURL, {
          method: 'get'
        });

        expect(res.statusCode).toBe(StatusCodes.NO_CONTENT);
        expect(res.data).toStrictEqual('');
      });
      it('Invalid method', async () => {
        const res = await sendHttpRequest<never>(healthCheckURL, {
          method: 'post'
        });

        expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
      it('Invalid host', async () => {
        // Since ky does not allow to change the 'hosts' header programmatically,
        // we test it using mocks instead
        const callbackMock = vi.fn();
        const { request, response } = createHttpMocks({
          method: 'GET',
          headers: { host: '142.250.81.238' }
        });

        const healthCheckMiddleware = Middlewares.healthCheck(
          new Set(),
          callbackMock
        );
        await healthCheckMiddleware(request, response);
        expect(callbackMock).toHaveBeenCalledTimes(0);
        expect(response.statusCode).toBe(StatusCodes.FORBIDDEN);
      });
    });
  });
  describe('Error handler', () => {
    it('Headers sent', () => {});
    it('Payload too large', () => {});
    it('Dashboard instance', () => {});
    it('Unexpected error', () => {});
  });
});
