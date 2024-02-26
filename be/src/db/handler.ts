/* eslint-disable max-classes-per-file */

import {
  drizzle,
  pg,
  type DrizzleLogger,
  type Logger,
  type Mode
} from '../types/index.js';
import { isDevelopmentMode, isProductionMode } from '../utils/index.js';

// The default import is on purpose. See: https://orm.drizzle.team/docs/sql-schema-declaration
import * as schema from './schemas.js';

/**********************************************************************************/

export type DBHandler = DatabaseHandler['_handler'];
export type DBModels = DatabaseHandler['_models'];

// For your own sanity, don't ask or think about it
export type Transaction = Parameters<
  Parameters<DBHandler['transaction']>[0]
>[0];

/**********************************************************************************/

class DatabaseLogger implements DrizzleLogger {
  private readonly _healthCheckQuery;
  private readonly _logger;

  public constructor(healthCheckQuery: string, logger: Logger) {
    this._healthCheckQuery = healthCheckQuery;
    this._logger = logger;
  }

  public logQuery(query: string, params: unknown[]): void {
    if (this._healthCheckQuery !== query) {
      this._logger.debug({ query, params }, 'Database query:');
    }
  }
}

/**********************************************************************************/

export default class DatabaseHandler {
  public static readonly HEALTH_CHECK_QUERY = 'SELECT NOW()';

  private readonly _conn;
  private readonly _handler;
  private readonly _models;

  public constructor(params: {
    mode: Mode;
    conn: { name: string; uri: string; healthCheckQuery: string };
    logger: Logger;
  }) {
    const {
      mode,
      conn: { name, uri, healthCheckQuery },
      logger
    } = params;

    this._conn = pg(uri, {
      connect_timeout: 30, // in secs
      idle_timeout: 180, // in secs
      max: 20,
      max_lifetime: 3_600, // in secs
      connection: {
        application_name: name
      },
      debug: !isProductionMode(mode)
    });

    this._handler = drizzle(this._conn, {
      schema: schema,
      logger: isDevelopmentMode(mode)
        ? new DatabaseLogger(healthCheckQuery, logger)
        : false
    });

    this._models = {
      user: {
        userModel: schema.userModel,
        userCredentialsModel: schema.userCredentialsModel,
        userSettingsModel: schema.userSettingsModel
      }
    };
  }

  /********************************************************************************/

  public getHandler() {
    return this._handler;
  }

  public getModels() {
    return this._models;
  }

  public async close() {
    return await this._conn.end({ timeout: 10 }); // in secs
  }
}
