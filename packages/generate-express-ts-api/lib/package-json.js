import fs from 'node:fs/promises';
import path from 'node:path';
import { getAuthDependencies } from './features/auth.js';
import { getDatabaseDependencies } from './features/database.js';
import {
  getDeployDependencies,
  getDeployScripts,
} from './features/deploy.js';
import { getOrmDependencies } from './features/orm.js';
import { getRedisDependencies } from './features/redis.js';

function mergeDependencyChanges(packageJson, changesList) {
  const next = { ...packageJson };

  changesList.forEach(({ add = {}, remove = [], devDependencies = {} }) => {
    remove.forEach((dependency) => {
      delete next.dependencies?.[dependency];
      delete next.devDependencies?.[dependency];
    });

    Object.entries(add).forEach(([dependency, version]) => {
      next.dependencies = next.dependencies || {};
      next.dependencies[dependency] = version;
    });

    Object.entries(devDependencies).forEach(([dependency, version]) => {
      next.devDependencies = next.devDependencies || {};
      next.devDependencies[dependency] = version;
    });
  });

  return next;
}

function applyOrmScripts(packageJson, scripts) {
  if (!scripts) {
    return packageJson;
  }

  const nextScripts = { ...packageJson.scripts };

  Object.entries(scripts).forEach(([name, value]) => {
    if (value === undefined) {
      delete nextScripts[name];
      return;
    }

    nextScripts[name] = value;
  });

  return {
    ...packageJson,
    scripts: nextScripts,
  };
}

export async function updatePackageJson(targetDir, options) {
  const packageJsonPath = path.join(targetDir, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

  packageJson.name = options.projectName;
  packageJson.private = true;
  packageJson.version = '1.0.0';

  const ormChanges = getOrmDependencies(options.orm, options.database);

  let updated = mergeDependencyChanges(packageJson, [
    ormChanges,
    getDatabaseDependencies(options.database, options.orm),
    getAuthDependencies(options.jwt),
    getRedisDependencies(options.redis),
    getDeployDependencies(options.deploy),
  ]);

  updated = applyOrmScripts(updated, ormChanges.scripts);
  updated = applyOrmScripts(updated, getDeployScripts(options.deploy));

  if (options.orm === 'mikroorm') {
    updated['mikro-orm'] = {
      useTsNode: true,
      configPaths: ['./mikro-orm.config.ts'],
    };
  } else {
    delete updated['mikro-orm'];
  }

  await fs.writeFile(packageJsonPath, `${JSON.stringify(updated, null, 2)}\n`);
}
