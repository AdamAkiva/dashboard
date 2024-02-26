import type { RequestContext } from '../../../types/index.js';
import type { updateOne as updateOneValidation } from '../validator.js';

/**********************************************************************************/

type UserUpdateOneValidationData = ReturnType<typeof updateOneValidation>;

/**********************************************************************************/

export async function updateOne(
  ctx: RequestContext,
  args: UserUpdateOneValidationData
) {}
