import {
  DashboardError,
  Middlewares,
  STATUS,
  afterEach,
  asyncMockFn,
  describe,
  emptyMockFn,
  expect,
  getExpressMocks,
  inject,
  it,
  sendHttpRequest,
  vi
} from '../utils.js';

/**********************************************************************************/

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Middleware tests', () => {
  const { healthCheckURL } = inject('urls');

  describe('Check method', () => {
    it.concurrent('Valid', () => {
      const next = emptyMockFn();
      const { req, res } = getExpressMocks({ method: 'GET' });

      Middlewares.checkMethod(new Set(['GET', 'POST']))(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
    it.concurrent('Invalid', () => {
      const next = emptyMockFn();
      const { req, res } = getExpressMocks({ method: 'PATCH' });

      Middlewares.checkMethod(new Set(['GET', 'POST']))(req, res, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(res.statusCode).toBe(STATUS.NOT_ALLOWED.CODE);
      expect(res._getJSONData()).toStrictEqual(STATUS.NOT_ALLOWED.MSG);
    });
  });
  describe('Health check', () => {
    describe('Valid', () => {
      it.concurrent('Mock', async () => {
        const callback = asyncMockFn('');
        const { req, res } = getExpressMocks({
          method: 'GET',
          headers: { host: 'localhost' }
        });

        await Middlewares.healthCheck(callback)(req, res);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith();
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
        const callback = asyncMockFn('');
        const { req, res } = getExpressMocks({
          method: 'POST',
          headers: { host: 'localhost' }
        });

        await Middlewares.healthCheck(callback)(req, res);

        expect(callback).toHaveBeenCalledTimes(0);
        expect(res.statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
      it.concurrent('Invalid host name', async () => {
        const readyCallbackMock = asyncMockFn('');

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
        const readyCallbackMock = asyncMockFn(`${errMsg}\n`);
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
  it.concurrent('Attach context', () => {
    const next = emptyMockFn();
    const { req, res } = getExpressMocks();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Middlewares.attachContext({} as any)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req).toHaveProperty('dashboard');
    expect(req.dashboard).toHaveProperty('logger');
    expect(req.dashboard).toHaveProperty('db');
  });
  it.concurrent('Handle missed routes', () => {
    const { req, res } = getExpressMocks();

    Middlewares.handleMissedRoutes(req, res);

    expect(res.statusCode).toBe(STATUS.NOT_FOUND.CODE);
    expect(res._getJSONData()).toStrictEqual(STATUS.NOT_FOUND.MSG);
  });
  describe('Error handler', () => {
    it.concurrent('Headers sent', () => {
      const next = emptyMockFn();
      const err = new Error();
      const { req, res } = getExpressMocks();
      res.headersSent = true;

      Middlewares.errorHandler(err, req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(err);
    });
    it.concurrent('Request too big', () => {
      const next = emptyMockFn();
      const err = new Error();
      err.name = 'PayloadTooLargeError';
      const { req, res } = getExpressMocks();

      Middlewares.errorHandler(err, req, res, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(res.statusCode).toBe(STATUS.PAYLOAD_TOO_LARGE.CODE);
      expect(res._getJSONData()).toStrictEqual(STATUS.PAYLOAD_TOO_LARGE.MSG);
    });
    it.concurrent('Dashboard error', () => {
      const next = emptyMockFn();
      const err = new DashboardError('PH', 99);
      const { req, res } = getExpressMocks();

      Middlewares.errorHandler(err, req, res, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(res.statusCode).toBe(err.getCode());
      expect(res._getJSONData()).toStrictEqual(err.getMessage());
    });
    it.concurrent('Unexpected error', () => {
      const next = emptyMockFn();
      const err = new Error('Unexpected error, please try again');
      const { req, res } = getExpressMocks();

      Middlewares.errorHandler(err, req, res, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(res.statusCode).toBe(STATUS.SERVER_ERROR.CODE);
      expect(res._getJSONData()).toStrictEqual(err.message);
    });
  });
});
