import { db, auditLogsTable } from "@workspace/db";

export async function recordAuditLog(
  actorId: string,
  action: string,
  metadata?: Record<string, unknown>,
) {
  await db.insert(auditLogsTable).values({ actorId, action, metadata });
}
