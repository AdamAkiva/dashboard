import {
  STATUS,
  afterEach,
  controllers,
  describe,
  errorHandler,
  expect,
  getExpressMocks,
  it,
  services,
  usersMockData,
  vi
} from '../utils.js';

/**********************************************************************************/

afterEach(() => {
  vi.restoreAllMocks();
});

const { userController } = controllers;
const { userService } = services;

describe('User Tests', () => {
  describe('Unit tests', () => {
    it.concurrent('Success with 200 status code', async () => {
      const mockReadMany = vi
        .spyOn(userService, 'readMany')
        .mockImplementation(async () => {
          return await Promise.resolve(usersMockData);
        });

      const { req, res } = getExpressMocks();
      await userController.readMany(req, res, vi.fn);

      expect(mockReadMany).toHaveBeenCalledTimes(1);
      expect(mockReadMany).toHaveBeenCalledWith(req);
      expect(res.statusCode).toBe(STATUS.SUCCESS.CODE);
      expect(res._getJSONData()).toStrictEqual(usersMockData);
    });
    it.concurrent('Failure with 500 status code', async () => {
      const mockReadMany = vi
        .spyOn(userService, 'readMany')
        .mockRejectedValue(new Error('Failure to read users'));

      const { req, res } = getExpressMocks();
      const next = vi.fn((err) => {
        errorHandler(err, req, res, vi.fn);
      });
      await userController.readMany(req, res, next);

      expect(mockReadMany).toHaveBeenCalledTimes(1);
      expect(mockReadMany).toHaveBeenCalledWith(req);
      expect(res.statusCode).toBe(STATUS.SERVER_ERROR.CODE);
    });
  });
});
