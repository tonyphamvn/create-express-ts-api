import fs from 'node:fs/promises';
import path from 'node:path';
import { applyDatabaseFeature } from './features/database.js';
import { applyOrmFeature } from './features/orm.js';
import { removeAuthFeature } from './features/auth.js';
import { applyDeployFeature } from './features/deploy.js';
import { removeRedisFeature } from './features/redis.js';
import { writeEnvFile } from './env-file.js';
import { updatePackageJson } from './package-json.js';
import { writePnpmWorkspaceConfig } from './pnpm-config.js';
import { initGitRepository } from './git.js';

async function removeIfExists(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true });
}

async function removeStaleLockfiles(targetDir) {
  // package.json is rewritten during scaffold, so any template lockfile is stale.
  // Let the chosen package manager generate a fresh one on install.
  await removeIfExists(path.join(targetDir, 'package-lock.json'));
  await removeIfExists(path.join(targetDir, 'pnpm-lock.yaml'));
  await removeIfExists(path.join(targetDir, 'yarn.lock'));
  await removeIfExists(path.join(targetDir, 'bun.lock'));
  await removeIfExists(path.join(targetDir, 'bun.lockb'));
  await removeIfExists(path.join(targetDir, 'npm-shrinkwrap.json'));
}

export async function postProcessProject(targetDir, options) {
  await removeIfExists(path.join(targetDir, 'packages'));
  await removeIfExists(path.join(targetDir, '.github'));

  await applyOrmFeature(targetDir, options.orm, options.database);
  await applyDatabaseFeature(targetDir, options.database, options.orm);

  if (!options.jwt) {
    await removeAuthFeature(targetDir);
  }

  await applyDeployFeature(targetDir, options.deploy || (options.docker ? 'docker' : 'none'));

  if (!options.redis) {
    await removeRedisFeature(targetDir);
  }

  await updatePackageJson(targetDir, options);
  await writeEnvFile(targetDir, options);
  await removeStaleLockfiles(targetDir);

  if (options.packageManager === 'pnpm') {
    await writePnpmWorkspaceConfig(targetDir);
  }

  if (options.git) {
    initGitRepository(targetDir);
  }
}
