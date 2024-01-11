import { HttpServer } from './server/index.js';
import { Logger, getEnv, getStackTrace } from './utils/index.js';

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
    Logger.nativeLog('warn', `Warning: ${err.message + getStackTrace(err)}`);
  });

  server.listen(serverEnv.port);
};

const globalErrorHandler = (
  server: HttpServer,
  reason: 'exception' | 'rejection'
) => {
  return (err: unknown) => {
    const prefix =
      reason === 'rejection' ? 'Unhandled rejection' : 'Uncaught exception';
    if (err instanceof Error) {
      Logger.nativeLog(
        'error',
        `${prefix}. This may help: ${err.message + getStackTrace(err)}`
      );
    } else {
      Logger.nativeLog('error', prefix);
    }

    server.close();

    // See: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html#error-exception-handling
    process.exitCode = 1;
  };
};

/**********************************************************************************/

await startServer();
