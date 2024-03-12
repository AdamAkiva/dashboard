import type { DBPreparedQueries, DatabaseHandler } from '../../db/index.js';
import type { Debug, UnknownObject } from '../../types/index.js';

/**********************************************************************************/

export async function executePreparedQuery<
  T extends keyof DBPreparedQueries
>(params: {
  db: DatabaseHandler;
  queryName: T;
  phValues?: UnknownObject;
  debug: { instance: ReturnType<typeof Debug>; msg: string };
}) {
  const {
    db,
    queryName,
    phValues,
    debug: { instance: debugInstance, msg }
  } = params;
  const preparedQueries = db.getPreparedQueries();

  debugInstance(msg);
  const res = (await preparedQueries[queryName].execute(phValues)) as Awaited<
    ReturnType<DBPreparedQueries[T]['execute']>
  >;
  debugInstance(`Done ${msg.charAt(0).toLowerCase() + msg.slice(1)}`);

  return res;
}
