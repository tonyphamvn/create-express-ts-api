#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_GIGET_TEMPLATE, DEFAULT_TEMPLATE_REPO } from '../lib/constants.js';
import {
  assertTargetIsEmpty,
  assertValidProjectName,
  copyLocalTemplate,
} from '../lib/copy-template.js';
import { downloadProjectTemplate } from '../lib/download-template.js';
import { collectProjectOptions } from '../lib/prompts.js';
import { postProcessProject } from '../lib/post-process.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_OPTIONS = {
  local: false,
  template: DEFAULT_TEMPLATE_REPO,
  provider: 'degit',
  database: 'postgres',
  jwt: true,
  docker: true,
  redis: false,
  git: true,
  packageManager: 'npm',
  yes: false,
  help: false,
};

function parseArgs(argv) {
  const options = { ...DEFAULT_OPTIONS };
  const positionals = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--yes' || arg === '-y') {
      options.yes = true;
      continue;
    }

    if (arg === '--local') {
      options.local = true;
      continue;
    }

    if (arg === '--git') {
      options.git = true;
      continue;
    }

    if (arg === '--no-git') {
      options.git = false;
      continue;
    }

    if (arg === '--jwt') {
      options.jwt = true;
      continue;
    }

    if (arg === '--no-jwt') {
      options.jwt = false;
      continue;
    }

    if (arg === '--docker') {
      options.docker = true;
      continue;
    }

    if (arg === '--no-docker') {
      options.docker = false;
      continue;
    }

    if (arg === '--redis') {
      options.redis = true;
      continue;
    }

    if (arg === '--no-redis') {
      options.redis = false;
      continue;
    }

    if (arg === '--template') {
      options.template = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === '--provider') {
      options.provider = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === '--database') {
      options.database = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === '--package-manager') {
      options.packageManager = argv[index + 1];
      index += 1;
      continue;
    }

    positionals.push(arg);
  }

  return { options, projectName: positionals[0] };
}

function printHelp() {
  console.log(`
Usage:
  npx create-express-ts-app [project-name] [options]
  npm create express-ts-app [project-name] [options]

Options:
  --yes, -y                 Use defaults (non-interactive)
  --database <type>         postgres | mysql | sqlite
  --jwt / --no-jwt          Include JWT auth module
  --docker / --no-docker    Include Docker files
  --redis / --no-redis      Include Redis + Socket.IO deps
  --git / --no-git          Initialize git repository
  --package-manager <pm>    npm | pnpm | yarn
  --provider <name>         degit | giget
  --template <source>       Template source (default: ${DEFAULT_TEMPLATE_REPO})
  --local                   Copy template from local repo (development)
  -h, --help                Show help

Examples:
  npx create-express-ts-app
  npx create-express-ts-app my-api --yes
  npx create-express-ts-app my-api --yes --database mysql --no-jwt
  npm create express-ts-app my-api
  node packages/create-express-app/bin/create-express-app.js my-api --local --yes
`);
}

function printNextSteps(projectName, options) {
  const installCommand = {
    npm: 'npm install',
    pnpm: 'pnpm install',
    yarn: 'yarn install',
  }[options.packageManager];

  const lines = [
    '',
    `Done. Created ${projectName}.`,
    '',
    'Next steps:',
    `  cd ${projectName}`,
    `  ${installCommand}`,
  ];

  if (options.docker) {
    lines.push('  docker compose up -d');
  }

  if (options.database !== 'sqlite' || options.docker) {
    lines.push('  npm run db:migrate');
  }

  lines.push('  npm run dev', '');
  console.log(lines.join('\n'));
}

async function main() {
  const { options: argvOptions, projectName: argvProjectName } = parseArgs(process.argv.slice(2));

  if (argvOptions.help) {
    printHelp();
    return;
  }

  const shouldPrompt = !argvOptions.yes || !argvProjectName;
  const options = shouldPrompt
    ? await collectProjectOptions({ ...argvOptions, projectName: argvProjectName })
    : {
        projectName: argvProjectName,
        database: argvOptions.database,
        jwt: argvOptions.jwt,
        docker: argvOptions.docker,
        redis: argvOptions.redis,
        git: argvOptions.git,
        packageManager: argvOptions.packageManager,
        provider: argvOptions.provider,
        template:
          argvOptions.provider === 'giget' && !argvOptions.template.startsWith('github:')
            ? DEFAULT_GIGET_TEMPLATE
            : argvOptions.template,
        local: argvOptions.local,
      };

  await assertValidProjectName(options.projectName);

  const targetDir = path.resolve(process.cwd(), options.projectName);
  await assertTargetIsEmpty(targetDir);
  await fs.mkdir(targetDir, { recursive: true });

  if (options.local) {
    const templateRoot = path.resolve(__dirname, '../../..');
    await copyLocalTemplate(templateRoot, targetDir);
  } else {
    await downloadProjectTemplate({
      provider: options.provider,
      template: options.template,
      targetDir,
      local: false,
    });
  }

  await postProcessProject(targetDir, options);
  printNextSteps(options.projectName, options);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
