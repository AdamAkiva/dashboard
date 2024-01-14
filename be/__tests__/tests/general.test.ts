import {
  Middlewares,
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

  Middlewares;

  describe('Ready check', () => {
    describe('Host', () => {
      describe('Valid', () => {
        it.concurrent('Mock', () => {});
        it.concurrent('Real', async () => {
          const res = await sendHttpRequest<never>(healthCheckURL);

          expect(res.statusCode).toBe(STATUS.NO_CONTENT.CODE);
          expect(res.data).toStrictEqual('');
        });
      });
      describe('Invalid', () => {
        it.concurrent(`Not 'GET' request`, () => {});
        it.concurrent('Invalid host', () => {});
        it.concurrent('Database not ready', () => {});
      });
    });
  });
});
