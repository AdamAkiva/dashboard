// The imports in this file MUST be external only (not local to the project)
// The reason is that this file is used by the database migrations process,
// which is not a part of the application. Any changes with the dependencies
// must be included ONLY from external packages

import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';

/**********************************************************************************/

/**
 * Notes:
 * 1. All database related naming MUST be snake_case, this is the convention
 * for SQL based databases. Otherwise the database queries need to be in quotation
 * marks.
 * 2. Primary key is uuid and not serial for two reasons: The first being,
 * it will be must easier to replicate the database where every key is unique.
 * The second being, keeping with the convention of the company. The overhead and
 * data usage of 128 bits for uuid over the 32 of serial is ok for us.
 * 3. Indexes exist by default for primary keys and more are added on fields
 * frequently used for queries.
 * 4. Some of the settings exist by default, but we like to be verbose as long
 * as it is possible
 * 5. timestamps must be of type string and not date. Reason being, date objects
 * lose their precision and are only precision up to a second instead of up to
 * 6 (nanoseconds)
 */

/**********************************************************************************/

type CreateEntity<T> = Omit<T, 'createdAt' | 'id' | 'updatedAt'>;
type UpdateEntity<T> = Partial<Omit<T, 'createdAt'>> & { id: string };

/**********************************************************************************/

export type DUser = InferSelectModel<typeof userModel>;

/**********************************************************************************/

export type CreateUser = Omit<
  CreateEntity<InferInsertModel<typeof userModel>>,
  'archived'
>;

/**********************************************************************************/

export type UpdateUser = UpdateEntity<CreateUser>;

/********************************* Entities ***************************************/
/**********************************************************************************/

export const userModel = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 64 }).notNull(),
  lastName: varchar('last_name', { length: 64 }).notNull(),
  email: varchar('email', { length: 256 }).unique().notNull(),
  dateOfBirth: timestamp('date_of_birth', {
    mode: 'string',
    precision: 0,
    withTimezone: false
  }).notNull(),
  address: varchar('address', { length: 256 }).notNull(),
  phone: varchar('phone', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', {
    mode: 'string',
    precision: 6,
    withTimezone: true
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', {
    mode: 'string',
    precision: 6,
    withTimezone: true
  })
    .defaultNow()
    .notNull(),
  archived: boolean('archived').default(false).notNull()
});

/***************************** Connection Tables **********************************/
/**********************************************************************************/
