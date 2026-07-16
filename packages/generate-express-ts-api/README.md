## Generate Express TS API

Scaffold an Express + TypeScript API with one command.

- [Creating an App](#creating-an-app) – How to create a new API.
- [Available Scripts](#available-scripts) – Commands inside a generated project.
- [What’s Included?](#whats-included) – Features and defaults.

Works on macOS, Windows, and Linux.

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

You **don’t** need to wire Express, TypeScript, an ORM, JWT, or Docker by hand.<br>
Sensible defaults are chosen for you so you can focus on your API.

Create a project, install dependencies, and you’re good to go.

## Creating an App

**You’ll need Node.js 18 or later** on your local machine. We recommend the latest LTS. You can use [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows) to switch Node versions between projects.

Docker is optional but recommended when using PostgreSQL or MySQL.

To create a new app, run:

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
Inside that directory, it will generate the project structure (default: **MikroORM** + **PostgreSQL** + JWT + Docker).

With prompts skipped:

```sh
npx generate-express-ts-api my-api --yes
```

Customize during scaffold:

```sh
npx generate-express-ts-api my-api --yes --orm prisma --database mysql
npx generate-express-ts-api my-api --yes --orm typeorm --no-jwt --deploy none
npx generate-express-ts-api my-api --yes --deploy pm2
npx generate-express-ts-api my-api --yes --provider giget
npx generate-express-ts-api my-api --yes --package-manager pnpm
```

#### Options

| Option                     | Description                                        | Default    |
| -------------------------- | -------------------------------------------------- | ---------- |
| `--yes`, `-y`              | Skip prompts and use defaults                      | off        |
| `--orm <name>`             | `mikroorm` \| `sequelize` \| `prisma` \| `typeorm` | `mikroorm` |
| `--database <type>`        | `postgres` \| `mysql` \| `sqlite`                  | `postgres` |
| `--jwt` / `--no-jwt`       | Include JWT auth module                            | on         |
| `--deploy <mode>`          | `docker` \| `pm2` \| `none`                        | `docker`   |
| `--docker` / `--no-docker` | Alias for `--deploy docker` / `--deploy none`      | —          |
| `--pm2`                    | Alias for `--deploy pm2`                           | —          |
| `--redis` / `--no-redis`   | Include Redis + Socket.IO deps                     | off        |
| `--git` / `--no-git`       | Initialize a git repository                        | on         |
| `--package-manager <pm>`   | `npm` \| `pnpm` \| `yarn` \| `bun`                 | `npm`      |
| `-h`, `--help`             | Show help                                          |            |

A typical generated project looks like this (MikroORM default):

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

The template keeps bootstrapping, domain modules, infrastructure adapters, and shared utilities separate so the project can grow without moving files around immediately.<br>
Once generation is done:

```sh
cd my-api
npm install
```

Inside the newly created project, you can run the built-in commands below.

### Package Manager Notes

Generated projects include Express 5 type overrides so `express-validation` does not pull incompatible Express 4 types:

- npm uses `overrides` in `package.json`
- Yarn uses `resolutions` in `package.json`
- pnpm 11+ uses `overrides` in `pnpm-workspace.yaml`

When using `--provider giget`, the CLI downloads the GitHub repository directly and skips the `giget` template registry.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs database migrations, then starts the API in development mode with Nodemon.<br>
Open [http://localhost:4000/api/v1](http://localhost:4000/api/v1).

The server reloads when you change source files.

> Tip: `DEBUG=express:*` is enabled in the default `dev` script, so Express may print verbose router logs. Remove `express:*` from `package.json` if you want quieter output.

### `npm run db:migrate`

Applies pending ORM migrations.

If Docker was included, start the database first:

```sh
docker compose up -d
```

### `npm run migration:generate`

Creates a new migration (ORM-specific CLI under the hood).

### `npm run build`

Compiles TypeScript to the `dist` folder.

### `npm start`

Runs the compiled production build from `dist`. If the app was generated with `--deploy pm2`, the generated start command uses PM2 runtime.

### `npm run lint`

Runs ESLint on `src`.

## Philosophy

- **One command:** Bootstrap a production-shaped Express API without assembling packages by hand.
- **Sensible defaults:** MikroORM + PostgreSQL + JWT + Docker work out of the box; flip flags when you need something else.
- **No lock-in to one ORM:** Choose MikroORM, Sequelize, Prisma, or TypeORM at scaffold time.
- **Own your code:** Generated projects are plain Node/TypeScript — edit anything; there is no hidden runtime beyond normal dependencies.

## What’s Included?

Your environment will have everything you need to build a modern Express API:

- Express 5 + TypeScript
- MikroORM by default (or Sequelize / Prisma / TypeORM)
- PostgreSQL, MySQL, or SQLite
- Optional JWT auth (Passport + bcrypt)
- Optional production runtime: Docker (Dockerfile) or PM2
- Optional Docker Compose for DB/Redis
- Optional Redis + Socket.IO
- Migrations wired to `npm run db:migrate`
- Winston / express-winston logging
- ESLint + Prettier baseline

The tradeoff is that **these tools are preconfigured to work together**. You can change any of it after scaffold — it’s your project.

## Contributing

Issues and PRs are welcome in the [generate-express-ts-api](https://github.com/tonyphamvn/generate-express-ts-api) repository.

## Releasing

1. Bump `version` in `packages/generate-express-ts-api/package.json`.
2. Commit the change.
3. Tag and push:

```sh
git tag v0.0.5
git push origin v0.0.5
```

The [Release](../../.github/workflows/release.yml) workflow will:

- smoke-test the CLI
- publish `generate-express-ts-api` to npm
- create a GitHub Release with notes

Requires `NPM_TOKEN` (or npm Trusted Publishing configured for workflow file `release.yml`).

## License

MIT
