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

function resolveDeploy(argvOptions) {
  if (argvOptions.deploy) {
    return argvOptions.deploy;
  }

  if (argvOptions.docker === false) {
    return 'none';
  }

  return 'docker';
}

export async function collectProjectOptions(argvOptions) {
  if (argvOptions.yes) {
    const deploy = resolveDeploy(argvOptions);

    return {
      projectName: argvOptions.projectName,
      orm: argvOptions.orm,
      database: argvOptions.database,
      jwt: argvOptions.jwt,
      deploy,
      docker: deploy === 'docker',
      redis: argvOptions.redis,
      git: argvOptions.git,
      packageManager: argvOptions.packageManager,
      provider: argvOptions.provider,
      template: argvOptions.template,
      local: argvOptions.local,
    };
  }

  p.intro('generate-express-ts-api');

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

  const orm = handleCancel(
    await p.select({
      message: 'ORM',
      initialValue: argvOptions.orm || 'mikroorm',
      options: [
        { value: 'mikroorm', label: 'MikroORM', hint: 'default' },
        { value: 'sequelize', label: 'Sequelize' },
        { value: 'prisma', label: 'Prisma' },
        { value: 'typeorm', label: 'TypeORM' },
      ],
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

  const deploy = handleCancel(
    await p.select({
      message: 'Production runtime',
      initialValue: resolveDeploy(argvOptions),
      options: [
        {
          value: 'docker',
          label: 'Docker',
          hint: 'Dockerfile + compose',
        },
        {
          value: 'pm2',
          label: 'PM2',
          hint: 'VPS process manager; keep compose for DB/Redis',
        },
        {
          value: 'none',
          label: 'Neither',
          hint: 'plain node dist/index.js',
        },
      ],
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
        { value: 'bun', label: 'bun' },
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
    orm,
    database,
    jwt,
    deploy,
    docker: deploy === 'docker',
    redis,
    git,
    packageManager,
    provider,
    template: argvOptions.template,
    local: argvOptions.local,
  };
}
