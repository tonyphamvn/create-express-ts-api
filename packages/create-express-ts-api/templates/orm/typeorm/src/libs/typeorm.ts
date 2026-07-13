import 'reflect-metadata';
import { DataSource } from 'typeorm';
import config from '@config';
import { User } from '@/entities/user.entity';

const { database } = config;

const isSqlite = database.dialect === 'sqlite';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: isSqlite ? undefined : database.host,
  port: isSqlite ? undefined : database.port,
  username: isSqlite ? undefined : database.username,
  password: isSqlite ? undefined : database.password,
  database: isSqlite ? database.storage : database.database,
  entities: [User],
  migrations: [`${__dirname}/../database/migrations/*.{ts,js}`],
  synchronize: false,
  logging: Boolean(database.logging),
});

export async function initializeDatabase() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  return AppDataSource;
}

export default AppDataSource;
