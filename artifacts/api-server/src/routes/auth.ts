import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { rateLimit } from "express-rate-limit";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { LoginBody, LoginResponse, GetCurrentUserResponse } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { ensureCsrfToken } from "../lib/session";

const router: IRouter = Router();
const isProd = process.env["NODE_ENV"] === "production";

// Strict rate limit for auth endpoints: 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts — please try again later." },
  skipSuccessfulRequests: true,
});

router.post("/auth/login", authLimiter, async (req, res) => {
  const body = LoginBody.parse(req.body);

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, body.email.toLowerCase()));

  if (!user) {
    // Generic failure message — never reveal whether the email exists
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  if (user.role !== "ADMIN") {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  req.session.userId = user.id;
  req.session.role = user.role;
  req.session.employeeId = undefined;
  const csrfToken = ensureCsrfToken(req);

  await new Promise<void>((resolve, reject) => {
    req.session.save((err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // Set non-httpOnly CSRF token cookie so the frontend can send it as X-XSRF-TOKEN header
  res.cookie("XSRF-TOKEN", csrfToken, {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  res.json(
    LoginResponse.parse({ id: user.id, email: user.email, role: user.role, employeeId: undefined }),
  );
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("trivinex.sid");
    res.status(204).end();
  });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!));
  if (!user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  res.json(
    GetCurrentUserResponse.parse({
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: req.session.employeeId,
    }),
  );
});

export default router;
