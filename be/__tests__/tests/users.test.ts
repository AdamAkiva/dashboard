import * as UserController from '../../src/entities/user/controller.js';
import * as UserService from '../../src/entities/user/service.js';
import * as Middlewares from '../../src/server/middleware.js';
import {
  DashboardError,
  STATUS,
  afterEach,
  asyncMockFn,
  checkResponse,
  describe,
  expect,
  getExpressMocks,
  inject,
  it,
  sendHttpRequest,
  usersMockData,
  vi,
  type User
} from '../utils.js';

/**********************************************************************************/

afterEach(() => {
  vi.restoreAllMocks();
});

describe('User Tests', () => {
  const { baseURL } = inject('urls');
  const userRouteURL = `${baseURL}/users`;

  describe('Controller', () => {
    describe('Valid', () => {
      it.concurrent('Mock', async () => {
        const mockReadMany = vi
          .spyOn(UserService, 'readMany')
          .mockImplementation(asyncMockFn(usersMockData));

        const { req, res } = getExpressMocks();
        await UserController.readMany(req, res, vi.fn);

        expect(mockReadMany).toHaveBeenCalledTimes(1);
        expect(mockReadMany).toHaveBeenCalledWith(req);
        expect(res.statusCode).toBe(STATUS.SUCCESS.CODE);
        expect(res._getJSONData()).toStrictEqual(usersMockData);
        checkResponse(res);
      });
      it.concurrent('Real', async () => {
        const res = await sendHttpRequest<User[]>(userRouteURL);

        expect(res.statusCode).toBe(STATUS.SUCCESS.CODE);
        expect(res.data).toStrictEqual([]);
      });
    });
    describe('Invalid', () => {
      it.concurrent('Failure with 500 status code', async () => {
        const err = new DashboardError(
          'Failure to read users',
          STATUS.SERVER_ERROR.CODE
        );
        const mockReadMany = vi
          .spyOn(UserService, 'readMany')
          .mockRejectedValue(err);
        const { req, res } = getExpressMocks();
        const next = vi.fn(() => {
          Middlewares.errorHandler(err, req, res, vi.fn);
        });

        await UserController.readMany(req, res, next);

        expect(mockReadMany).toHaveBeenCalledTimes(1);
        expect(mockReadMany).toHaveBeenCalledWith(req);
        expect(res.statusCode).toBe(err.getCode());
        expect(res._getJSONData()).toStrictEqual(err.getMessage());
        checkResponse(res);
      });
      it.concurrent('Failure with 504 status code', async () => {
        const err = new DashboardError(
          'Database call timed out',
          STATUS.GATEWAY_TIMEOUT.CODE
        );
        const mockReadMany = vi
          .spyOn(UserService, 'readMany')
          .mockRejectedValue(err);
        const { req, res } = getExpressMocks();
        const next = vi.fn(() => {
          Middlewares.errorHandler(err, req, res, vi.fn);
        });

        await UserController.readMany(req, res, next);

        expect(mockReadMany).toHaveBeenCalledTimes(1);
        expect(mockReadMany).toHaveBeenCalledWith(req);
        expect(res.statusCode).toBe(err.getCode());
        expect(res._getJSONData()).toStrictEqual(err.getMessage());
        checkResponse(res);
      });
    });
  });
});
