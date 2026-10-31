import type { Request, Response, NextFunction } from "express";
import { validateCsrfToken } from "./session";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  next();
}

export function requireRole(role: "ADMIN") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    if (req.session.role !== role) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    next();
  };
}

/** CSRF protection for cookie-authenticated state-changing requests. */
export function requireCsrf(req: Request, res: Response, next: NextFunction) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    next();
    return;
  }
  const token = req.headers["x-xsrf-token"] as string | undefined;
  if (!validateCsrfToken(req as any, token)) {
    res.status(403).json({ message: "Invalid or missing CSRF token" });
    return;
  }
  next();
}

/** Provide the current CSRF token to the client (for GET /auth/csrf-token). */
export function provideCsrfToken(req: Request, res: Response) {
  const token = (req as any).session.csrfToken;
  if (!token) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  res.json({ csrfToken: token });
}
