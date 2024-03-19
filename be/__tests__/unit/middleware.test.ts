import {
  DashboardError,
  Middlewares,
  StatusCodes,
  afterAll,
  createHttpMocks,
  databaseSetup,
  databaseTeardown,
  describe,
  expect,
  isStressTest,
  it,
  vi
} from '../utils.js';

/**********************************************************************************/

const db = databaseSetup();
afterAll(async () => {
  await databaseTeardown(db);
});

describe.skipIf(isStressTest()).concurrent('General tests', () => {
  describe('Health check', () => {
    describe('Method', () => {
      it('Valid method', () => {
        const { request, response } = createHttpMocks(db, {
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
        const reqMethod = 'GET';
        const { request, response } = createHttpMocks(db, {
          method: reqMethod
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
        expect(response._getJSONData()).toStrictEqual(
          `${reqMethod} is not a support method`
        );
      });
    });
    describe('Host', () => {
      it('Invalid method', async () => {
        const callbackMock = vi.fn();
        const { request, response } = createHttpMocks(db, { method: 'POST' });

        const healthCheckMiddleware = Middlewares.healthCheck(
          new Set('localhost'),
          callbackMock
        );
        await healthCheckMiddleware(request, response);
        expect(callbackMock).toHaveBeenCalledTimes(0);
        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
        expect(response._getJSONData()).toStrictEqual(
          `Health check must be a 'HEAD' or 'GET' request`
        );
      });
      it('Invalid host', async () => {
        // Since ky does not allow to change the 'hosts' header programmatically,
        // we test it using mocks instead
        const callbackMock = vi.fn();
        const { request, response } = createHttpMocks(db, {
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
        expect(response._getJSONData()).toStrictEqual(
          `'${request.hostname}' is forbidden to make a healthcheck`
        );
      });
    });
  });
  describe('Error handler', () => {
    it('Headers sent', () => {
      const { request, response } = createHttpMocks(db, {
        method: 'GET'
      });
      response.headersSent = true;
      const callbackMock = vi.fn();
      const errObj = new Error('PH');

      Middlewares.errorHandler(errObj, request, response, callbackMock);
      expect(callbackMock).toHaveBeenCalledTimes(1);
      expect(callbackMock).toHaveBeenLastCalledWith(errObj);
    });
    it('Payload too large', () => {
      const { request, response } = createHttpMocks(db, {
        method: 'GET'
      });
      const callbackMock = vi.fn();
      const errObj = new Error('PH');
      errObj.name = 'PayloadTooLargeError';

      Middlewares.errorHandler(errObj, request, response, callbackMock);
      expect(callbackMock).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(StatusCodes.CONTENT_TOO_LARGE);
      expect(response._getJSONData()).toStrictEqual('Request is too large');
    });
    it('Dashboard error', () => {
      const { request, response } = createHttpMocks(db, {
        method: 'GET'
      });
      const callbackMock = vi.fn();
      const errObj = new DashboardError('PH', StatusCodes.CONFLICT);

      Middlewares.errorHandler(errObj, request, response, callbackMock);
      expect(callbackMock).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(errObj.getCode());
      expect(response._getJSONData()).toStrictEqual(errObj.getMessage());
    });
    it('Unexpected error', () => {
      const { request, response } = createHttpMocks(db, {
        method: 'GET'
      });
      const callbackMock = vi.fn();
      const errObj = new Error('PH');

      Middlewares.errorHandler(errObj, request, response, callbackMock);
      expect(callbackMock).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(StatusCodes.SERVER_ERROR);
      expect(response._getJSONData()).toStrictEqual(
        'Unexpected error, please try again'
      );
    });
  });
});
