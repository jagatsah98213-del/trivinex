import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { sessionMiddleware } from "./lib/session";
import { requireCsrf } from "./lib/auth";

const app: Express = express();
const isProd = process.env["NODE_ENV"] === "production";

// ─── Trust proxy (Railway reverse proxy) ────────────────────────────────────
app.set("trust proxy", 1);

// ─── Security headers ────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: isProd
      ? { maxAge: 63_072_000, includeSubDomains: true, preload: true }
      : false,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    dnsPrefetchControl: { allow: false },
  }),
);

// ─── Additional security headers ─────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  next();
});

// ─── CORS ────────────────────────────────────────────────────────────────────
const rawOrigins = process.env["ALLOWED_ORIGINS"] ?? "";
const allowedOrigins = rawOrigins
  ? rawOrigins.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

const allowAll =
  rawOrigins.length === 0 ||
  rawOrigins.includes("*") ||
  allowedOrigins.some((o) => o === "*");

app.use(
  cors({
    origin: allowAll
      ? true
      : (origin, cb) => {
          if (!origin) { cb(null, true); return; }

          const host = origin.replace(/^https?:\/\//, "").replace(/:\d+$/, "");

          const allowed =
            allowedOrigins.some((o) => {
              const oHost = o.replace(/^https?:\/\//, "").replace(/:\d+$/, "");
              return origin === o || host === oHost;
            }) ||
            host.endsWith(".vercel.app") ||
            host.endsWith(".replit.dev") ||
            host.endsWith(".replit.app") ||
            host.endsWith(".railway.app") ||
            host.endsWith(".neon.tech") ||
            host === "localhost" ||
            host === "127.0.0.1";

          if (allowed) {
            cb(null, true);
          } else {
            cb(new Error(`CORS: origin ${origin} not allowed`));
          }
        },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token", "X-XSRF-TOKEN"],
    exposedHeaders: ["Content-Type", "X-XSRF-TOKEN"],
  }),
);

// ─── Rate limiter (global) ───────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 60_000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests — please slow down." },
});
app.use(globalLimiter);

// ─── Logging ─────────────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// ─── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// ─── Session ─────────────────────────────────────────────────────────────────
app.use(sessionMiddleware);

// ─── CSRF protection for state-changing routes ───────────────────────────────
// CSRF is enforced inside route handlers via requireCsrf() to avoid breaking
// stateless public endpoints. Admin mutating routes call requireCsrf explicitly.

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api", router);

// ─── 404 catch-all (for API routes) ──────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Not found" });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : "Internal server error";
  // Never leak stack traces, env, or SQL details to the client.
  logger.error({ err }, message);
  res.status(500).json({ message });
});

export default app;
