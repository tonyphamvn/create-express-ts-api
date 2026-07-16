## Express TS Boilerplate

Scaffold and ship an Express + TypeScript API with one command.

- [Creating an App](#creating-an-app) – How to create a new API with the CLI.
- [Developing This Repo](#developing-this-repo) – Work on the template locally.
- [Available Scripts](#available-scripts) – Commands in a generated (or template) project.

This repository contains:

1. The **API template** (default: MikroORM + PostgreSQL)
2. The **`generate-express-ts-api`** npm package under `packages/generate-express-ts-api`

Generate Express TS apps with no manual ORM/auth/Docker wiring.

## Quick Overview

```sh
npx generate-express-ts-api my-api
cd my-api
npm install
docker compose up -d
npm run db:migrate
npm run dev
```

Then open [http://localhost:4000/api/v1](http://localhost:4000/api/v1).

_([npx](https://docs.npmjs.com/cli/v10/commands/npx) comes with npm 5.2+.)_

### Get Started Immediately

You **don’t** need to assemble Express, TypeScript, an ORM, JWT, and Docker yourself.<br>
They are preconfigured so you can focus on your routes and domain logic.

Create a project, and you’re good to go.

## Creating an App

**You’ll need Node.js 18 or later** on your local development machine. We recommend the latest LTS. You can use [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows) to switch Node versions between different projects.

Docker is optional but recommended for PostgreSQL/MySQL.

To create a new app, you may choose one of the following methods:

### npx

```sh
npx generate-express-ts-api my-api
```

### npm

```sh
npm init generate-express-ts-api my-api
```

_`npm init <initializer>` is available in npm 6+_

### Yarn

```sh
yarn create generate-express-ts-api my-api
```

It will create a directory called `my-api` inside the current folder.<br>
Inside that directory, it will generate the initial project structure.

Skip interactive prompts with defaults (MikroORM, PostgreSQL, JWT, Docker):

```sh
npx generate-express-ts-api my-api --yes
```

Or customize:

```sh
npx generate-express-ts-api my-api --yes --orm prisma --database mysql
npx generate-express-ts-api my-api --yes --orm typeorm --no-jwt --deploy none
npx generate-express-ts-api my-api --yes --provider giget
npx generate-express-ts-api my-api --yes --package-manager pnpm
```

See full CLI docs in [`packages/generate-express-ts-api/README.md`](packages/generate-express-ts-api/README.md).

Once generation is done, open your project folder:

```sh
cd my-api
npm install
docker compose up -d
npm run db:migrate
npm run dev
```

### Folder Structure

A typical generated app (MikroORM default) looks like this:

```text
my-api
├── README.md
├── package.json
├── tsconfig.json
├── docker-compose.yml
├── Dockerfile
├── mikro-orm.config.ts
├── .env
├── .env.example
└── src
    ├── index.ts
    ├── bootstrap/
    │   ├── app.ts
    │   ├── index.ts
    │   └── routes.ts
    ├── config/
    ├── infrastructure/
    │   ├── auth/
    │   ├── database/
    │   │   ├── entities/
    │   │   └── migrations/
    │   └── socket.ts
    ├── modules/
    │   ├── auth/
    │   └── users/
    ├── scripts/
    ├── shared/
    │   ├── errors/
    │   ├── middlewares/
    │   └── types/
    └── tests/
```

The template keeps bootstrapping, domain modules, infrastructure adapters, and shared utilities separate so the project can grow without moving files around immediately.

When using Express 5 with `express-validation`, generated apps include package-manager-specific type overrides:

- npm: `overrides` in `package.json`
- Yarn: `resolutions` in `package.json`
- pnpm 11+: `overrides` in `pnpm-workspace.yaml`

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs migrations, then starts the API in development mode with Nodemon.<br>
Open [http://localhost:4000/api/v1](http://localhost:4000/api/v1).

The server reloads if you change the code.

### `npm run db:migrate`

Applies pending database migrations.

### `npm run migration:generate`

Generates a new migration via the selected ORM CLI.

### `npm run build`

Compiles TypeScript into `dist`.

### `npm start`

Runs the compiled production build from `dist`. If the app was generated with `--deploy pm2`, the generated start command uses PM2 runtime.

### `npm run lint`

Lints TypeScript sources under `src`.

## Developing This Repo

To work on the template itself (not a scaffolded app):

```sh
cp .env.example .env
npm install
docker compose up -d
npm run db:migrate
npm run dev
```

Test the CLI against this checkout:

```sh
node packages/generate-express-ts-api/bin/generate-express-ts-api.js my-api --local --yes
```

## Philosophy

- **One command:** Get a working Express + TypeScript API without wiring the stack yourself.
- **No configuration required to start:** Defaults (MikroORM, PostgreSQL, JWT, Docker) are production-shaped and ready to run.
- **Choose your ORM:** MikroORM, Sequelize, Prisma, or TypeORM at scaffold time.
- **Your code, your project:** After generation there is no proprietary runtime — edit everything freely.

## What’s Included?

Your environment will have everything you need to build a modern Express API:

- Express 5 + TypeScript
- MikroORM by default (overlays for Sequelize, Prisma, TypeORM)
- PostgreSQL / MySQL / SQLite
- Optional JWT auth (Passport + bcrypt)
- Optional production runtime: Docker (Dockerfile) or PM2
- Optional Docker Compose for DB/Redis
- Optional Redis + Socket.IO
- Migration scripts (`db:migrate`, `migration:generate`)
- Winston logging and ESLint/Prettier baseline

## Contributing

Issues and PRs are welcome. To release the CLI package, see [`packages/generate-express-ts-api/README.md`](packages/generate-express-ts-api/README.md#releasing).

## License

MIT
