import { DatabaseHandler } from '../db/index.js';
import {
  compress,
  cors,
  createServer,
  express,
  type Application,
  type Mode,
  type Server
} from '../types/index.js';
import { Logger, getEnv, getStackTrace } from '../utils/index.js';

import * as Middlewares from './middleware.js';

/**********************************************************************************/

export default class HttpServer {
  private readonly _server;
  private readonly _db;

  public static readonly create = async (params: {
    mode: Mode;
    dbData: { name: string; uri: string };
    routes: { api: string; health: string };
    allowedOrigins: string[] | string;
  }) => {
    const { mode, dbData, routes, allowedOrigins } = params;

    let db: DatabaseHandler | null = null;
    let server: Server | null = null;
    try {
      db = new DatabaseHandler({
        mode: mode,
        connName: dbData.name,
        connUri: dbData.uri
      });

      const app = express();
      server = createServer(app);

      HttpServer._attachConfigurations(server);

      app.disable('x-powered-by');

      const allowedMethods = new Set<string>([
        'HEAD',
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS'
      ]);
      if (mode === 'production') {
        // Make sure the reverse-proxy sets the correct settings for the logs to be
        // accurate. See: http://expressjs.com/en/guide/behind-proxies.html
        app.set('trust proxy', true);
        await HttpServer._attachMiddlewareProd({
          app: app,
          allowedMethods: allowedMethods,
          allowedOrigins: allowedOrigins
        });
      } else {
        HttpServer._attachMiddleware({
          app: app,
          allowedOrigins: allowedOrigins,
          allowedMethods: allowedMethods
        });
      }
      await HttpServer._attachRoutes({
        mode: mode,
        app: app,
        db: db,
        routes: routes
      });
    } catch (err) {
      if (err instanceof Error) {
        Logger.nativeLog(
          'error',
          `Error during server initialization: ${err.message}`
        );
      }
      await Promise.all([db?.close(), server?.close()]);
      process.exitCode = 1;

      // Even though the global event handlers are not yet set-up the docs say:
      // 'If it is necessary to terminate the Node.js process due to an error
      // condition, throwing an uncaught error and allowing the process to
      // terminate accordingly is safer than calling process.exit()'
      throw err;
    }

    // After this point, there are handlers responsible for gracefully shutting
    // down all of the resources used by the server
    HttpServer._attachEventHandlers(server, db);

    return new HttpServer(server, db);
  };

  private static readonly _attachConfigurations = (server: Server) => {
    server.maxHeadersCount = 200;
    server.headersTimeout = 10_000; // millis
    server.requestTimeout = 30_000; // millis
    server.timeout = 600_000; // millis
    server.maxRequestsPerSocket = 500;
    server.keepAliveTimeout = 3_000; // millis
  };

  private static readonly _attachMiddlewareProd = async (params: {
    app: Application;
    allowedMethods: Set<string>;
    allowedOrigins: string[] | string;
  }) => {
    const { app, allowedMethods, allowedOrigins } = params;

    const helmet = await import('helmet');

    app.use(
      Middlewares.checkMethod(allowedMethods),
      cors({
        origin: allowedOrigins,
        methods: Array.from(allowedMethods)
      }),
      helmet.default({
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

  private static readonly _attachMiddleware = (params: {
    app: Application;
    allowedMethods: Set<string>;
    allowedOrigins: string[] | string;
  }) => {
    const { app, allowedMethods, allowedOrigins } = params;

    app.use(
      cors({
        origin: allowedOrigins,
        methods: Array.from(allowedMethods)
      }),
      Middlewares.checkMethod(allowedMethods),
      compress()
    );
  };

  private static readonly _attachRoutes = async (params: {
    mode: Mode;
    app: Application;
    db: DatabaseHandler;
    routes: { api: string; health: string };
  }) => {
    const {
      mode,
      app,
      db,
      routes: { api: apiRoute, health: healthCheckRoute }
    } = params;

    if (mode !== 'production') {
      await HttpServer._attachSwaggerDocs(app, apiRoute);
    }

    // Health check route
    app.get(healthCheckRoute, Middlewares.healthCheck(db));

    app.use(
      apiRoute,
      Middlewares.attachContext(db),
      Middlewares.handleMissedRoutes,
      Middlewares.errorHandler
    );
  };

  private static readonly _attachSwaggerDocs = async (
    app: Application,
    apiRoute: string
  ) => {
    // This should never be enabled in production build. The dynamic imports allows
    // for 'swagger-ui-express' & 'yaml' to be devDependencies
    const [{ serve, setup }, { parse }, { resolve }, { readFileSync }] =
      await Promise.all([
        import('swagger-ui-express'),
        import('yaml'),
        import('node:path'),
        import('node:fs')
      ]);

    const swaggerDoc = parse(
      readFileSync(
        resolve(
          new URL('', import.meta.url).pathname,
          `../../api-docs/openapi.yaml`
        ),
        'utf-8'
      )
    );

    app.use(`${apiRoute}/api-docs`, serve, setup(swaggerDoc));
  };

  private static readonly _attachEventHandlers = (
    server: Server,
    db: DatabaseHandler
  ) => {
    server.on('error', (err) => {
      Logger.nativeLog(
        'error',
        `Error while using the http server. This may help: ${
          err.message + getStackTrace(err)
        }`
      );
    });
    server.once('close', async () => {
      await Promise.all([db.close()]);
      process.exitCode = 0;
    });

    process.once('SIGINT', () => {
      server.close();
    });
    process.once('SIGTERM', () => {
      server.close();
    });
  };

  /********************************************************************************/

  private constructor(server: Server, db: DatabaseHandler) {
    // When we get to this stage of the server initialization, this class handles
    // the cleanup on shutdown. Therefore remove the option to call close from
    // the returned handlers
    const { close: __, ..._db } = db;

    this._server = server;
    this._db = _db;
  }

  public readonly listen = (port: number | string) => {
    const { mode, server: serverEnv } = getEnv();

    if (mode !== 'test') {
      this._server.listen(port, () => {
        Logger.nativeLog(
          'info',
          `Server is running in '${mode}' mode on:` +
            ` ${serverEnv.url}:${serverEnv.port}/${serverEnv.apiRoute}`
        );
      });
    } else {
      this._server.listen(port);
    }
  };

  public readonly getDatabase = () => {
    return this._db;
  };

  public readonly close = () => {
    this._server.close();
  };
}
