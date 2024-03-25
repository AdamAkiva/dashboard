/* eslint-disable max-classes-per-file */
/**
 * The database logger class is used only by this module. There's no point to
 * separate it to another file since it is extremely coupled with the database
 * by definition, so we ignore the rule instead
 */
import {
  and,
  drizzle,
  eq,
  isNull,
  pg,
  sql,
  type DrizzleLogger,
  type Mode
} from '../types/index.js';
import {
  debugEnabled,
  isDevelopmentMode,
  type Logger
} from '../utils/index.js';

/* The default import is on purpose. See: https://orm.drizzle.team/docs/sql-schema-declaration */
import * as schema from './schemas.js';

/**********************************************************************************/

/**
 * In regards to using handler and transaction, see this:
 * https://www.answeroverflow.com/m/1164318289674125392
 * In short, it does not matter, handler and transaction are same except
 * for a rollback method, which is called automatically if a throw occurs
 */
export type DBHandler =
  | DatabaseHandler['_handler']
  // For your own sanity, don't ask or think about it
  | Parameters<Parameters<DatabaseHandler['_handler']['transaction']>[0]>[0];
export type DBModels = DatabaseHandler['_models'];

/**********************************************************************************/

class DatabaseLogger implements DrizzleLogger {
  private readonly _healthCheckQuery;
  private readonly _logger;

  public constructor(healthCheckQuery: string, logger: Logger['handler']) {
    this._healthCheckQuery = healthCheckQuery;
    this._logger = logger;
  }

  public logQuery(query: string, params: unknown[]): void {
    if (this._healthCheckQuery !== query) {
      this._logger.debug(
        `Database query:\n${query}\nParams: ${JSON.stringify(params, null, 2)}`
      );
    }
  }
}

/**********************************************************************************/

export default class DatabaseHandler {
  public static readonly HEALTH_CHECK_QUERY = 'SELECT NOW()';

  private readonly _conn;
  private readonly _handler;
  private readonly _models;
  private readonly _preparedQueries;

  public constructor(params: {
    mode: Mode;
    conn: { name: string; url: string; healthCheckQuery: string };
    logger: Logger['handler'];
  }) {
    const {
      mode,
      conn: { name, url, healthCheckQuery },
      logger
    } = params;

    // Note about transactions, postgres.js and drizzle:
    // Postgres.js create prepared statements per connection which lasts 60 minutes
    // (according to the settings we've supplied). Using drizzle with prepared
    // statements (which is a lie, see below) make an additional query before
    // and after the transaction for something we could not understand.
    // However, since every transaction use a connection, that means that the
    // number of transactions which can occur concurrently is at the very least
    // the number of transaction * 2. We suggest also allowing a couple of
    // additional connections (just to be sure). In addition to that, the max
    // default number of concurrent postgres connection is 100. When this number
    // is reached postgres will throw an exception.
    // When the number of connections is not enough (at least transaction * 2)
    // the database will get stuck since no one frees any connections and the
    // server will get stuck as a result. Currently we have no good way to
    // resolve this
    this._conn = pg(url, {
      connect_timeout: 30, // in secs
      idle_timeout: 180, // in secs
      // When using transaction connections are reserved since all queries have
      // to be done on the the same connection (transaction), therefore multiple
      // requests will open up a new transaction so basically this is a hard
      // limit for 10 transaction concurrently
      max: 10,
      max_lifetime: 3_600, // in secs
      connection: {
        application_name: name
      }
    });

    this._handler = drizzle(this._conn, {
      schema: schema,
      logger:
        isDevelopmentMode(mode) || debugEnabled()
          ? new DatabaseLogger(healthCheckQuery, logger)
          : false
    });

    this._models = {
      userInfoModel: schema.userInfoModel,
      userCredentialsModel: schema.userCredentialsModel,
      userSettingsModel: schema.userSettingsModel
    };

    this._preparedQueries = this.generatePreparedQueries();
  }

  /********************************************************************************/

  public getHandler() {
    return this._handler;
  }

  public getModels() {
    return this._models;
  }

  public getPreparedQueries() {
    return this._preparedQueries;
  }

  public async close() {
    return await this._conn.end({ timeout: 10 }); // in secs
  }

  /********************************************************************************/

  private generatePreparedQueries() {
    const { userInfoModel, userCredentialsModel } = this._models;

    // This is a LIE, drizzle does not do any form of prepared statements on the
    // database level. What drizzle refers to as prepared statements is an
    // optimization on drizzle level, not the database. One may say only the
    // terminology is wrong, but you should not use prepared statements
    // terminology when not referring to actual database level prepared statements.
    // What drizzle refers to as prepared statements is skipping the repeating
    // compilation on drizzle level, not on the database level. On the database
    // level, no prepared statement happens (we've checked, nothing is logged on
    // the highest log level)
    return {
      readUsersQuery: this._handler
        .select({
          id: userInfoModel.id,
          email: userInfoModel.email,
          firstName: userInfoModel.firstName,
          lastName: userInfoModel.lastName,
          phone: userInfoModel.phone,
          gender: userInfoModel.gender,
          address: userInfoModel.address
        })
        .from(userInfoModel)
        .innerJoin(
          userCredentialsModel,
          and(
            eq(userCredentialsModel.userId, userInfoModel.id),
            isNull(userCredentialsModel.archivedAt)
          )
        )
        .prepare('readUsersQuery'),
      readUserQuery: this._handler
        .select({
          id: userInfoModel.id,
          email: userInfoModel.email,
          firstName: userInfoModel.firstName,
          lastName: userInfoModel.lastName,
          phone: userInfoModel.phone,
          gender: userInfoModel.gender,
          address: userInfoModel.address
        })
        .from(userInfoModel)
        .where(eq(userInfoModel.id, sql.placeholder('userId')))
        .innerJoin(
          userCredentialsModel,
          eq(userCredentialsModel.userId, sql.placeholder('userId'))
        )
        .prepare('readUserQuery'),
      checkUserIsArchivedQuery: this._handler
        .select({ archivedAt: userCredentialsModel.archivedAt })
        .from(userCredentialsModel)
        .where(eq(userCredentialsModel.userId, sql.placeholder('userId')))
        .limit(1)
        .prepare('checkUserIsArchivedQuery'),

      reactivateUser: this._handler
        .update(userCredentialsModel)
        .set({ archivedAt: null })
        .where(eq(userCredentialsModel.userId, sql.placeholder('userId')))
        .returning({ userId: userCredentialsModel.userId }),

      deleteUser: this._handler
        .delete(userInfoModel)
        .where(eq(userInfoModel.id, sql.placeholder('userId')))
        .prepare('deleteUser'),
      deactivateUser: this._handler
        .update(userCredentialsModel)
        // @ts-expect-error This works, however, drizzle marks it as a type error
        .set({ archivedAt: sql.placeholder('archivedAt') })
        .where(eq(userCredentialsModel.userId, sql.placeholder('userId')))
        .prepare('deactivateUser')
    } as const;
  }
}
