import type { DatabaseHandler } from '../../db/index.js';
import type { UnknownObject } from '../../types/index.js';

/**********************************************************************************/

type DBPreparedQueries = ReturnType<DatabaseHandler['getPreparedQueries']>;

/**********************************************************************************/

export async function executePreparedQuery<
  T extends keyof DBPreparedQueries
>(params: { db: DatabaseHandler; queryName: T; phValues?: UnknownObject }) {
  const { db, queryName, phValues } = params;
  const preparedQueries = db.getPreparedQueries();

  return (await preparedQueries[queryName].execute(phValues)) as Awaited<
    ReturnType<DBPreparedQueries[T]['execute']>
  >;
}
