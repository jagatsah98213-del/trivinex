import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const email = (process.env.ADMIN_BOOTSTRAP_EMAIL || "admin@trivinex.app").toLowerCase();
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || "9898";

const bcrypt = await import("bcryptjs");
const passwordHash = await bcrypt.default.hash(password, 10);

const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
if (existing) {
  console.log("Admin already exists:", existing.email);
  process.exit(0);
}

const [user] = await db.insert(usersTable).values({
  email,
  passwordHash,
  role: "ADMIN",
}).returning();

console.log("Admin created:", { id: user.id, email: user.email, role: user.role });
process.exit(0);
