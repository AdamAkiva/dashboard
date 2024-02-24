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
  private static readonly OPENAPI_FILE = `${resolve(
    new URL('', import.meta.url).pathname,
    '../../../assets'
  )}/openapi.html`;

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

  public async attachMiddlewares(
    allowedMethods: Set<string>,
    allowedOrigins: Set<string>
  ) {
    const origins =
      allowedOrigins.size === 1
        ? Array.from(allowedOrigins)[0]
        : Array.from(allowedOrigins);

    this._app.use(
      Middlewares.checkMethod(allowedMethods),
      cors({
        credentials: true,
        methods: Array.from(allowedMethods),
        origin: origins
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

  public attachRoutes(params: {
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

    // Health check route
    this._app
      .get(healthCheckRoute, Middlewares.healthCheck(allowedHosts, readyCheck))
      // The order matters and there's no point to log every health check
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
    this._server.maxHeadersCount = 256;
    this._server.headersTimeout = 8_000; // millis
    this._server.requestTimeout = 32_000; // millis
    this._server.timeout = 524_288; // millis
    this._server.maxRequestsPerSocket = 0; // No request limit
    this._server.keepAliveTimeout = 4_000; // millis
  }

  private _attachEventHandlers(logger: Logger) {
    this._server
      .on('error', (err) => {
        logger.fatal(err, 'HTTP Server error');
      })
      .once('close', () => {
        this._db.close().catch((err) => {
          logger.error(err, 'Error during database termination');
        });

        // Graceful shutdown
        process.exitCode = 0;
      });
  }

  private _attachAPIDocs(apiRoute: string) {
    this._app.use(`${apiRoute}/api-docs/openapi`, (_, res) => {
      res.sendFile(HttpServer.OPENAPI_FILE);
    });
  }
}
