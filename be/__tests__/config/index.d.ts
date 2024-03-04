import 'vitest';

import type { DatabaseHandler } from '../../src/db/index.js';

/**********************************************************************************/

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  export interface ProvidedContext {
    mode: 'test';
    urls: {
      baseURL: string;
      healthCheckURL: string;
    };
    db: {
      name: string;
      url: string;
    };
  }
}

declare global {
  // This is the syntax to extend globalThis (using var)
  // eslint-disable-next-line no-var
  var db: DatabaseHandler;
}
