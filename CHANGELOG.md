## 0.0.5 (2026-07-16)

Generate Express TS API 0.0.5 fixes template download through `giget` and makes Express 5 type resolution work consistently across npm, Yarn, and pnpm.

# Migrating from 0.0.4 to 0.0.5

```bash
npx generate-express-ts-api@0.0.5 my-api
```

Or upgrade an existing global/local install:

```bash
npm install -g generate-express-ts-api@0.0.5
```

#### 🐛 Fix

- Fix `--provider giget` so `tonyphamvn/generate-express-ts-api` is treated as a GitHub repository, not a `giget` registry template.
- Disable `giget` registry lookup for direct GitHub template downloads.
- Add Yarn `resolutions` for Express 5 type packages in generated projects.
- Add pnpm v11-compatible overrides to `pnpm-workspace.yaml`.
- Keep npm `overrides` for Express 5 type packages in generated projects.
- Fix `express-validation` type conflicts with Express 5 across npm, Yarn, and pnpm installs.

#### 📝 Documentation

- Document `--provider giget` usage in README examples.
- Document package-manager-specific type override behavior.
- Update release instructions to `v0.0.5`.

#### 🏠 Internal

- Bump package version to `0.0.5`.
- Update package lock files.

#### Committers: 1

- tonypham (@tonyphamvn)

## 0.0.4 (2026-07-16)

Generate Express TS API 0.0.4 fixes Express 5 type compatibility in generated projects and updates README documentation for the current folder structure.

# Migrating from 0.0.3 to 0.0.4

```bash
npx generate-express-ts-api@0.0.4 my-api
```

Or upgrade an existing global/local install:

```bash
npm install -g generate-express-ts-api@0.0.4
```

#### 🐛 Fix

- Add Express type overrides to generated `package.json`:
  - `@types/express`
  - `@types/express-serve-static-core`
- Fix TypeScript overload errors caused by `express-validation` pulling Express 4 types while the template uses Express 5.

#### 📝 Documentation

- Update root README folder structure to match the current template:
  - `bootstrap`
  - `infrastructure`
  - `modules`
  - `shared`
  - `scripts`
  - `tests`
- Update package README with the same current project structure.
- Clarify `npm start` behavior:
  - default runs the compiled app from `dist`
  - PM2 runtime is used only when generated with `--deploy pm2`

#### 🏠 Internal

- Bump package version to `0.0.4`.
- Update package lock files.

#### Committers: 1

- tonypham (@tonyphamvn)

## 0.0.3 (2026-07-16)

Generate Express TS API 0.0.3 focuses on restructuring the project template, standardizing database configuration names, and adding GitHub community metadata.

# Migrating from 0.0.2 to 0.0.3

```bash
npx generate-express-ts-api@0.0.3 my-api
```

Or upgrade an existing global/local install:

```bash
npm install -g generate-express-ts-api@0.0.3
```

#### 💅 Enhancement

- Refactor source layout:
  - `src/app.ts` -> `src/bootstrap/app.ts`
  - `src/routes/index.ts` -> `src/bootstrap/routes.ts`
  - Add `src/bootstrap/index.ts`
  - Move `src/libs/*` -> `src/infrastructure/*`
  - Move database entities/migrations -> `src/infrastructure/database/*`
  - Move middlewares and shared types under `src/shared`
- Rename route files for cleaner module conventions:
  - `auth.routes.ts` -> `routes.ts`
  - `users.routes.ts` -> `routes.ts`
- Split module-level DTO/schema files:
  - Add `src/modules/auth/auth.dto.ts`
  - Rename `auth.validation.ts` -> `auth.schema.ts`
  - Move `user.types.ts` -> `src/modules/users/users.dto.ts`
- Refactor `AuthService` with dedicated `findByEmail` and `createUser` helpers.
- Replace server listen `console.log` with `logger.info`.

#### 🐛 Fix

- Standardize database environment variables:
  - Use `DB_MAIN_NAME`
  - Use `DB_TEST_NAME`
  - Remove legacy `DB_NAME_DEV`, `DB_NAME_TEST`, `DB_NAME_PROD` usage
- Update Docker Compose:
  - Move init script reference to `src/scripts/initdb.sh`
  - Use `DB_MAIN_NAME` in Postgres healthcheck
- Update MikroORM config and migration paths for the new `src/infrastructure/database` layout.
- Update Sequelize CLI template to use the new database env names.
- Update CLI feature-removal logic for auth, redis, and ORM paths.

#### 📝 Documentation / Community

- Add `.github/FUNDING.yml`.
- Add GitHub issue templates:
  - Bug report
  - Proposal
  - Question
- Update `CHANGELOG.md` for version `0.0.2`.

#### 🏠 Internal

- Bump package version to `0.0.3`.
- Update package lock files.
- Update `.gitignore` and `tsconfig.json` for the new folder structure.

#### Committers: 1

- tonypham (@tonyphamvn)

## 0.0.2 (2026-07-13)

Generate Express TS API 0.0.2 upgrades the template to Express 5, adds a `--deploy` runtime choice (Docker / PM2 / none), and refactors Socket.IO behind a dedicated Redis-backed module.

# Migrating from 0.0.1 to 0.0.2

```bash
npx generate-express-ts-api@0.0.2 my-api
```

Or upgrade an existing global/local install:

```bash
npm install -g generate-express-ts-api@0.0.2
```

- CLI: prefer `--deploy <mode>`; `--docker` / `--no-docker` still work as aliases (`docker` / `none`)
- Template apps: bump `express` + `@types/express` to **5.x**; remove `body-parser` (use `express.json()` / `express.urlencoded()`)
- Socket.IO: move inline setup → `src/libs/socket.ts`; call `initSocket(httpServer)` / `getIO()`; drop `@socket.io/redis-emitter` if unused
- Scripts: default `start` is `node dist/index.js` (PM2 only when `--deploy pm2`); replace `clean` with `prebuild` (`rm -rf dist`)
- Types: add `@types/express-serve-static-core` 5.x (and npm `overrides` if needed) to avoid Express 4/5 type clashes

#### 🚀 New Feature

- `generate-express-ts-api`
  - Add `--deploy` option: `docker` (default) | `pm2` | `none`
  - Keep `--docker` / `--no-docker` / `--pm2` as aliases
  - Prompt: “Production runtime” (Docker / PM2 / Neither)
  - PM2: write `ecosystem.config.cjs`, `start` via `pm2-runtime`; keep compose for DB/Redis, drop Dockerfile
- Template API
  - Upgrade Express **4 → 5.2** (`@types/express` 5.x); drop `body-parser`
  - Move Socket.IO to `src/libs/socket.ts` with Redis adapter + `initSocket` / `getIO`
  - Tune Dockerfile / `.dockerignore` for deploy modes

#### 💅 Enhancement

- Clearer post-scaffold messaging (`Done. Created …` + next steps)
- Use `prebuild` to clean `dist` instead of a separate `clean` script

#### 📝 Documentation

- Update package README for `--deploy` / PM2 and Express 5

#### 🏠 Internal

- Add `packages/generate-express-ts-api/lib/features/deploy.js`
- Bump package version to `0.0.2`

#### Committers: 1

- tonypham (@tonyphamvn)

## 0.0.1 (2026-07-10)

First ship **generate-express-ts-api**: Express + TypeScript + Sequelize template + CLI scaffold.

```bash
npx generate-express-ts-api@0.0.1 my-api
```

#### 🚀 New Feature

- `generate-express-ts-api`
  - Scaffold Express + TypeScript from template
  - Interactive prompts via `@clack/prompts`, or `--yes` for defaults
  - Options: `--database` (`postgres` | `mysql` | `sqlite`), `--jwt` / `--no-jwt`, `--docker` / `--no-docker`, `--redis` / `--no-redis`, `--git` / `--no-git`, `--package-manager`, `--provider` (`degit` | `giget`), `--template`, `--local`
- Template API
  - Express + TypeScript + Sequelize (Postgres default)
  - JWT auth (Passport JWT) + login flow
  - Users module, Winston logging, validation, error handling
  - Docker / docker-compose
  - Optional Redis + Socket.IO

#### 🏠 Internal

- Add `packages/create-express-app` CLI package
- Add `.github/workflows/publish-create-express-ts-app.yml` (npm publish on `v*` tags)
- Fix tag version extract → publish verify `package.json` match git tag

#### Committers: 1

- tonypham (@tonyphamvn)
