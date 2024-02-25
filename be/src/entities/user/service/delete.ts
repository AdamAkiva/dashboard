import type { RequestContext } from '../../../types/index.js';
import type { deleteOne as deleteOneValidation } from '../validator.js';

/**********************************************************************************/

type UserDeleteOneValidationData = ReturnType<typeof deleteOneValidation>;

/**********************************************************************************/

export async function deleteOne(
  ctx: RequestContext,
  args: UserDeleteOneValidationData
) {}
