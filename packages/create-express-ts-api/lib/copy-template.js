import fs from 'node:fs/promises';
import path from 'node:path';
import { EXCLUDE_DIRS, EXCLUDE_FILES } from './constants.js';

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function copyRecursive(source, destination, skipPath) {
  if (skipPath && path.resolve(source) === path.resolve(skipPath)) {
    return;
  }

  const stats = await fs.stat(source);

  if (stats.isDirectory()) {
    if (EXCLUDE_DIRS.has(path.basename(source))) {
      return;
    }

    await fs.mkdir(destination, { recursive: true });
    const entries = await fs.readdir(source);

    await Promise.all(
      entries.map((entry) =>
        copyRecursive(path.join(source, entry), path.join(destination, entry), skipPath),
      ),
    );
    return;
  }

  if (EXCLUDE_FILES.has(path.basename(source))) {
    return;
  }

  await fs.copyFile(source, destination);
}

export async function copyLocalTemplate(templateRoot, targetDir) {
  await copyRecursive(templateRoot, targetDir, targetDir);
}

export async function assertTargetIsEmpty(targetDir) {
  if (!(await exists(targetDir))) {
    return;
  }

  const entries = await fs.readdir(targetDir);
  if (entries.length > 0) {
    throw new Error(`Target directory is not empty: ${targetDir}`);
  }
}

export async function assertValidProjectName(name) {
  if (!name || name.startsWith('-')) {
    throw new Error('Project name is required.');
  }

  if (!/^[a-z0-9-_]+$/i.test(name)) {
    throw new Error('Project name may only contain letters, numbers, hyphens, and underscores.');
  }
}
