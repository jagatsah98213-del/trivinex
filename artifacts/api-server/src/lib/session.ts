import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";
import crypto from "crypto";

const PgSession = connectPgSimple(session);

if (!process.env["SESSION_SECRET"]) {
  throw new Error("SESSION_SECRET environment variable is required but was not provided.");
}

const isProd = process.env["NODE_ENV"] === "production";

export const sessionMiddleware = session({
  store: new PgSession({
    pool,
    tableName: "session",
    createTableIfMissing: false,
  }),
  secret: process.env["SESSION_SECRET"],
  resave: false,
  saveUninitialized: false,
  name: "trivinex.sid",
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
});

declare module "express-session" {
  interface SessionData {
    userId?: number;
    role?: "ADMIN" | "EMPLOYEE";
    employeeId?: number;
    csrfToken?: string;
  }
}

/** Generate a CSRF token and store it in the session. */
export function ensureCsrfToken(req: any): string {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  return req.session.csrfToken;
}

/** Validate a CSRF token supplied by the client against the session. */
export function validateCsrfToken(req: any, token: string | undefined): boolean {
  if (!token) return false;
  const expected = req.session.csrfToken;
  if (!expected) return false;
  return token === expected;
}
