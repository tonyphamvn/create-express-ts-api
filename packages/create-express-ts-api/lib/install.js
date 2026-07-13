import { spawn } from 'node:child_process';

const INSTALL_ARGS = {
  npm: ['install'],
  pnpm: ['install'],
  yarn: ['install'],
  bun: ['install'],
};

const INSTALL_HINTS = {
  pnpm: 'Install pnpm first: npm install -g pnpm   (or: corepack enable)',
  yarn: 'Install yarn first: npm install -g yarn   (or: corepack enable)',
  bun: 'Install bun first: https://bun.sh  (curl -fsSL https://bun.sh/install | bash)',
  npm: 'npm was not found on PATH. Install Node.js from https://nodejs.org',
};

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(
          new Error(
            `${command} was not found on PATH.\n${INSTALL_HINTS[command] || `Install ${command} and try again.`}`,
          ),
        );
        return;
      }

      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      const details = [stderr.trim(), stdout.trim()].filter(Boolean).join('\n');
      reject(
        new Error(
          details
            ? `${command} ${args.join(' ')} failed with exit code ${code}\n\n${details}`
            : `${command} ${args.join(' ')} failed with exit code ${code}`,
        ),
      );
    });
  });
}

export async function installDependencies(targetDir, packageManager) {
  const args = INSTALL_ARGS[packageManager];

  if (!args) {
    throw new Error(`Unsupported package manager: ${packageManager}`);
  }

  await runCommand(packageManager, args, targetDir);
}
