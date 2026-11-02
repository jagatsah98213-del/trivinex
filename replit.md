# Replit setup

## Run the app

The **Start application** workflow runs `pnpm dev`. It starts the API server on port
8080 and the Vite frontend on port 5000; the frontend proxies `/api` requests to the
API server.

Install workspace dependencies with `pnpm install --frozen-lockfile` if needed.

## Secrets and environment

Add credentials in Replit Secrets, not in source files:

- `NEON_DATABASE_URL`: Neon pooled PostgreSQL connection string. The app prefers
  this over Replit's `DATABASE_URL`.
- `SESSION_SECRET`: required for signed sessions.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: signed
  uploads from the admin Portfolio and Testimonials forms.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: SMTP delivery. `SMTP_FROM`
  and `ADMIN_EMAIL` are optional and default to `SMTP_USER`.
- `GEMINI_API_KEY`: server-side Gemini access. The default model is
  `gemini-3.8-flash`; optionally override it with `GEMINI_MODEL`.

## Database and first admin

For a new, empty Neon database, create the schema with
`pnpm --filter @workspace/db run push`, then populate starter services with
`pnpm --filter @workspace/api-server exec tsx src/scripts/seed.ts`.

The seed is idempotent and does not create sample testimonials or portfolio items.
To create an admin only when no admin exists, set `ADMIN_BOOTSTRAP_EMAIL` and
`ADMIN_BOOTSTRAP_PASSWORD`, then call `POST /api/admin/bootstrap` or run
`pnpm --filter @workspace/api-server exec tsx bootstrap-admin.ts`.

## Useful checks

- `GET /api/healthz` checks that the API server responds.
- Public forms store inquiries and bookings in PostgreSQL; email delivery requires
  the SMTP settings above.
- The admin Settings page can verify SMTP connectivity and send a test email.
- Gemini chat and Cloudinary upload credentials stay on the server; signed
  Cloudinary uploads are performed by the admin UI.
