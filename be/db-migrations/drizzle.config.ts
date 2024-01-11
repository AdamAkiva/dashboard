import type { Config } from 'drizzle-kit';

/**********************************************************************************/

// Taken from: https://orm.drizzle.team/kit-docs/conf
export default {
  schema: './src/db/schemas.ts',
  out: './db-migrations'
} satisfies Config;
