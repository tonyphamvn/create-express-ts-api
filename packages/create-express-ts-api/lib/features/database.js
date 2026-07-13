import fs from 'node:fs/promises';
import path from 'node:path';

const MYSQL_DOCKER = `services:
  redis:
    image: redis:7.0-alpine
    ports:
      - \${REDIS_PORT}:6379
    environment:
      - REDIS_PASSWORD=\${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    command: /bin/sh -c "redis-server --requirepass $$REDIS_PASSWORD"
    restart: always

  db:
    image: mysql:8.4
    ports:
      - \${DB_MAIN_PORT}:3306
    environment:
      MYSQL_ROOT_PASSWORD: \${DB_MAIN_PASSWORD}
      MYSQL_USER: \${DB_MAIN_USER}
      MYSQL_PASSWORD: \${DB_MAIN_PASSWORD}
      MYSQL_DATABASE: \${DB_NAME_DEV}
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost']
      interval: 1m30s
      timeout: 30s
      retries: 5
      start_period: 30s
    restart: always

volumes:
  redis_data:
  mysql_data:
`;

const SQLITE_DOCKER = `services:
  redis:
    image: redis:7.0-alpine
    ports:
      - \${REDIS_PORT}:6379
    environment:
      - REDIS_PASSWORD=\${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    command: /bin/sh -c "redis-server --requirepass $$REDIS_PASSWORD"
    restart: always

volumes:
  redis_data:
`;

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function writeFile(targetDir, relativePath, content) {
  await fs.writeFile(path.join(targetDir, relativePath), content);
}

async function patchFile(targetDir, relativePath, replacer) {
  const filePath = path.join(targetDir, relativePath);
  if (!(await pathExists(filePath))) {
    return;
  }

  const content = await fs.readFile(filePath, 'utf8');
  await fs.writeFile(filePath, replacer(content));
}

async function applyMysqlConfig(targetDir, orm) {
  await patchFile(targetDir, 'src/config/index.ts', (content) =>
    content
      .replace("dialect: 'postgres' as const", "dialect: 'mysql' as const")
      .replace("process.env.DB_MAIN_USER || 'postgres'", "process.env.DB_MAIN_USER || 'root'")
      .replace(
        "process.env.DB_MAIN_PORT || process.env.DB_PORT || '5432'",
        "process.env.DB_MAIN_PORT || process.env.DB_PORT || '3306'",
      ),
  );

  if (orm === 'sequelize') {
    await patchFile(targetDir, 'src/libs/sequelize.ts', (content) =>
      content
        .replace("import pg from 'pg';", "import mysql2 from 'mysql2';")
        .replace('dialectModule: pg,', 'dialectModule: mysql2,'),
    );

    await patchFile(targetDir, 'src/config/sequelize-cli.ts', (content) =>
      content.replace(/dialect: 'postgres'/g, "dialect: 'mysql'").replace(/'5432'/g, "'3306'"),
    );
  }

  await writeFile(targetDir, 'docker-compose.yml', MYSQL_DOCKER);
  await patchFile(targetDir, '.env.example', (content) =>
    content
      .replace('DB_MAIN_USER=postgres', 'DB_MAIN_USER=root')
      .replace('DB_MAIN_PORT=5432', 'DB_MAIN_PORT=3306'),
  );
}

async function applySqliteConfig(targetDir, orm) {
  await patchFile(targetDir, 'src/config/index.ts', (content) =>
    content.replace(
      /function buildDatabaseConfig\(env: AppEnvironment\) \{[\s\S]*?\n\}/,
      `function buildDatabaseConfig(env: AppEnvironment) {
  void env;
  return {
    dialect: 'sqlite' as const,
    storage: process.env.DB_STORAGE || './database/dev.sqlite',
    pool: process.env.ENABLE_CONNECTION_POOL === 'true' ? poolConfig : undefined,
    logging: process.env.NODE_ENV === Environment.Development,
    timezone: '+00:00',
  };
}`,
    ),
  );

  if (orm === 'sequelize') {
    await patchFile(
      targetDir,
      'src/libs/sequelize.ts',
      () => `import { Sequelize } from 'sequelize';
import config from '@config';

const { database } = config;

export default new Sequelize({
  dialect: 'sqlite',
  storage: database.storage,
  pool: database.pool,
  logging: database.logging,
  timezone: database.timezone,
});
`,
    );

    await patchFile(targetDir, 'src/config/sequelize-cli.ts', (content) =>
      content.replace(
        /function buildEnvConfig\(env: string\) \{[\s\S]*?\n\}/,
        `function buildEnvConfig(env: string) {
  void env;
  return {
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database/dev.sqlite',
  };
}`,
      ),
    );
  }

  await writeFile(targetDir, 'docker-compose.yml', SQLITE_DOCKER);
  await patchFile(targetDir, '.env.example', (content) =>
    content
      .replace(/DB_MAIN_HOST=.*\n/g, '')
      .replace(/DB_MAIN_PORT=.*\n/g, '')
      .replace(/DB_MAIN_USER=.*\n/g, '')
      .replace(/DB_MAIN_PASSWORD=.*\n/g, '')
      .replace(/DB_NAME_DEV=.*\n/g, '')
      .replace(/DB_NAME_TEST=.*\n/g, '')
      .replace(/DB_NAME_PROD=.*\n/g, '')
      .concat('DB_STORAGE=./database/dev.sqlite\n'),
  );
}

export async function applyDatabaseFeature(targetDir, database, orm = 'mikroorm') {
  if (database === 'postgres') {
    return;
  }

  if (database === 'mysql') {
    await applyMysqlConfig(targetDir, orm);
    return;
  }

  if (database === 'sqlite') {
    await applySqliteConfig(targetDir, orm);
  }
}

export function getDatabaseDependencies(database, orm = 'mikroorm') {
  if (orm === 'prisma' || orm === 'mikroorm') {
    return { add: {}, remove: [] };
  }

  if (database === 'mysql') {
    return {
      add: { mysql2: '^3.14.0' },
      remove: ['pg', '@types/pg'],
    };
  }

  if (database === 'sqlite') {
    return {
      add: { sqlite3: '^5.1.7' },
      remove: ['pg', '@types/pg'],
    };
  }

  return { add: {}, remove: [] };
}
