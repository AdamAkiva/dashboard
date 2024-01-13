import { HttpServer } from '../../src/server/index.js';
import { logger } from '../../src/utils/index.js';

/**********************************************************************************/

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setup = async ({ provide }: any) => {
  const { mode, server: serverEnv, db: dbUri } = getTestEnv();

  provide('urls', {
    baseURL: `${serverEnv.base}:${serverEnv.port}/${serverEnv.apiRoute}`,
    healthCheckURL: `${serverEnv.base}:${serverEnv.port}/${serverEnv.healthCheckRoute}`
  });

  const server = await HttpServer.create({
    mode: mode,
    dbData: { name: 'dashboard-pg-test', uri: dbUri },
    routes: {
      api: `/${serverEnv.apiRoute}`,
      health: `/${serverEnv.healthCheckRoute}`
    },
    allowedOrigins: []
  });

  server.listen(serverEnv.port);

  return async () => {
    const { getHandler, getModels } = server.getDatabase();
    const handler = getHandler();
    const models = getModels();

    /* eslint-disable drizzle/enforce-delete-with-where */
    await handler.delete(models.userModel);
    /* eslint-enable drizzle/enforce-delete-with-where */

    server.close();
  };
};

/**********************************************************************************/

export const getTestEnv = () => {
  const mode = process.env.NODE_ENV;
  checkRuntimeEnv(mode);
  checkEnvVariables();

  return {
    mode: process.env.NODE_ENV as 'test',
    server: {
      base: 'http://localhost',
      port: process.env.TEST_SERVER_PORT!,
      apiRoute: process.env.API_ROUTE!,
      healthCheckRoute: process.env.HEALTH_CHECK_ROUTE!
    },
    db: process.env.DB_TEST_URI!
  };
};

const checkRuntimeEnv = (mode?: string | undefined): mode is 'test' => {
  if (mode && mode === 'test') {
    return true;
  }

  logger.fatal(
    `Missing or invalid 'NODE_ENV' env value, should never happen.` +
      ' Unresolvable, exiting...'
  );

  process.kill(process.pid, 'SIGTERM');
  throw new Error('Graceful shutdown');
};

const checkEnvVariables = () => {
  let missingValues = '';
  checkMissingEnvVariables().forEach((val, key) => {
    if (!process.env[key]) {
      missingValues += `* ${val}\n`;
    }
  });

  if (missingValues) {
    logger.fatal(`\nMissing the following env vars: ${missingValues}`);

    process.kill(process.pid, 'SIGTERM');
    throw new Error('Graceful shutdown');
  }
};

const checkMissingEnvVariables = () => {
  return new Map<string, string>([
    ['TEST_SERVER_PORT', `Missing 'TEST_SERVER_PORT', env variable`],
    ['API_ROUTE', `Missing 'API_ROUTE', env variable`],
    ['HEALTH_CHECK_ROUTE', `Missing 'HEALTH_CHECK_ROUTE', env variable`],
    ['DB_TEST_URI', `Missing 'DB_TEST_URI', env variable`]
  ]);
};
