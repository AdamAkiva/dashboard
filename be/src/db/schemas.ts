// The imports in this file MUST be external only (not local to the project)
// The reason is that this file is used by the database migrations process,
// which is not a part of the application. Any changes with the dependencies
// must be included ONLY from external packages

import {
  boolean,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
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
 * The second being the overhead and data usage of 128 bits for uuid over the 32
 * of serial is ok for us.
 * 3. Indexes exist by default for primary keys and more are added on fields
 * frequently used for queries.
 * 4. Some of the settings exist by default, but we like to be verbose as long
 * as it is possible
 */

/**********************************************************************************/

const timestamps = {
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
    .notNull()
};

/**********************************************************************************/

export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);

export const userInfoModel = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().notNull().unique().defaultRandom(),
    email: varchar('email', { length: 512 }).unique().notNull(),
    firstName: varchar('first_name', { length: 256 }).notNull(),
    lastName: varchar('last_name', { length: 256 }).notNull(),
    phone: varchar('phone', { length: 64 }).notNull(),
    gender: genderEnum('gender').notNull(),
    address: varchar('address', { length: 256 }).notNull(),
    ...timestamps
  },
  (table) => {
    return {
      userEmailUniqueIndex: uniqueIndex('user_email_unq_idx').on(table.email)
    };
  }
);

export const userCredentialsModel = pgTable(
  'users_credentials',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(
        () => {
          return userInfoModel.id;
        },
        { onDelete: 'cascade', onUpdate: 'no action' }
      ),
    email: varchar('email', { length: 512 }).unique().notNull(),
    password: varchar('password', { length: 256 }).notNull(),
    // First delete of a user will be a soft-delete. Second delete will be a hard
    // delete of that user.
    // A read of soft-deleted user will work.
    // A creation of a soft-deleted user will reactivate it.
    // An update of a soft-deleted user will be forbidden.
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps
  },
  (table) => {
    return {
      credentialsEmailUniqueIndex: uniqueIndex('credentials_email_unq_idx').on(
        table.email
      ),
      credentialsUniqueIndex: uniqueIndex('credentials_unq_idx').on(
        table.email,
        table.password
      )
    };
  }
);

export const userSettingsModel = pgTable('users_settings', {
  userId: uuid('user_id')
    .primaryKey()
    .references(
      () => {
        return userInfoModel.id;
      },
      { onDelete: 'cascade', onUpdate: 'no action' }
    ),
  darkMode: boolean('dark_mode').default(false).notNull(),
  ...timestamps
});
