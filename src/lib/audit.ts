import { query } from "./db";

export async function auditLog(params: {
  userId?: number;
  action: string;
  entity: string;
  entityId?: number;
  oldData?: unknown;
  newData?: unknown;
  ip?: string;
}) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id,action,entity,entity_id,old_data,new_data,ip)
       VALUES (?,?,?,?,?,?,?)`,
      [
        params.userId ?? null,
        params.action,
        params.entity,
        params.entityId ?? null,
        params.oldData ? JSON.stringify(params.oldData) : null,
        params.newData ? JSON.stringify(params.newData) : null,
        params.ip ?? null,
      ]
    );
  } catch {
    // Audit errors should never break the main flow
  }
}
