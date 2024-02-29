/* eslint-disable max-classes-per-file */
import {
  drizzle,
  eq,
  pg,
  sql,
  type DrizzleLogger,
  type Logger,
  type Mode
} from '../types/index.js';
import { isDevelopmentMode } from '../utils/index.js';

// The default import is on purpose. See: https://orm.drizzle.team/docs/sql-schema-declaration
import * as schema from './schemas.js';

/**********************************************************************************/

export type DBHandler = DatabaseHandler['_handler'];
export type DBModels = DatabaseHandler['_models'];
export type DBPreparedQueries = DatabaseHandler['_preparedQueries'];

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
      max: 10, // The default is fine, unless we discover something else
      max_lifetime: 3_600, // in secs
      prepare: true,
      connection: {
        application_name: name
      }
    });

    this._handler = drizzle(this._conn, {
      schema: schema,
      logger: isDevelopmentMode(mode)
        ? new DatabaseLogger(healthCheckQuery, logger)
        : false
    });

    this._models = {
      user: {
        userInfoModel: schema.userInfoModel,
        userCredentialsModel: schema.userCredentialsModel,
        userSettingsModel: schema.userSettingsModel
      }
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
    // In regards to using handler and transaction, see this:
    // https://www.answeroverflow.com/m/1164318289674125392
    // In short, it does not matter, handler and transaction are same except
    // for a rollback method, which occurs if an error is thrown
    const {
      user: { userInfoModel, userCredentialsModel, userSettingsModel }
    } = this._models;

    return {
      readUserQuery: this._handler
        .select({
          id: userInfoModel.id,
          email: userInfoModel.email,
          firstName: userInfoModel.firstName,
          lastName: userInfoModel.lastName,
          phone: userInfoModel.phone,
          gender: userInfoModel.gender,
          address: userInfoModel.address,
          createdAt: userInfoModel.createdAt,
          isActive: userCredentialsModel.isActive
        })
        .from(userInfoModel)
        .where(eq(userInfoModel.id, sql.placeholder('userId')))
        .innerJoin(
          userCredentialsModel,
          eq(userCredentialsModel.userId, sql.placeholder('userId'))
        )
        .prepare('readUserQuery'),
      isUserActiveQuery: this._handler
        .select({
          isActive: userCredentialsModel.isActive
        })
        .from(userCredentialsModel)
        .where(eq(userCredentialsModel.userId, sql.placeholder('userId')))
        .prepare('isUserActiveQuery'),
      createUserInfoQuery: this._handler
        .insert(userInfoModel)
        .values({
          email: sql.placeholder('email'),
          firstName: sql.placeholder('firstName'),
          lastName: sql.placeholder('lastName'),
          gender: sql.placeholder('gender'),
          phone: sql.placeholder('phone'),
          address: sql.placeholder('address'),
          createdAt: sql.placeholder('createdAt')
        })
        .returning({
          userId: userInfoModel.id,
          email: userInfoModel.email,
          firstName: userInfoModel.firstName,
          lastName: userInfoModel.lastName,
          gender: userInfoModel.gender,
          phone: userInfoModel.phone,
          address: userInfoModel.address,
          createdAt: userInfoModel.createdAt
        })
        .prepare('createUserInfoQuery'),
      createUserCredentialsQuery: this._handler
        .insert(userCredentialsModel)
        .values({
          userId: sql.placeholder('userId'),
          email: sql.placeholder('email'),
          password: sql.placeholder('password'),
          createdAt: sql.placeholder('createdAt')
        })
        .prepare('createCredentialsQuery'),
      createUserDefaultSettingsQuery: this._handler
        .insert(userSettingsModel)
        .values({
          userId: sql.placeholder('userId'),
          createdAt: sql.placeholder('createdAt')
        })
        .prepare('createDefaultSettingsQuery'),
      reactivateUserQuery: this._handler
        .update(userCredentialsModel)
        // @ts-expect-error Currently this is a type error, but works on runtime.
        // Remove this ignore When the PR is merged https://github.com/drizzle-team/drizzle-orm/pull/1666
        .set({ isActive: true, updatedAt: sql.placeholder('updatedAt') })
        .where(eq(userCredentialsModel.userId, sql.placeholder('userId')))
        .prepare('deactivateUserQuery'),
      deactivateUserQuery: this._handler
        .update(userCredentialsModel)
        // @ts-expect-error Currently this is a type error, but works on runtime.
        // Remove this ignore When the PR is merged https://github.com/drizzle-team/drizzle-orm/pull/1666
        .set({ isActive: false, updatedAt: sql.placeholder('updatedAt') })
        .where(eq(userCredentialsModel.userId, sql.placeholder('userId')))
        .prepare('deactivateUserQuery'),
      updateUserInfoTimestampQuery: this._handler
        .update(userInfoModel)
        // @ts-expect-error Currently this is a type error, but works on runtime.
        // Remove this ignore When the PR is merged https://github.com/drizzle-team/drizzle-orm/pull/1666
        .set({ updatedAt: sql.placeholder('updatedAt') })
        .where(eq(userInfoModel.id, sql.placeholder('userId')))
        .prepare('updateUserInfoTimestamp'),
      updateUserSettingsTimestampQuery: this._handler
        .update(userInfoModel)
        // @ts-expect-error Currently this is a type error, but works on runtime.
        // Remove this ignore When the PR is merged https://github.com/drizzle-team/drizzle-orm/pull/1666
        .set({ updatedAt: sql.placeholder('updatedAt') })
        .where(eq(userInfoModel.id, sql.placeholder('userId')))
        .prepare('updateUserSettingsTimestamp'),
      deleteUserQuery: this._handler
        .delete(userInfoModel)
        .where(eq(userInfoModel.id, sql.placeholder('userId')))
        .prepare('deleteUserQuery')
    } as const;
  }
}
