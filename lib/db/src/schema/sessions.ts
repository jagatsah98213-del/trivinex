import { pgTable, varchar, json, timestamp, index } from "drizzle-orm/pg-core";

// Session store table for connect-pg-simple.
export const sessionsTable = pgTable(
  "session",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire", { withTimezone: false }).notNull(),
  },
  (table) => [index("idx_session_expire").on(table.expire)],
);
