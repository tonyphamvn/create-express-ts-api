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

export async function removeAuthFeature(targetDir) {
  await removeIfExists(path.join(targetDir, 'src/modules/auth'));
  await removeIfExists(path.join(targetDir, 'src/libs/passport.ts'));
  await removeIfExists(path.join(targetDir, 'src/libs/bcrypt.ts'));

  await patchFile(targetDir, 'src/app.ts', (content) =>
    content
      .replace("import passport from 'passport';\n", '')
      .replace("import { configurePassport } from '@/libs/passport';\n", '')
      .replace('    this.initPassport();\n', '')
      .replace(/ {2}private initPassport\(\) \{[\s\S]*? {2}\}\n\n/, ''),
  );

  await patchFile(targetDir, 'src/routes/index.ts', (content) =>
    content
      .replace("import authRoutes from '@/modules/auth/auth.routes';\n", '')
      .replace("router.use('/auth', authRoutes);\n", ''),
  );
}

export function getAuthDependencies(enabled) {
  if (enabled) {
    return { add: {}, remove: [] };
  }

  return {
    add: {},
    remove: [
      'bcrypt',
      'jsonwebtoken',
      'passport',
      'passport-jwt',
      '@types/bcrypt',
      '@types/jsonwebtoken',
      '@types/passport',
      '@types/passport-jwt',
    ],
  };
}
