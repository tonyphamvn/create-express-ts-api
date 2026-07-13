import fs from 'node:fs/promises';
import path from 'node:path';

async function patchFile(targetDir, relativePath, replacer) {
  const filePath = path.join(targetDir, relativePath);
  const content = await fs.readFile(filePath, 'utf8');
  await fs.writeFile(filePath, replacer(content));
}

export async function removeRedisFeature(targetDir) {
  await patchFile(targetDir, '.env.example', (content) =>
    content
      .replace(/\nSOCKET_PORT=.*\n/, '\n')
      .replace(/\nREDIS_URI=.*\n/, '\n')
      .replace(/\nREDIS_PORT=.*\n/, '\n')
      .replace(/\nREDIS_PASSWORD=.*\n/, '\n'),
  );

  const dockerComposePath = path.join(targetDir, 'docker-compose.yml');
  try {
    const content = await fs.readFile(dockerComposePath, 'utf8');
    const withoutRedis = content
      .replace(/\n  redis:[\s\S]*?restart: always\n/, '\n')
      .replace(/\n  redis_data:\n/, '\n');
    await fs.writeFile(dockerComposePath, withoutRedis);
  } catch {
    // optional when docker disabled
  }
}

export function getRedisDependencies(enabled) {
  if (enabled) {
    return { add: {}, remove: [] };
  }

  return {
    add: {},
    remove: ['@socket.io/redis-adapter', '@socket.io/redis-emitter', 'redis', 'socket.io'],
  };
}
