import * as p from '@clack/prompts';

function isCancel(value) {
  return p.isCancel(value);
}

function handleCancel(value) {
  if (isCancel(value)) {
    p.cancel('Scaffold cancelled.');
    process.exit(0);
  }

  return value;
}

export async function collectProjectOptions(argvOptions) {
  if (argvOptions.yes) {
    return {
      projectName: argvOptions.projectName,
      database: argvOptions.database,
      jwt: argvOptions.jwt,
      docker: argvOptions.docker,
      redis: argvOptions.redis,
      git: argvOptions.git,
      packageManager: argvOptions.packageManager,
      provider: argvOptions.provider,
      template: argvOptions.template,
      local: argvOptions.local,
    };
  }

  p.intro('create-express-ts-app');

  const projectName = handleCancel(
    await p.text({
      message: 'Project name',
      placeholder: 'my-api',
      initialValue: argvOptions.projectName,
      validate: (value) => {
        if (!value) return 'Project name is required';
        if (!/^[a-z0-9-_]+$/i.test(value)) {
          return 'Use letters, numbers, hyphens, and underscores only';
        }
        return undefined;
      },
    }),
  );

  const database = handleCancel(
    await p.select({
      message: 'Database',
      initialValue: argvOptions.database,
      options: [
        { value: 'postgres', label: 'PostgreSQL', hint: 'recommended' },
        { value: 'mysql', label: 'MySQL' },
        { value: 'sqlite', label: 'SQLite', hint: 'local file, no Docker DB' },
      ],
    }),
  );

  const jwt = handleCancel(
    await p.confirm({
      message: 'Include JWT auth module?',
      initialValue: argvOptions.jwt,
    }),
  );

  const docker = handleCancel(
    await p.confirm({
      message: 'Include Docker files?',
      initialValue: argvOptions.docker,
    }),
  );

  const redis = handleCancel(
    await p.confirm({
      message: 'Include Redis + Socket.IO deps?',
      initialValue: argvOptions.redis,
    }),
  );

  const git = handleCancel(
    await p.confirm({
      message: 'Initialize git repository?',
      initialValue: argvOptions.git,
    }),
  );

  const packageManager = handleCancel(
    await p.select({
      message: 'Package manager',
      initialValue: argvOptions.packageManager,
      options: [
        { value: 'npm', label: 'npm' },
        { value: 'pnpm', label: 'pnpm' },
        { value: 'yarn', label: 'yarn' },
      ],
    }),
  );

  const provider = handleCancel(
    await p.select({
      message: 'Template provider',
      initialValue: argvOptions.provider,
      options: [
        { value: 'degit', label: 'degit', hint: 'GitHub template, no git history' },
        { value: 'giget', label: 'giget', hint: 'archive download fallback' },
      ],
    }),
  );

  p.outro('Ready to scaffold');

  return {
    projectName,
    database,
    jwt,
    docker,
    redis,
    git,
    packageManager,
    provider,
    template: argvOptions.template,
    local: argvOptions.local,
  };
}
