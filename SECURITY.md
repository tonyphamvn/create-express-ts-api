# Security Policy

## Reporting a Vulnerability

**Do not** open a public GitHub issue for security vulnerabilities.

Please report security issues privately via one of the following:

1. **[GitHub Private Vulnerability Reporting](https://github.com/tonyphamvn/generate-express-ts-api/security/advisories/new)** (preferred)
2. Email the maintainers listed in the repository profile / `FUNDING.yml` contacts if private reporting is unavailable

Include as much detail as you can:

- Affected component (CLI package, API template, or both)
- Version or commit hash
- Steps to reproduce
- Impact (e.g., auth bypass, secret exposure, RCE)
- Suggested fix if you have one

You should receive an acknowledgment within **7 days**. After triage, we will:

1. Confirm whether the report is in scope
2. Work on a fix and coordinate disclosure
3. Credit you in the advisory or changelog if you want attribution

We ask that you give us a reasonable window (typically **90 days**) before public disclosure.

## Safe Defaults for Generated Apps

When deploying a scaffolded API:

- Replace all secrets in `.env` (`JWT_SECRET`, `BEARER`, DB/Redis passwords). Never use values from `.env.example` in production.
- Keep `.env` out of version control (it is gitignored by default).
- Use strong, unique `JWT_SECRET` values and rotate them when compromised.
- Prefer HTTPS / a reverse proxy in front of the Node process in production.
- Run `npm audit` (and apply fixes) after generation and on a regular schedule.
- Do not expose database or Redis ports publicly when using Docker Compose for local/dev only.

## Prefer Private Disclosure

Thank you for helping keep this project and the apps built with it safer.
