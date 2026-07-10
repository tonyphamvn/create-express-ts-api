import fs from 'node:fs/promises';
import path from 'node:path';
import { applyDatabaseFeature } from './features/database.js';
import { removeAuthFeature } from './features/auth.js';
import { removeDockerFeature } from './features/docker.js';
import { removeRedisFeature } from './features/redis.js';
import { writeEnvFile } from './env-file.js';
import { updatePackageJson } from './package-json.js';
import { initGitRepository } from './git.js';

async function removeIfExists(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true });
}

export async function postProcessProject(targetDir, options) {
  await removeIfExists(path.join(targetDir, 'packages'));

  await applyDatabaseFeature(targetDir, options.database);

  if (!options.jwt) {
    await removeAuthFeature(targetDir);
  }

  if (!options.docker) {
    await removeDockerFeature(targetDir);
  }

  if (!options.redis) {
    await removeRedisFeature(targetDir);
  }

  await updatePackageJson(targetDir, options);
  await writeEnvFile(targetDir, options);

  if (options.git) {
    initGitRepository(targetDir);
  }
}
