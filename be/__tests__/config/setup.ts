import { afterAll, beforeAll, inject } from 'vitest';

import { DatabaseHandler } from '../../src/db/index.js';

import { cleanupDatabase, mockLogger } from './utils.js';

/**********************************************************************************/

const mode = inject('mode');
const { name, url } = inject('db');

beforeAll(() => {
  // To avoid asserting non-null everywhere we depend on the init order of vitest
  // to assume this will always be defined since setupFiles are ran before each
  // test
  globalThis.db = new DatabaseHandler({
    mode: mode,
    conn: {
      name: name,
      url: url,
      healthCheckQuery: DatabaseHandler.HEALTH_CHECK_QUERY
    },
    logger: mockLogger().handler
  });
});

afterAll(async () => {
  const { db } = globalThis;

  await cleanupDatabase(db);
  await db.close();
});
