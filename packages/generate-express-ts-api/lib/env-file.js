import fs from 'node:fs/promises';
import path from 'node:path';

export async function writeEnvFile(targetDir, options) {
  const envExamplePath = path.join(targetDir, '.env.example');
  const envPath = path.join(targetDir, '.env');
  let content = await fs.readFile(envExamplePath, 'utf8');

  if (!options.jwt) {
    content = content
      .replace(/\nJWT_SECRET=.*\n/, '\n')
      .replace(/\nJWT_EXPIRES_IN=.*\n/, '\n')
      .replace(/\nBEARER=.*\n/, '\n')
      .replace(/\nSALT=.*\n/, '\n');
  }

  if (!options.redis) {
    content = content
      .replace(/\nREDIS_URI=.*\n/, '\n')
      .replace(/\nREDIS_PORT=.*\n/, '\n')
      .replace(/\nREDIS_PASSWORD=.*\n/, '\n');
  }

  await fs.writeFile(envExamplePath, content);
  await fs.writeFile(envPath, content);
}
