import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MIKRO_PATHS = [
  'src/libs/mikro-orm.ts',
  'src/entities',
  'mikro-orm.config.ts',
  'src/database/migrations',
];

async function removeIfExists(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true });
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function copyDirectory(sourceDir, targetDir) {
  await fs.mkdir(targetDir, { recursive: true });
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const sourcePath = path.join(sourceDir, entry.name);
      const targetPath = path.join(targetDir, entry.name);

      if (entry.isDirectory()) {
        await copyDirectory(sourcePath, targetPath);
        return;
      }

      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.copyFile(sourcePath, targetPath);
    }),
  );
}

async function patchFile(targetDir, relativePath, replacer) {
  const filePath = path.join(targetDir, relativePath);
  if (!(await pathExists(filePath))) {
    return;
  }

  const content = await fs.readFile(filePath, 'utf8');
  await fs.writeFile(filePath, replacer(content));
}

function prismaProvider(database) {
  if (database === 'mysql') return 'mysql';
  if (database === 'sqlite') return 'sqlite';
  return 'postgresql';
}

function typeormType(database) {
  if (database === 'mysql') return 'mysql';
  if (database === 'sqlite') return 'sqlite';
  return 'postgres';
}

function mikroDriver(database) {
  if (database === 'mysql') return '@mikro-orm/mysql';
  if (database === 'sqlite') return '@mikro-orm/sqlite';
  return '@mikro-orm/postgresql';
}

function buildDatabaseUrl(database) {
  if (database === 'sqlite') {
    return 'file:./database/dev.sqlite';
  }

  if (database === 'mysql') {
    return 'mysql://root:postgres@localhost:3306/dbdev';
  }

  return 'postgresql://postgres:postgres@localhost:5432/dbdev';
}

function usersCreateSql(database) {
  if (database === 'mysql') {
    return `CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(200) NOT NULL,
  createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);`;
  }

  if (database === 'sqlite') {
    return `CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  password VARCHAR(200) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;
  }

  return `CREATE TABLE "users" (
  "id" SERIAL NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "password" VARCHAR(200) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_users" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_users_email" UNIQUE ("email")
);`;
}

function usersDropSql(database) {
  if (database === 'sqlite' || database === 'mysql') {
    return 'DROP TABLE users;';
  }

  return 'DROP TABLE "users";';
}

async function enableDecorators(targetDir) {
  await patchFile(targetDir, 'tsconfig.json', (content) => {
    if (content.includes('"experimentalDecorators"')) {
      return content;
    }

    return content.replace(
      '"esModuleInterop": true,',
      `"experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "esModuleInterop": true,`,
    );
  });
}

async function writePrismaMigration(targetDir, database) {
  const migrationDir = path.join(targetDir, 'prisma/migrations/20220225111250_add_table_user');
  await fs.mkdir(migrationDir, { recursive: true });
  await fs.writeFile(path.join(migrationDir, 'migration.sql'), `${usersCreateSql(database)}\n`);
}

async function writeTypeormMigration(targetDir, database) {
  const migrationsDir = path.join(targetDir, 'src/database/migrations');
  await fs.mkdir(migrationsDir, { recursive: true });
  await fs.writeFile(
    path.join(migrationsDir, '20220225111250-add-table-user.ts'),
    `import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTableUser20220225111250 implements MigrationInterface {
  name = 'AddTableUser20220225111250';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(\`${usersCreateSql(database).replace(/`/g, '\\`')}\`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(\`${usersDropSql(database).replace(/`/g, '\\`')}\`);
  }
}
`,
  );
}

async function writeMikroMigration(targetDir, database) {
  const migrationsDir = path.join(targetDir, 'src/database/migrations');
  await fs.mkdir(migrationsDir, { recursive: true });
  await fs.writeFile(
    path.join(migrationsDir, 'Migration20220225111250.ts'),
    `import { Migration } from '@mikro-orm/migrations';

export class Migration20220225111250 extends Migration {
  override async up(): Promise<void> {
    this.addSql(\`${usersCreateSql(database).replace(/`/g, '\\`')}\`);
  }

  override async down(): Promise<void> {
    this.addSql(\`${usersDropSql(database).replace(/`/g, '\\`')}\`);
  }
}
`,
  );
}

async function writePrismaClient(targetDir, database) {
  let content;

  if (database === 'mysql') {
    content = `import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const url = new URL(connectionString);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\\//, ''),
});
const prisma = new PrismaClient({ adapter });

export default prisma;
`;
  } else if (database === 'sqlite') {
    content = `import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@/generated/prisma/client';

const connectionString = process.env.DATABASE_URL || 'file:./database/dev.sqlite';
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;
`;
  } else {
    content = `import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;
`;
  }

  await fs.writeFile(path.join(targetDir, 'src/libs/prisma.ts'), content);
}

async function applyPrismaDialect(targetDir, database) {
  await patchFile(targetDir, 'prisma/schema.prisma', (content) =>
    content.replace(
      /(datasource\s+db\s*\{[\s\S]*?provider\s*=\s*")[^"]+(")/,
      `$1${prismaProvider(database)}$2`,
    ),
  );

  await writePrismaClient(targetDir, database);
  await writePrismaMigration(targetDir, database);

  await patchFile(targetDir, '.env.example', (content) => {
    const url = `DATABASE_URL=${buildDatabaseUrl(database)}\n`;
    if (content.includes('DATABASE_URL=')) {
      return content.replace(/DATABASE_URL=.*/, url.trim());
    }
    return `${content.trimEnd()}\n\n${url}`;
  });

  await patchFile(targetDir, '.gitignore', (content) => {
    if (content.includes('src/generated')) {
      return content;
    }
    return `${content.trimEnd()}\n\nsrc/generated\n`;
  });
}

async function applyTypeormDialect(targetDir, database) {
  await patchFile(targetDir, 'src/libs/typeorm.ts', (content) =>
    content.replace(/type:\s*'[^']+'/, `type: '${typeormType(database)}'`),
  );
  await writeTypeormMigration(targetDir, database);
  await enableDecorators(targetDir);
}

async function applyMikroDialect(targetDir, database) {
  const driver = mikroDriver(database);

  await patchFile(targetDir, 'src/libs/mikro-orm.ts', (content) =>
    content.replace(/from '@mikro-orm\/[^']+'/g, `from '${driver}'`),
  );
  await patchFile(targetDir, 'mikro-orm.config.ts', (content) =>
    content.replace(/from '@mikro-orm\/[^']+'/g, `from '${driver}'`),
  );

  if (database !== 'postgres') {
    await writeMikroMigration(targetDir, database);
  }

  await enableDecorators(targetDir);
}

async function removePaths(targetDir, relativePaths) {
  await Promise.all(
    relativePaths.map((relativePath) => removeIfExists(path.join(targetDir, relativePath))),
  );
}

async function removeDefaultOrmArtifacts(targetDir) {
  await removePaths(targetDir, MIKRO_PATHS);
}

export async function applyOrmFeature(targetDir, orm, database) {
  const selectedOrm = orm || 'mikroorm';

  if (selectedOrm === 'mikroorm') {
    await applyMikroDialect(targetDir, database);
    return;
  }

  const overlayDir = path.join(__dirname, '../../templates/orm', selectedOrm);
  if (!(await pathExists(overlayDir))) {
    throw new Error(`ORM overlay not found: ${selectedOrm}`);
  }

  await removeDefaultOrmArtifacts(targetDir);
  await copyDirectory(overlayDir, targetDir);

  if (selectedOrm === 'prisma') {
    await applyPrismaDialect(targetDir, database);
  } else if (selectedOrm === 'typeorm') {
    await applyTypeormDialect(targetDir, database);
  } else if (selectedOrm === 'sequelize') {
    await enableDecorators(targetDir);
  }
}

const MIKRO_PACKAGES = [
  '@mikro-orm/core',
  '@mikro-orm/migrations',
  '@mikro-orm/postgresql',
  '@mikro-orm/mysql',
  '@mikro-orm/sqlite',
  '@mikro-orm/cli',
];

const SEQUELIZE_SCRIPTS = {
  'build:migrations': 'tsc -p tsconfig.migrations.json',
  'db:migrate': 'npm run build:migrations && sequelize db:migrate',
  'db:migrate:qa': 'npm run build:migrations && cross-env NODE_ENV=qa sequelize db:migrate',
  'db:migrate:production': 'cross-env NODE_ENV=production sequelize db:migrate',
  'migration:generate': 'sequelize migration:generate --migrations-path database/migrations --name',
  'seed:generate': 'sequelize seed:generate --seeders-path database/seeders --name',
  'db:seed': 'sequelize db:seed:all',
  dev: 'npm run db:migrate && cross-env DEBUG=http,mail,express:* nodemon ./src/index.ts',
};

export function getOrmDependencies(orm, database) {
  const selectedOrm = orm || 'mikroorm';

  if (selectedOrm === 'mikroorm') {
    if (database === 'postgres') {
      return { add: {}, remove: [], scripts: null, devDependencies: {} };
    }

    const driverPackage = mikroDriver(database);
    return {
      add: {
        [driverPackage]: '^6.4.13',
      },
      remove: ['@mikro-orm/postgresql'],
      scripts: null,
      devDependencies: {},
    };
  }

  if (selectedOrm === 'sequelize') {
    let driverAdd = { pg: '^8.14.1' };
    let driverRemove = [];
    if (database === 'mysql') {
      driverAdd = { mysql2: '^3.14.0' };
      driverRemove = ['pg', '@types/pg'];
    } else if (database === 'sqlite') {
      driverAdd = { sqlite3: '^5.1.7' };
      driverRemove = ['pg', '@types/pg'];
    }

    return {
      add: {
        sequelize: '^6.37.7',
        ...driverAdd,
      },
      remove: [...MIKRO_PACKAGES, 'reflect-metadata', ...driverRemove],
      devDependencies: {
        'sequelize-cli': '^6.6.3',
        ...(database === 'postgres' ? { '@types/pg': '^8.11.11' } : {}),
      },
      scripts: SEQUELIZE_SCRIPTS,
    };
  }

  if (selectedOrm === 'prisma') {
    let adapterAdd = {
      '@prisma/adapter-pg': '^7.6.0',
      pg: '^8.14.1',
    };

    if (database === 'mysql') {
      adapterAdd = {
        '@prisma/adapter-mariadb': '^7.6.0',
        mariadb: '^3.4.0',
      };
    } else if (database === 'sqlite') {
      adapterAdd = {
        '@prisma/adapter-better-sqlite3': '^7.6.0',
        'better-sqlite3': '^11.8.1',
      };
    }

    return {
      add: {
        '@prisma/client': '^7.6.0',
        ...adapterAdd,
      },
      remove: [...MIKRO_PACKAGES, 'reflect-metadata'],
      devDependencies: {
        prisma: '^7.6.0',
        ...(database === 'postgres' ? { '@types/pg': '^8.11.11' } : {}),
      },
      scripts: {
        'db:migrate': 'prisma migrate deploy',
        'db:migrate:qa': 'prisma migrate deploy',
        'db:migrate:production': 'prisma migrate deploy',
        'migration:generate': 'prisma migrate dev --name',
        postinstall: 'prisma generate',
        dev: 'npm run db:migrate && cross-env DEBUG=http,mail,express:* nodemon ./src/index.ts',
      },
    };
  }

  if (selectedOrm === 'typeorm') {
    let driverAdd = { pg: '^8.14.1' };
    let driverRemove = [];
    if (database === 'mysql') {
      driverAdd = { mysql2: '^3.14.0' };
      driverRemove = ['pg', '@types/pg'];
    } else if (database === 'sqlite') {
      driverAdd = { sqlite3: '^5.1.7' };
      driverRemove = ['pg', '@types/pg'];
    }

    return {
      add: {
        typeorm: '^0.3.21',
        'reflect-metadata': '^0.2.2',
        ...driverAdd,
      },
      remove: [...MIKRO_PACKAGES, ...driverRemove],
      devDependencies: {
        ...(database === 'postgres' ? { '@types/pg': '^8.11.11' } : {}),
      },
      scripts: {
        'db:migrate': 'typeorm-ts-node-commonjs migration:run -d src/libs/typeorm.ts',
        'db:migrate:qa':
          'cross-env NODE_ENV=qa typeorm-ts-node-commonjs migration:run -d src/libs/typeorm.ts',
        'db:migrate:production':
          'cross-env NODE_ENV=production typeorm-ts-node-commonjs migration:run -d src/libs/typeorm.ts',
        'migration:generate': 'typeorm-ts-node-commonjs migration:generate -d src/libs/typeorm.ts',
        dev: 'npm run db:migrate && cross-env DEBUG=http,mail,express:* nodemon ./src/index.ts',
      },
    };
  }

  return { add: {}, remove: [], scripts: null, devDependencies: {} };
}
