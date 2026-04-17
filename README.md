# Voodoo Vape

Bootstrap for a single Next.js application that contains the storefront and the admin panel.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Prisma
- Auth.js credentials flow

## Local Run

1. Install dependencies:

```bash
npm install
```

2. Create local environment file:

```bash
cp .env.example .env.local
```

3. Make sure local PostgreSQL is running and matches `DATABASE_URL` from `.env` or `.env.local`.

4. Generate Prisma client:

```bash
npm run prisma:generate
```

5. Start the dev server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000).

## Project Structure

- `src/app` for routes, layouts, route groups, metadata files, and API route handlers.
- `src/components` for UI primitives and reusable presentation components.
- `src/features` for domain-oriented feature modules.
- `src/server` for repositories, services, and server-side business logic.
- `src/lib` for cross-cutting technical helpers.
- `prisma` for schema, migrations, and seed files.

Detailed structure is documented in `docs/project-structure.md`.

## Tooling

- `npm run lint` validates code style and Next.js rules.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run build` verifies the production build.
- `npm run format` formats the codebase with Prettier.
