import {
  compress,
  cors,
  createServer,
  express,
  inspect,
  type Application,
  type Server
} from './types/index.js';

import { getEnv } from './utils/index.js';

/**********************************************************************************/

const startServer = async () => {
  const { mode, server: serverEnv } = getEnv();

  const app = express();
  const server = createServer(app);

  attachServerConfigurations(server);
  await attachMiddleware(app, serverEnv.allowedOrigins);

  attachRoutes(app, serverEnv.healthCheckRoute);

  server.listen(serverEnv.port, () => {
    console.info(
      `Server is running in '${mode}' mode on:` +
        ` ${serverEnv.url}:${serverEnv.port}/${serverEnv.apiRoute}`
    );
  });

  // Once since if any of these errors occur, the server will be shutdown, see:
  // https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html#error-exception-handling
  // For reasoning
  process.once('unhandledRejection', globalErrorHandler(server, 'rejection'));
  process.once('uncaughtException', globalErrorHandler(server, 'exception'));
};

const attachMiddleware = async (
  app: Application,
  allowedOrigins: Set<string>
) => {
  // No need to give the clients the information on which framework we are using
  app.disable('etag').disable('x-powered-by');

  app.use(
    // If you build a server which should not receive any browser requests,
    // feel free to remove cors
    cors({
      // '*' and ['*'] are not the same, hence need to explicitly check for it
      origin:
        allowedOrigins.size === 1
          ? Array.from(allowedOrigins)[0]
          : Array.from(allowedOrigins),
      // Add or remove if you need any additional methods
      methods: ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    }),
    // This is the result of a bug with helmet typescript support, if helmet
    // version is updated, you may check if this is still needed (the dynamic
    // import)
    (await import('helmet')).default({
      contentSecurityPolicy: true /* require-corp */,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-origin' },
      originAgentCluster: true,
      referrerPolicy: { policy: 'no-referrer' },
      strictTransportSecurity: {
        maxAge: 15_552_000, // seconds
        includeSubDomains: true
      },
      xContentTypeOptions: true,
      xDnsPrefetchControl: false,
      xDownloadOptions: true,
      xFrameOptions: { action: 'sameorigin' },
      xPermittedCrossDomainPolicies: { permittedPolicies: 'none' },
      xPoweredBy: false,
      xXssProtection: true
    }),
    compress()
  );
};

const attachRoutes = (app: Application, healthCheckRoute: string) => {
  app.get(`/${healthCheckRoute}`, (_, res) => {
    let notReadyMsg = '';
    // Database/Any other service readiness check should have the same format
    // as below
    try {
      // Put the check here
    } catch (err) {
      notReadyMsg += '\nDatabase is unavailable';
    }
    if (notReadyMsg) {
      notReadyMsg = `Application is not available: ${notReadyMsg}`;
    }
    if (notReadyMsg) {
      return res.status(503).send(notReadyMsg);
    }

    return res.status(204).end();
  });
};

const attachServerConfigurations = (server: Server) => {
  // See: https://nodejs.org/api/http.html
  // Change these values according to the server needs. These values (imo) are
  // better defaults than the one node supplies
  server.maxHeadersCount = 256;
  server.headersTimeout = 16_000; // millis
  server.requestTimeout = 32_000; // millis
  server.timeout = 524_288; // millis
  server.maxRequestsPerSocket = 0; // No request limit
  server.keepAliveTimeout = 4_000; // millis
};

const globalErrorHandler = (
  server: Server,
  reason: 'exception' | 'rejection'
) => {
  return (err: unknown) => {
    console.error(`Unhandled ${reason}. This may help:\n ${inspect(err)}`);

    server.close();
    process.exitCode = 1;
  };
};

/**********************************************************************************/

await startServer();
