import fs from 'node:fs/promises';
import path from 'node:path';

async function removeIfExists(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true });
}

export async function removeDockerFeature(targetDir) {
  await removeIfExists(path.join(targetDir, 'docker-compose.yml'));
  await removeIfExists(path.join(targetDir, 'Dockerfile'));
  await removeIfExists(path.join(targetDir, '.dockerignore'));
  await removeIfExists(path.join(targetDir, 'scripts'));
}
