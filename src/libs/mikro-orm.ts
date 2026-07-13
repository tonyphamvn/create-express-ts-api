import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/postgresql';
import config from '@config';
import { User } from '@/entities/User';

const { database } = config;

let orm: MikroORM;

export async function initializeDatabase() {
  if (orm) {
    return orm;
  }

  const isSqlite = database.dialect === 'sqlite';

  orm = await MikroORM.init({
    entities: [User],
    clientUrl: undefined,
    dbName: isSqlite ? database.storage : database.database,
    host: isSqlite ? undefined : database.host,
    port: isSqlite ? undefined : database.port,
    user: isSqlite ? undefined : database.username,
    password: isSqlite ? undefined : database.password,
    debug: Boolean(database.logging),
    migrations: {
      path: `${__dirname}/../database/migrations`,
    },
  });

  return orm;
}

export function getORM() {
  if (!orm) {
    throw new Error('MikroORM has not been initialized');
  }

  return orm;
}

export function getEM() {
  return getORM().em.fork();
}
