import fs from 'node:fs/promises';
import path from 'node:path';

const PNPM_ALLOW_BUILDS = {
  bcrypt: true,
  'unrs-resolver': true,
};

export async function writePnpmWorkspaceConfig(targetDir) {
  const workspacePath = path.join(targetDir, 'pnpm-workspace.yaml');
  const lines = [
    '# pnpm 11+ settings (allowBuilds lives here, not in package.json)',
    'allowBuilds:',
    ...Object.entries(PNPM_ALLOW_BUILDS).map(
      ([name, allowed]) => `  ${JSON.stringify(name)}: ${allowed}`,
    ),
    '',
  ];

  await fs.writeFile(workspacePath, lines.join('\n'));
}
