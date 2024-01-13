import type { DatabaseHandler } from '../db/index.js';
import type { HttpLogger } from './index.js';

/**********************************************************************************/

// Typescript declaration merging. See: https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript/47448486#47448486
declare global {
  declare namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    export interface Request {
      dashboard: {
        db: DatabaseHandler;
        logger: HttpLogger['logger'];
      };
    }
  }
}
