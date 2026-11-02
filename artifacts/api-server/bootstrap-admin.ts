import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const rawEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim();
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;

if (!rawEmail || !password) {
  throw new Error(
    "Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD before creating the initial admin.",
  );
}

const email = rawEmail.toLowerCase();
const bcrypt = await import("bcryptjs");
const passwordHash = await bcrypt.default.hash(password, 12);

const [existingAdmin] = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.role, "ADMIN"))
  .limit(1);

if (existingAdmin) {
  console.log("An admin account already exists; no account was created.");
  process.exit(0);
}

const [user] = await db
  .insert(usersTable)
  .values({ email, passwordHash, role: "ADMIN" })
  .returning();

console.log("Admin created:", { id: user.id, email: user.email, role: user.role });
process.exit(0);
