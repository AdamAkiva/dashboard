import { HttpServer } from './server/index.js';
import { getEnv, logger } from './utils/index.js';

/**********************************************************************************/

const startServer = async () => {
  const { mode, server: serverEnv, db: dbUri } = getEnv();

  const server = await HttpServer.create({
    mode: mode,
    dbData: { name: `dashboard-postgres-${mode}`, uri: dbUri },
    routes: {
      api: `/${serverEnv.apiRoute}`,
      health: `/${serverEnv.healthCheckRoute}`
    },
    allowedOrigins: serverEnv.allowedOrigins
  });

  process.once('unhandledRejection', globalErrorHandler(server, 'rejection'));
  process.once('uncaughtException', globalErrorHandler(server, 'exception'));

  process.on('warning', (err) => {
    logger.warn(err);
  });

  server.listen(serverEnv.port);
};

const globalErrorHandler = (
  server: HttpServer,
  reason: 'exception' | 'rejection'
) => {
  return (err: unknown) => {
    logger.fatal(err, `Unhandled ${reason}`);

    server.close();

    // See: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html#error-exception-handling
    process.exitCode = 1;
  };
};

/**********************************************************************************/

await startServer();
