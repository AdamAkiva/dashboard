import type { DBPreparedQueries, DatabaseHandler } from '../../db/index.js';
import { pg, type Debug, type UnknownObject } from '../../types/index.js';
import { ERR_CODES } from '../../utils/constants.js';

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

export async function safeTransaction<T = unknown>(fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (err) {
    if (
      err instanceof pg.PostgresError &&
      err.code === ERR_CODES.PG.TOO_MANY_CONNECTIONS
    ) {
      return await new Promise<T>((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            resolve(await fn());
          } catch (err) {
            if (
              err instanceof pg.PostgresError &&
              err.code === ERR_CODES.PG.TOO_MANY_CONNECTIONS
            ) {
              return;
            } else {
              clearInterval(interval);
              reject(err);
            }
          }
        }, 0);
      });
    }

    throw err;
  }
}
