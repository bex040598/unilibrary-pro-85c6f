import type { User } from "@prisma/client";

import { AppError } from "@/lib/errors/app-error";
import { prisma } from "@/lib/db/prisma";
import { assertTransition, loanTransitions } from "@/lib/permissions/transitions";
import { loanRepository } from "@/server/repositories/loan-repository";
import { writeAuditLog } from "@/server/services/audit-service";
import { createLoanAlerts, createNotification, createNotifications } from "@/server/services/notification-service";

function computeOverdueStatus(dueAt: Date, currentStatus: string) {
  if (["RETURNED", "LOST"].includes(currentStatus)) {
    return currentStatus;
  }

  return dueAt < new Date() ? "OVERDUE" : currentStatus;
}

export async function listMyLoans(userId: string) {
  const loans = await loanRepository.listByUser(userId);
  await createLoanAlerts(userId);
  return Promise.all(
    loans.map(async (loan) => {
      const status = computeOverdueStatus(loan.dueAt, loan.status);
      if (status !== loan.status) {
        await prisma.loan.update({
          where: { id: loan.id },
          data: { status }
        });
      }
      return { ...loan, status };
    })
  );
}

export async function listAllLoans() {
  return loanRepository.listAll();
}

export async function issueLoan(user: User, input: { userId: string; resourceId: string; copyId: string; dueAt: Date }) {
  if (!["LIBRARIAN", "ADMIN"].includes(user.role)) {
    throw new AppError("FORBIDDEN", "Only librarians can issue direct loans", 403);
  }

  const copy = await prisma.bookCopy.findUnique({ where: { id: input.copyId } });
  if (!copy || copy.status !== "AVAILABLE") {
    throw new AppError("COPY_NOT_AVAILABLE", "Selected copy is not available", 409);
  }

  const loan = await prisma.$transaction(async (tx) => {
    const created = await tx.loan.create({
      data: {
        userId: input.userId,
        resourceId: input.resourceId,
        copyId: input.copyId,
        dueAt: input.dueAt
      }
    });

    await tx.bookCopy.update({
      where: { id: input.copyId },
      data: { status: "BORROWED" }
    });

    return created;
  });

  await writeAuditLog({
    userId: user.id,
    action: "ISSUE_LOAN",
    entity: "Loan",
    entityId: loan.id,
    newValue: { copyId: input.copyId }
  });

  await createNotification({
    userId: input.userId,
    type: "LOAN_ISSUED",
    title: "Loan issued",
    message: "Siz uchun yangi loan yaratildi.",
    actionUrl: "/uz/cabinet/loans",
    priority: "NORMAL"
  });

  return loan;
}

export async function returnLoan(user: User, loanId: string) {
  if (!["LIBRARIAN", "ADMIN"].includes(user.role)) {
    throw new AppError("FORBIDDEN", "Only librarians can return loans", 403);
  }

  const loan = await loanRepository.findById(loanId);
  if (!loan) {
    throw new AppError("NOT_FOUND", "Loan not found", 404);
  }

  if (loan.status === "RETURNED") {
    throw new AppError("LOAN_ALREADY_RETURNED", "Loan has already been returned", 409);
  }

  assertTransition(loan.status, "RETURNED", loanTransitions);

  const result = await prisma.$transaction(async (tx) => {
    const updatedLoan = await tx.loan.update({
      where: { id: loanId },
      data: {
        status: "RETURNED",
        returnedAt: new Date()
      }
    });

    await tx.bookCopy.update({
      where: { id: loan.copyId },
      data: { status: "AVAILABLE" }
    });

    return updatedLoan;
  });

  await writeAuditLog({
    userId: user.id,
    action: "RETURN_LOAN",
    entity: "Loan",
    entityId: loanId
  });

  await createNotification({
    userId: loan.userId,
    type: "LOAN_RETURNED",
    title: "Loan returned",
    message: "Loan muvaffaqiyatli yopildi va nusxa available holatiga qaytdi.",
    actionUrl: "/uz/cabinet/history",
    priority: "LOW"
  });

  return result;
}

export async function requestRenewal(user: User, loanId: string, requestedDueAt: Date) {
  const loan = await loanRepository.findById(loanId);
  if (!loan) {
    throw new AppError("NOT_FOUND", "Loan not found", 404);
  }

  if (loan.userId !== user.id && !["LIBRARIAN", "ADMIN"].includes(user.role)) {
    throw new AppError("FORBIDDEN", "You cannot renew this loan", 403);
  }

  const renewal = await prisma.renewalRequest.create({
    data: {
      loanId,
      userId: loan.userId,
      requestedDueAt
    }
  });

  await createNotification({
    userId: loan.userId,
    type: "RENEWAL_REQUEST_CREATED",
    title: "Renewal requested",
    message: "Loan renewal so'rovi yuborildi.",
    actionUrl: "/uz/cabinet/renewals",
    priority: "NORMAL"
  });

  const staff = await prisma.user.findMany({
    where: {
      role: {
        in: ["LIBRARIAN", "ADMIN"]
      },
      status: "ACTIVE"
    }
  });

  await createNotifications(
    staff.map((member) => ({
      userId: member.id,
      type: "RENEWAL_PENDING",
      title: "Renewal review required",
      message: "Yangi renewal request kutubxonachi ko'rib chiqishini kutmoqda.",
      actionUrl: "/uz/librarian/renewals",
      priority: "NORMAL"
    }))
  );

  return renewal;
}

export async function reviewRenewal(user: User, loanId: string, approve: boolean, librarianNote?: string) {
  if (!["LIBRARIAN", "ADMIN"].includes(user.role)) {
    throw new AppError("FORBIDDEN", "Only librarians can review renewals", 403);
  }

  const renewal = await prisma.renewalRequest.findFirst({
    where: {
      loanId,
      status: "PENDING"
    },
    orderBy: { createdAt: "desc" }
  });

  if (!renewal) {
    throw new AppError("NOT_FOUND", "Renewal request not found", 404);
  }

  const status = approve ? "APPROVED" : "REJECTED";

  const result = await prisma.$transaction(async (tx) => {
    const updatedRenewal = await tx.renewalRequest.update({
      where: { id: renewal.id },
      data: { status, librarianNote }
    });

    if (approve) {
      await tx.loan.update({
        where: { id: loanId },
        data: {
          dueAt: renewal.requestedDueAt,
          status: "EXTENDED",
          renewalCount: {
            increment: 1
          }
        }
      });
    }

    return updatedRenewal;
  });

  await createNotification({
    userId: renewal.userId,
    type: approve ? "RENEWAL_APPROVED" : "RENEWAL_REJECTED",
    title: approve ? "Renewal approved" : "Renewal rejected",
    message: approve
      ? "Loan renewal so'rovi tasdiqlandi."
      : "Loan renewal so'rovi rad etildi.",
    actionUrl: "/uz/cabinet/renewals",
    priority: approve ? "NORMAL" : "HIGH"
  });

  return result;
}

export async function listOverdueLoans() {
  const loans = await prisma.loan.findMany({
    where: {
      status: {
        in: ["ACTIVE", "EXTENDED", "OVERDUE"]
      },
      dueAt: {
        lt: new Date()
      }
    },
    include: {
      user: true,
      resource: true,
      copy: true
    }
  });

  for (const loan of loans) {
    if (loan.status !== "OVERDUE") {
      await prisma.loan.update({
        where: { id: loan.id },
        data: { status: "OVERDUE" }
      });
    }
  }

  return loans.map((loan) => ({ ...loan, status: "OVERDUE" }));
}
