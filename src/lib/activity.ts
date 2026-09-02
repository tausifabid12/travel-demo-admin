import ActivityLog from "@/lib/models/ActivityLog";
import type { SessionUser } from "@/lib/auth";

type Action = "created" | "updated" | "deleted" | "published" | "duplicated";

/** Fire-and-forget audit entry. Never let logging break the request. */
export async function logActivity(
  user: SessionUser | null,
  action: Action,
  entityType: string,
  entity?: { _id?: unknown; title?: string; name?: string; jobTitle?: string; clientName?: string },
) {
  try {
    await ActivityLog.create({
      actorId: user?.id,
      actorName: user?.name ?? "System",
      action,
      entityType,
      entityId: entity?._id ? String(entity._id) : undefined,
      entityLabel:
        entity?.title ?? entity?.name ?? entity?.jobTitle ?? entity?.clientName,
    });
  } catch (err) {
    console.error("activity log failed", err);
  }
}
