import fs from 'node:fs/promises';
import path from 'node:path';
import { removeDockerFeature, removeDockerfileOnly } from './docker.js';

const ECOSYSTEM_CONFIG = `module.exports = {
  apps: [
    {
      name: 'api',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
`;

async function removeIfExists(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true });
}

async function removePm2Artifacts(targetDir) {
  await removeIfExists(path.join(targetDir, 'ecosystem.config.cjs'));
}

async function writePm2Artifacts(targetDir) {
  await fs.writeFile(path.join(targetDir, 'ecosystem.config.cjs'), ECOSYSTEM_CONFIG);
}

/**
 * deploy:
 * - docker: Dockerfile + compose, no PM2
 * - pm2: PM2 + compose (DB/Redis infra), no Dockerfile
 * - none: plain node, no Docker files, no PM2
 */
export async function applyDeployFeature(targetDir, deploy) {
  if (deploy === 'docker') {
    await removePm2Artifacts(targetDir);
    return;
  }

  if (deploy === 'pm2') {
    await removeDockerfileOnly(targetDir);
    await writePm2Artifacts(targetDir);
    return;
  }

  await removeDockerFeature(targetDir);
  await removePm2Artifacts(targetDir);
}

export function getDeployDependencies(deploy) {
  if (deploy === 'pm2') {
    return {
      add: {
        pm2: '^7.0.3',
      },
      remove: [],
    };
  }

  return {
    add: {},
    remove: ['pm2'],
  };
}

export function getDeployScripts(deploy) {
  if (deploy === 'pm2') {
    return {
      start: 'pm2-runtime start ecosystem.config.cjs',
    };
  }

  return {
    start: 'node dist/index.js',
  };
}
