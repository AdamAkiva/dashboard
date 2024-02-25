import type { RequestContext } from '../../../types/index.js';
import type { readOne as readOneValidation } from '../validator.js';

/**********************************************************************************/

type UserReadOneValidationData = ReturnType<typeof readOneValidation>;

/**********************************************************************************/

export async function readOne(
  ctx: RequestContext,
  args: UserReadOneValidationData
) {}
