import type { Request } from '../../types/index.ts';
import { validateEmptyObject } from '../../utils/index.js';

/**********************************************************************************/

export const readMany = (req: Request) => {
  const { body, params, query } = req;

  validateEmptyObject('users', { ...body, ...params, ...query });
};
