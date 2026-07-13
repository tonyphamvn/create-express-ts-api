import { execSync } from 'node:child_process';

export function initGitRepository(targetDir) {
  execSync('git init', { cwd: targetDir, stdio: 'ignore' });
}
