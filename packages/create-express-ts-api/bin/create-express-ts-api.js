#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as p from '@clack/prompts';
import { DEFAULT_GIGET_TEMPLATE, DEFAULT_TEMPLATE_REPO } from '../lib/constants.js';
import {
  assertTargetIsEmpty,
  assertValidProjectName,
  copyLocalTemplate,
} from '../lib/copy-template.js';
import { downloadProjectTemplate } from '../lib/download-template.js';
import { collectProjectOptions } from '../lib/prompts.js';
import { postProcessProject } from '../lib/post-process.js';
import { installDependencies } from '../lib/install.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_OPTIONS = {
  local: false,
  template: DEFAULT_TEMPLATE_REPO,
  provider: 'degit',
  orm: 'mikroorm',
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
    } else if (arg === '--yes' || arg === '-y') {
      options.yes = true;
    } else if (arg === '--local') {
      options.local = true;
    } else if (arg === '--git') {
      options.git = true;
    } else if (arg === '--no-git') {
      options.git = false;
    } else if (arg === '--jwt') {
      options.jwt = true;
    } else if (arg === '--no-jwt') {
      options.jwt = false;
    } else if (arg === '--docker') {
      options.docker = true;
    } else if (arg === '--no-docker') {
      options.docker = false;
    } else if (arg === '--redis') {
      options.redis = true;
    } else if (arg === '--no-redis') {
      options.redis = false;
    } else if (arg === '--template') {
      options.template = argv[index + 1];
      index += 1;
    } else if (arg === '--provider') {
      options.provider = argv[index + 1];
      index += 1;
    } else if (arg === '--orm') {
      options.orm = argv[index + 1];
      index += 1;
    } else if (arg === '--database') {
      options.database = argv[index + 1];
      index += 1;
    } else if (arg === '--package-manager') {
      options.packageManager = argv[index + 1];
      index += 1;
    } else {
      positionals.push(arg);
    }
  }

  return { options, projectName: positionals[0] };
}

function printHelp() {
  console.log(`
Usage:
  npx generate-express-ts-starter [project-name] [options]

Options:
  --yes, -y                 Use defaults (non-interactive)
  --orm <name>              sequelize | prisma | typeorm | mikroorm (default: mikroorm)
  --database <type>         postgres | mysql | sqlite
  --jwt / --no-jwt          Include JWT auth module
  --docker / --no-docker    Include Docker files
  --redis / --no-redis      Include Redis + Socket.IO deps
  --git / --no-git          Initialize git repository
  --package-manager <pm>    npm | pnpm | yarn | bun
  --provider <name>         degit | giget
  --template <source>       Template source (default: ${DEFAULT_TEMPLATE_REPO})
  --local                   Copy template from local repo (development)
  -h, --help                Show help

Examples:
  npx generate-express-ts-starter
  npx generate-express-ts-starter my-api --yes
  npx generate-express-ts-starter my-api --yes --orm prisma --database mysql
  node packages/create-express-app/bin/create-express-app.js my-api --local --yes --orm typeorm
`);
}

function printNextSteps(projectName, options) {
  const runCommand = {
    npm: 'npm run',
    pnpm: 'pnpm',
    yarn: 'yarn',
    bun: 'bun run',
  }[options.packageManager];

  const lines = [
    '',
    `🎉 Done. Created ${projectName}.`,
    '',
    '🚀 Next steps:',
    `  cd ${projectName}`,
  ];

  if (options.docker) {
    lines.push('  docker compose up -d');
  }

  if (options.database !== 'sqlite' || options.docker) {
    lines.push(`  ${runCommand} db:migrate`);
  }

  lines.push(`  ${runCommand} dev`, '');
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
        orm: argvOptions.orm,
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

  const s = p.spinner();
  s.start('Setting up');

  try {
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

    s.message(`Installing dependencies via ${options.packageManager}`);
    await installDependencies(targetDir, options.packageManager);

    s.stop('Setting up');
  } catch (error) {
    s.stop('Setting up', 1);
    throw error;
  }

  // Print after open handles (e.g. degit) drain so "Done" appears right before exit
  process.once('beforeExit', () => {
    printNextSteps(options.projectName, options);
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
