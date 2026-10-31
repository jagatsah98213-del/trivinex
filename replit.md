# Trivenix Partners — Digital Services Company Website

A client-facing digital services company website. Clients browse eight service divisions, submit inquiries, book consultations, and view portfolio/testimonials. Admins manage everything through a secure, cookie-authenticated portal.

## Architecture

| Layer | Package | Tech |
|---|---|---|
| Frontend | `@workspace/craftloop` (`artifacts/craftloop/`) | React 19, Vite, Tailwind, shadcn/ui, Framer Motion, Wouter, TanStack Query |
| API Server | `@workspace/api-server` (`artifacts/api-server/`) | Express 5, Zod, Nodemailer, pino, PostgreSQL sessions |
| Database | `@workspace/db` (`lib/db/`) | Drizzle ORM → Neon PostgreSQL |
| API types/hooks | `@workspace/api-zod`, `@workspace/api-client-react` | Generated from `lib/api-spec/openapi.yaml` via orval |

## Running the App

```bash
# Install dependencies
pnpm install

# Typecheck
pnpm run typecheck

# Build all
pnpm run build:all

# Start API server (requires PORT and DATABASE_URL)
PORT=8080 DATABASE_URL=... SESSION_SECRET=... pnpm --filter @workspace/api-server run start

# Frontend dev (requires API at localhost:8080)
pnpm --filter @workspace/craftloop run dev
```

## Environment Variables

See `.env.example` for the full list with placeholders. Key variables:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL pooled connection string |
| `SESSION_SECRET` | Express session signing key (`openssl rand -hex 32`) |
| `ADMIN_BOOTSTRAP_EMAIL` | First admin email (one-time bootstrap) |
| `ADMIN_BOOTSTRAP_PASSWORD` | First admin password (one-time bootstrap) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `SMTP_HOST/PORT/USER/PASS/FROM` | Gmail SMTP (App Password) |
| `ADMIN_EMAIL` | Destination for inquiry notifications |
| `GEMINI_API_KEY` | Google Gemini API key (server-only) |
| `GEMINI_MODEL` | Gemini model name (e.g. gemini-1.5-flash) |
| `CLOUDINARY_*` | Optional: media upload storage |

## Admin Access

Admin authentication is cookie-based with CSRF protection. There is **no** `?key=` URL parameter and **no** `VITE_ADMIN_KEY`.

1. Set `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` env vars
2. Call `POST /api/admin/bootstrap` to create the first admin account
3. Log in at `/admin/login` with email + password
4. Unset/remove bootstrap env vars after first login

## Database

```bash
# Push schema changes to Neon
pnpm --filter @workspace/db run push

# Seed initial data (idempotent — safe to re-run)
pnpm --filter @workspace/api-server exec tsx src/scripts/seed.ts
```

## Code Generation

`lib/api-spec/openapi.yaml` is the source of truth. Do **not** edit generated files directly. To regenerate:

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Public Routes

| Route | Page |
|---|---|
| `/` | Home |
| `/services` | Eight service divisions |
| `/services/:slug` | Service detail + plans |
| `/portfolio` | Portfolio / case studies |
| `/testimonials` | Client testimonials (text + video) |
| `/quote` | Inquiry / request a quote |
| `/consultation` | Book a free consultation |
| `/about` | About Trivenix Partners |
| `/privacy-policy` | Privacy policy |
| `/terms` | Service terms |

## Admin Routes (authenticated only)

| Route | Page |
|---|---|
| `/admin/login` | Admin sign-in |
| `/admin` | Dashboard |
| `/admin/inquiries` | Client inquiries |
| `/admin/consultations` | Meeting slots & bookings |
| `/admin/projects` | Internal project tracking |
| `/admin/services` | Service divisions |
| `/admin/service-plans` | Service sub-plans |
| `/admin/portfolio` | Portfolio items |
| `/admin/testimonials` | Testimonials |
| `/admin/site-content` | Site settings |
| `/admin/settings` | Email & security settings |
| `/admin/audit-log` | Audit trail |

## Explicitly NOT included

- No public Careers/Freelancers/Applicants/Employee portal
- No public client signup/login
- No payment portal
- No `ADMIN_ACCESS_KEY` / `VITE_ADMIN_KEY` / `?key=` login
- No default seeded admin password
- No Craftloop branding

## Deployment

- API: Railway (`railway.toml`, `railpack.json`)
- Frontend: Vercel (`vercel.json` in `artifacts/craftloop/`)
- Database: Neon PostgreSQL
