import dotenv from 'dotenv';

dotenv.config();

export const Environment = {
  Development: 'development',
  Test: 'test',
  Production: 'production',
} as const;

type AppEnvironment = (typeof Environment)[keyof typeof Environment];

export type DatabaseDialect = 'postgres' | 'mysql' | 'sqlite';

export type DatabaseConfig = {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: DatabaseDialect;
  storage?: string;
  pool?: typeof poolConfig;
  logging: boolean;
  timezone: string;
};

const poolConfig = {
  max: 100,
  min: 0,
  idle: 20000,
  acquire: 20000,
  evict: 30000,
  handleDisconnects: true,
};

function resolveDatabaseName(env: AppEnvironment): string {
  if (env === Environment.Production) {
    return process.env.DB_NAME_PROD || process.env.DB_MAIN_NAME || 'dbprod';
  }
  if (env === Environment.Test) {
    return process.env.DB_NAME_TEST || 'dbtest';
  }
  return process.env.DB_NAME_DEV || process.env.DB_MAIN_NAME || 'dbdev';
}

function buildDatabaseConfig(env: AppEnvironment): DatabaseConfig {
  return {
    username: process.env.DB_MAIN_USER || 'postgres',
    password: process.env.DB_MAIN_PASSWORD || 'postgres',
    database: resolveDatabaseName(env),
    host: process.env.DB_MAIN_HOST || 'localhost',
    port: parseInt(process.env.DB_MAIN_PORT || process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    storage: process.env.DB_STORAGE,
    pool: process.env.ENABLE_CONNECTION_POOL === 'true' ? poolConfig : undefined,
    logging: process.env.NODE_ENV === Environment.Development,
    timezone: '+00:00',
  };
}

const environment = (process.env.NODE_ENV || Environment.Development) as AppEnvironment;

export default {
  environment,
  database: buildDatabaseConfig(environment),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  salt: process.env.SALT || '10',
};
