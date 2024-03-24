import type { Config } from 'drizzle-kit';

/**********************************************************************************/

// See: https://orm.drizzle.team/kit-docs/config-reference
export default {
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DB_URI!
  },
  verbose: true,
  strict: true,
  schema: './src/db/schemas.ts',
  out: './db/migrations'
} satisfies Config;
