import fs from 'node:fs/promises';
import path from 'node:path';

async function removeIfExists(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true });
}

async function patchFile(targetDir, relativePath, replacer) {
  const filePath = path.join(targetDir, relativePath);
  const content = await fs.readFile(filePath, 'utf8');
  await fs.writeFile(filePath, replacer(content));
}

export async function removeRedisFeature(targetDir) {
  await removeIfExists(path.join(targetDir, 'src/libs/socket.ts'));

  await patchFile(targetDir, 'src/app.ts', (content) =>
    content
      .replace("import http from 'http';\n", '')
      .replace("import { initSocket } from '@/libs/socket';\n", '')
      .replace(
        `  public async listen() {
    const server = http.createServer(this.app);

    await initSocket(server);

    await new Promise<void>((resolve) => {
      server.listen(this.port, () => {
        if (process.env.NODE_ENV !== Environment.Production) {
          console.log('Server is listening at port', this.port);
        }
        resolve();
      });
    });
  }
`,
        `  public listen() {
    this.app.listen(this.port, () => {
      if (process.env.NODE_ENV !== Environment.Production) {
        console.log('Server is listening at port', this.port);
      }
    });
  }
`,
      ),
  );

  await patchFile(targetDir, 'src/index.ts', (content) =>
    content.replace('  await app.listen();\n', '  app.listen();\n'),
  );

  await patchFile(targetDir, '.env.example', (content) =>
    content
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
    remove: ['@socket.io/redis-adapter', 'redis', 'socket.io'],
  };
}
