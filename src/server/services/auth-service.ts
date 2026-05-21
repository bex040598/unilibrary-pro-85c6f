import crypto from "node:crypto";

import { AppError } from "@/lib/errors/app-error";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { userRepository } from "@/server/repositories/user-repository";
import { writeAuditLog, writeSecurityLog } from "@/server/services/audit-service";
import { createNotifications } from "@/server/services/notification-service";

export async function registerUser(input: {
  fullName: string;
  email: string;
  password: string;
  role: string;
  facultyId?: string;
  departmentId?: string;
}) {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) {
    throw new AppError("CONFLICT", "Bu email allaqachon ro'yxatdan o'tgan", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      role: input.role,
      facultyId: input.facultyId,
      departmentId: input.departmentId,
      status: "ACTIVE"
    }
  });

  await writeAuditLog({
    userId: user.id,
    action: "REGISTER",
    entity: "User",
    entityId: user.id,
    newValue: { email: user.email, role: user.role }
  });

  return user;
}

export async function loginUser(input: { email: string; password: string; ipAddress?: string | null; userAgent?: string | null }) {
  const user = await userRepository.findByEmail(input.email);
  const isValid = user ? await verifyPassword(input.password, user.passwordHash) : false;

  if (!user || !isValid) {
    await writeSecurityLog({
      userId: user?.id,
      event: "LOGIN_FAILED",
      severity: "MEDIUM",
      metadata: { email: input.email },
      ipAddress: input.ipAddress,
      userAgent: input.userAgent
    });
    throw new AppError("UNAUTHORIZED", "Email yoki parol noto'g'ri", 401);
  }

  if (user.status !== "ACTIVE") {
    await writeSecurityLog({
      userId: user.id,
      event: "BLOCKED_LOGIN_ATTEMPT",
      severity: "HIGH",
      metadata: { status: user.status },
      ipAddress: input.ipAddress,
      userAgent: input.userAgent
    });

    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
        status: "ACTIVE"
      }
    });

    await createNotifications(
      admins.map((admin) => ({
        userId: admin.id,
        type: "SECURITY_ALERT",
        title: "Blocked login attempt",
        message: `${user.email} akkauntiga bloklangan login urinish qayd etildi.`,
        actionUrl: "/uz/admin/security",
        priority: "HIGH",
        dedupeHours: 2
      }))
    );

    throw new AppError("FORBIDDEN", "Akkaunt bloklangan yoki faol emas", 403);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  await writeAuditLog({
    userId: user.id,
    action: "LOGIN",
    entity: "User",
    entityId: user.id,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent
  });

  return user;
}

export async function changePassword(userId: string, input: { currentPassword: string; newPassword: string }) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError("NOT_FOUND", "User not found", 404);
  }

  const matches = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!matches) {
    throw new AppError("UNAUTHORIZED", "Joriy parol noto'g'ri", 401);
  }

  const newPasswordHash = await hashPassword(input.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newPasswordHash }
  });

  await writeAuditLog({
    userId,
    action: "CHANGE_PASSWORD",
    entity: "User",
    entityId: userId
  });
}

export async function requestPasswordReset(email: string) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    return { message: "Agar akkaunt mavjud bo'lsa, tiklash ko'rsatmalari yaratildi." };
  }

  const token = crypto.randomUUID();
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt
    }
  });

  await writeSecurityLog({
    userId: user.id,
    event: "PASSWORD_RESET_REQUESTED",
    severity: "LOW",
    metadata: { expiresAt: expiresAt.toISOString() }
  });

  return {
    message: "Development rejimi uchun tiklash tokeni yaratildi.",
    resetToken: process.env.NODE_ENV === "production" ? undefined : token
  };
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new AppError("UNAUTHORIZED", "Tiklash tokeni noto'g'ri yoki muddati tugagan", 401);
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash }
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() }
    })
  ]);

  await writeAuditLog({
    userId: record.userId,
    action: "RESET_PASSWORD",
    entity: "User",
    entityId: record.userId
  });
}
