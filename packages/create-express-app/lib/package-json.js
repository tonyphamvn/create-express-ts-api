import fs from 'node:fs/promises';
import path from 'node:path';
import { getAuthDependencies } from './features/auth.js';
import { getDatabaseDependencies } from './features/database.js';
import { getRedisDependencies } from './features/redis.js';

function mergeDependencyChanges(packageJson, changesList) {
  const next = { ...packageJson };

  changesList.forEach(({ add, remove }) => {
    remove.forEach((dependency) => {
      delete next.dependencies?.[dependency];
      delete next.devDependencies?.[dependency];
    });

    Object.entries(add).forEach(([dependency, version]) => {
      next.dependencies = next.dependencies || {};
      next.dependencies[dependency] = version;
    });
  });

  return next;
}

export async function updatePackageJson(targetDir, options) {
  const packageJsonPath = path.join(targetDir, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

  packageJson.name = options.projectName;
  packageJson.private = true;
  packageJson.version = '1.0.0';

  const updated = mergeDependencyChanges(packageJson, [
    getDatabaseDependencies(options.database),
    getAuthDependencies(options.jwt),
    getRedisDependencies(options.redis),
  ]);

  await fs.writeFile(packageJsonPath, `${JSON.stringify(updated, null, 2)}\n`);
}
