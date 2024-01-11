// The default import is on purpose. See: https://orm.drizzle.team/docs/sql-schema-declaration
import { drizzle, postgres, type Mode } from '../types/index.js';

import * as schema from './schemas.js';

/**********************************************************************************/

export type DBHandler = DatabaseHandler['_handler'];
export type DBModels = DatabaseHandler['_models'];

// For your own sake, don't ask or think about it
export type Transaction = Parameters<
  Parameters<DBHandler['transaction']>[0]
>[0];

/**********************************************************************************/

/**
 * See: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export const ERR_CODES = {
  FOREIGN_KEY_VIOLATION: '23503',
  UNIQUE_VIOLATION: '23505'
};

/**********************************************************************************/

export default class DatabaseHandler {
  private readonly _conn;
  private readonly _handler;
  private readonly _models;

  public constructor(params: {
    mode: Mode;
    connName: string;
    connUri: string;
  }) {
    const { mode, connName, connUri } = params;

    this._conn = postgres(connUri, {
      connect_timeout: 30, // in secs
      idle_timeout: 180, // in secs
      max: 20,
      max_lifetime: 3_600, // in secs
      connection: {
        application_name: connName
      },
      debug: mode !== 'production'
    });

    this._handler = drizzle(this._conn, { schema: schema });

    this._models = {
      userModel: schema.userModel
    };
  }

  /********************************************************************************/

  public readonly getConnection = () => {
    return this._conn;
  };

  public readonly getHandler = () => {
    return this._handler;
  };

  public readonly getModels = () => {
    return this._models;
  };

  public readonly close = async () => {
    return await this._conn.end();
  };
}
