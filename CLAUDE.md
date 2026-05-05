# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Saiya Gym is a local-first gym management app: React + Vite + Tailwind v4 frontend talking to a local Supabase (PostgreSQL on Docker) backend via the `@supabase/supabase-js` client. The project is in Spanish — table names, columns, UI strings, comments, and commits are written in Spanish. Match that convention.

## Commands

Frontend (Vite):
- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run lint` — ESLint with `--max-warnings 0` (treat warnings as errors)

Database (Supabase CLI on Docker). The `db:*` scripts in `package.json` are the **single source of truth** — never invoke raw `supabase` or `docker` commands when a script exists:
- `npm run db:start` / `db:stop` / `db:restart` — manage local stack
- `npm run db:status` — first thing to run when DB connection fails
- `npm run db:pull` — pull remote schema into a local migration
- `npm run db:push` — apply local migrations to the linked remote
- `npm run db:diff` — generate a new migration named `nueva_migracion` from current local diffs (rename the file after)

There is no test runner configured.

## Architecture

**Frontend wiring.** `src/supabase.js` is the single Supabase client, instantiated from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` in `.env.local` (defaults point at local stack on `127.0.0.1:54321`). Components import this client directly and call `supabase.from(...).select(...)` inside `useEffect` — there is no data layer, no fetch hooks, no global state. Loading/error state is per-component.

**Supabase relational selects.** `ListaPersonas.jsx` is the canonical example of nested PostgREST selects: it pulls `personas` joined with `genero(...)` and `medios_contacto(...)` in one query. When adding new screens that need joined data, prefer this pattern over multiple round-trips.

**Database schema.** `supabase/DB_SCHEMA.md` is the maintained data dictionary — read it before designing queries or migrations. The schema follows a `personas` → (`clientes` | `empleados`) inheritance pattern: `personas` holds shared identity fields, and `clientes` / `empleados` extend it with domain-specific columns sharing the same id. `medios_contacto` is unified across `personas` and `proveedor` (one of the two FKs is set per row). Catalog tables (`genero`, `tipo_contrato`, `tipo_incidencia`, `puesto`) are referenced by id; never inline these values.

**Migrations.** All schema lives in `supabase/migrations/` as timestamped SQL files. The current snapshot is a single `*_remote_schema.sql` pulled from the remote. Never edit applied migrations — generate a new one with `npm run db:diff` and rename it descriptively. `supabase/seed.sql` populates demo data on `db:start`.

## Project Conventions

- **Spanish identifiers everywhere.** Table/column names use Spanish (`id_persona`, `apellido_paterno`, `medios_contacto`). UI copy and console logs are also Spanish. Don't translate when adding new code — match the surrounding style.
- **Conventional Commits in Spanish imperative**, e.g. `feat: implement UI components for membership tiers...`. Allowed types: `feat`, `fix`, `chore`, `docs`, `refactor`.
- **Tailwind v4** is loaded via `@tailwindcss/vite` (no `tailwind.config.js`); utility classes are used inline. Dark-mode variants (`dark:...`) are applied throughout.
- **No TypeScript** — plain `.jsx`. ESLint is configured for React Hooks + React Refresh; the lint script fails on any warning.

## Agent Skills (`.agents/skills/`)

The repo defines six role-based skills. **They are not Claude Code subagents** — the user invokes them from the Antigravity editor with Gemini for testing. They live as plain `SKILL.md` files and follow a unified structure: `Misión` / `Activación` / `Contexto que debo leer primero` / `Reglas` / `Formato de respuesta` / `Prohibido`.

- **arquitecto** — designs SQL migrations (UUID PKs, español snake_case); must wait for `guardian` approval before emitting SQL.
- **guardian** — gatekeeper for schema changes; enforces reuse of existing tables and 3NF. Reads `supabase/DB_SCHEMA.md` and the latest migration first.
- **sembrador** — generates `supabase/seed.sql` data; respects FK insertion order and uses `ON CONFLICT DO NOTHING` for idempotency.
- **operador** — runs the `db:*` lifecycle scripts; never touches raw `docker`/`supabase`.
- **auditor** — diagnoses errors from Vite + Supabase logs in a strict `Causa Raíz / Solución / Código` format.
- **escriba** — writes Conventional Commits and PR bodies; output only the text destined for git, no preamble.

> **Note on RLS:** This is a school project that stays local-only. The agents intentionally do **not** require Row Level Security policies. Do not add RLS recommendations.

`SYSTEM_PROMPT.md` reinforces the project mindset (direct, modular, `db:*` scripts as source of truth) and is worth re-reading when in doubt.
