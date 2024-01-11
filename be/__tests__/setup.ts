import { afterAll, beforeAll } from '@jest/globals';

import { HttpServer, cleanupDatabase, getTestEnv } from './utils.js';

/**********************************************************************************/

// We want to export this without it being undefined
// eslint-disable-next-line @typescript-eslint/init-declarations
export let server: HttpServer;

/**********************************************************************************/

beforeAll(async () => {
  const { mode, server: serverEnv, db: dbUri } = getTestEnv();

  server = await HttpServer.create({
    mode: mode,
    dbData: { name: 'dashboard-postgres-test', uri: dbUri },
    routes: {
      api: `/${serverEnv.apiRoute}`,
      health: `/${serverEnv.healthCheckRoute}`
    },
    allowedOrigins: []
  });

  server.listen(serverEnv.port);
});

afterAll(async () => {
  await cleanupDatabase(server);

  server.close();
});
