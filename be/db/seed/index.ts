import type { InferInsertModel } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import pg from 'postgres';

import {
  userCredentialsModel,
  userInfoModel,
  userSettingsModel
} from '../../src/db/schemas.js';

import data from './seed-data.json' assert { type: 'json' };

/**********************************************************************************/

type CreateUserInfo = InferInsertModel<typeof userInfoModel>;
type CreateUserCredentials = InferInsertModel<typeof userCredentialsModel>;
type CreateUserSettings = InferInsertModel<typeof userSettingsModel>;

/**********************************************************************************/

if (!process.env.DB_URI) {
  console.error('\nDid you forget to run via docker?\n');

  process.exit(1);
}

if (process.env.SEED === '1') {
  await seedDatabase();
} else if (process.env.SEED === '0') {
  await unseedDatabase();
}

async function seedDatabase() {
  const connection = pg(process.env.DB_URI!, { max: 1 });
  const handler = drizzle(connection);

  const seedData = prepareSeedData(data);

  await handler.transaction(async (transaction) => {
    const results = await Promise.allSettled(
      seedData.map(async ({ userInfo, userCredentials, userSettings }) => {
        const id = await createUser(transaction, userInfo);
        const results = await Promise.allSettled([
          createUserCredentials(transaction, {
            ...userCredentials,
            userId: id
          }),
          createUserSettings(transaction, { ...userSettings, userId: id })
        ]);
        for (const result of results) {
          if (result.status === 'rejected') {
            throw result.reason;
          }
        }
      })
    );
    for (const result of results) {
      if (result.status === 'rejected') {
        throw result.reason;
      }
    }
  });

  await connection.end({ timeout: 10 });
}

async function unseedDatabase() {
  const connection = pg(process.env.DB_URI!, { max: 1 });
  const handler = drizzle(connection);

  /* eslint-disable @drizzle/enforce-delete-with-where */
  await handler.delete(userInfoModel);
  await handler.delete(userCredentialsModel);
  await handler.delete(userSettingsModel);
  /* eslint-enable @drizzle/enforce-delete-with-where */

  await connection.end({ timeout: 10 });
}

/**********************************************************************************/

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
function prepareSeedData(data: typeof import('./seed-data.json')) {
  const now = new Date().toISOString();
  return data.map(({ userInfo, userCredentials, userSettings }) => {
    return {
      userInfo: {
        ...userInfo,
        gender: userInfo.gender as CreateUserInfo['gender'],
        createdAt: now,
        updatedAt: now
      } satisfies CreateUserInfo,
      userCredentials: {
        ...userCredentials,
        createdAt: now,
        updatedAt: now
      } satisfies CreateUserCredentials,
      userSettings: {
        ...userSettings,
        createdAt: now,
        updatedAt: now
      } satisfies CreateUserSettings
    };
  });
}

async function createUser(
  handler: ReturnType<typeof drizzle>,
  userData: CreateUserInfo
) {
  const users = await handler
    .insert(userInfoModel)
    .values(userData)
    .returning({ id: userInfoModel.id })
    .onConflictDoNothing();
  if (!users.length) {
    throw new Error('Seed already exists');
  }

  return users[0].id;
}

async function createUserCredentials(
  handler: ReturnType<typeof drizzle>,
  userCredentials: CreateUserCredentials
) {
  await handler.insert(userCredentialsModel).values(userCredentials);
}

async function createUserSettings(
  handler: ReturnType<typeof drizzle>,
  userSettings: CreateUserSettings
) {
  await handler.insert(userSettingsModel).values(userSettings);
}
