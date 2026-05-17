import { prisma } from "@/lib/db/prisma";

type AuditInput = {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
};

type SecurityInput = {
  userId?: string | null;
  event: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  metadata?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function writeAuditLog(input: AuditInput) {
  await prisma.auditLog.create({
    data: {
      userId: input.userId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      oldValue: input.oldValue ? JSON.stringify(input.oldValue) : null,
      newValue: input.newValue ? JSON.stringify(input.newValue) : null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null
    }
  });
}

export async function writeSecurityLog(input: SecurityInput) {
  await prisma.securityLog.create({
    data: {
      userId: input.userId ?? null,
      event: input.event,
      severity: input.severity,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null
    }
  });
}
