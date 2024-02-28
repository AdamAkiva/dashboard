import type { DatabaseHandler } from '../db/index.js';
import { userRouter } from '../entities/index.js';
import {
  compress,
  cors,
  createServer,
  express,
  resolve,
  type Logger,
  type Mode,
  type NextFunction,
  type Request,
  type Response
} from '../types/index.js';
import { isDevelopmentMode, isProductionMode } from '../utils/index.js';

import * as Middlewares from './middleware.js';

/**********************************************************************************/

export default class HttpServer {
  private static readonly OPENAPI_FILE = resolve(
    new URL('', import.meta.url).pathname,
    '../../../assets/openapi.html'
  );
  private static readonly ALLOWED_METHODS = new Set<string>([
    'HEAD',
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ]);

  private readonly _mode;
  private readonly _db;
  private readonly _logger;

  private readonly _app;
  private readonly _server;

  public constructor(params: {
    mode: Mode;
    db: DatabaseHandler;
    logger: Logger;
  }) {
    this._mode = params.mode;
    this._db = params.db;
    this._logger = params.logger;

    this._app = express().disable('etag').disable('x-powered-by');
    this._server = createServer(this._app);

    this._attachConfigurations();
    this._attachEventHandlers(this._logger);
  }

  public listen(port: number | string, callback?: () => void) {
    port = typeof port === 'string' ? Number(port) : port;

    return this._server.listen(port, callback);
  }

  public close() {
    this._server.close();
  }

  public async attachConfigurationMiddlewares(
    allowedOrigins: Set<string> = new Set<string>()
  ) {
    this._app.use(
      Middlewares.checkMethod(HttpServer.ALLOWED_METHODS),
      cors({
        credentials: true,
        methods: Array.from(HttpServer.ALLOWED_METHODS),
        origin:
          allowedOrigins.size === 1
            ? Array.from(allowedOrigins)[0]
            : Array.from(allowedOrigins)
      }),
      compress()
    );
    if (isProductionMode(this._mode)) {
      this._app.use(
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
        })
      );
    }
  }

  public attachRoutesMiddlewares(params: {
    allowedHosts: Set<string>;
    readyCheck: () => Promise<string> | string;
    logMiddleware: (req: Request, res: Response, next: NextFunction) => void;
    routes: { api: string; health: string };
  }) {
    const {
      allowedHosts,
      readyCheck,
      logMiddleware,
      routes: { api: apiRoute, health: healthCheckRoute }
    } = params;

    if (isDevelopmentMode(this._mode)) {
      this._attachAPIDocs(apiRoute);
    }

    this._app
      .get(healthCheckRoute, Middlewares.healthCheck(allowedHosts, readyCheck))
      // The middlewares are executed in order (as set by express) and there's
      // no point to log every health check or every call to the api-docs
      // (development only), so the log middleware comes after the health
      // check route
      .use(logMiddleware)
      .use(
        apiRoute,
        Middlewares.attachContext(this._db, this._logger),
        userRouter
      )
      // Non-existent route & error handler
      .use(Middlewares.handleMissedRoutes, Middlewares.errorHandler);
  }

  /********************************************************************************/

  private _attachConfigurations() {
    // Every configuration referring to sockets here, talks about network/tcp
    // socket NOT websockets. Network socket is the underlying layer for http
    // request (in this case). In short, the socket options refer to a "standard"
    // connection from a client
    this._server.maxHeadersCount = 256;
    this._server.headersTimeout = 32_000; // millis
    this._server.requestTimeout = 32_000; // millis
    // Connection close will terminate the tcp socket once the payload was
    // transferred and acknowledged. This setting is for the rare cases where,
    // for some reason, the tcp socket is left alive
    this._server.timeout = 524_288; // millis
    // See: https://github.com/nodejs/node/issues/40071
    // Leaving this without any limit will cause the server to reuse the
    // connection indefinitely (in theory). As a result, load balancing will
    // have very little effects if more instances of the server are brought up
    // by the deployment orchestration tool.
    // As for a good number, it depends on the application traffic.
    // The current value is random power of 2 which we liked
    this._server.maxRequestsPerSocket = 32;
    this._server.keepAliveTimeout = 8_000; // millis
  }

  private _attachEventHandlers(logger: Logger) {
    this._server
      .on('error', (err) => {
        logger.fatal(err, 'HTTP Server error');

        // If an event emitter error happened, we shutdown the application.
        // As a result we allow the deployment orchestration tool to attempt to
        // rerun the application in a clean state
        process.exit(1);
      })
      .once('close', () => {
        this._db.close().catch((err) => {
          logger.fatal(err, 'Error during database termination');
        });

        // Graceful shutdown
        process.exitCode = 0;
      });
  }

  private _attachAPIDocs(apiRoute: string) {
    this._app.use(`${apiRoute}/api-docs`, (_, res) => {
      res.sendFile(HttpServer.OPENAPI_FILE);
    });
  }
}
