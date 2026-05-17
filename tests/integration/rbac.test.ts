import { afterAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors/app-error";
import { assertRole } from "@/lib/permissions/rbac";
import { canAccessPrivateResource } from "@/server/policies/resource-policy";
import { updateResource, transitionResource } from "@/server/services/resource-service";
import { issueLoan, returnLoan } from "@/server/services/loan-service";
import { updateReservationStatus } from "@/server/services/reservation-service";
import { updateSeatReservationStatus } from "@/server/services/reading-room-service";
import { updateAdminEntity } from "@/server/services/admin-crud-service";

const cleanupIds = {
  resources: [] as string[],
  copies: [] as string[],
  reservations: [] as string[],
  loans: [] as string[],
  seatReservations: [] as string[],
  rooms: [] as string[],
  seats: [] as string[]
};

describe("rbac regression", () => {
  afterAll(async () => {
    if (cleanupIds.seatReservations.length) {
      await prisma.seatReservation.deleteMany({ where: { id: { in: cleanupIds.seatReservations } } });
    }
    if (cleanupIds.seats.length) {
      await prisma.seat.deleteMany({ where: { id: { in: cleanupIds.seats } } });
    }
    if (cleanupIds.rooms.length) {
      await prisma.readingRoom.deleteMany({ where: { id: { in: cleanupIds.rooms } } });
    }
    if (cleanupIds.loans.length) {
      await prisma.loan.deleteMany({ where: { id: { in: cleanupIds.loans } } });
    }
    if (cleanupIds.reservations.length) {
      await prisma.reservation.deleteMany({ where: { id: { in: cleanupIds.reservations } } });
    }
    if (cleanupIds.copies.length) {
      await prisma.bookCopy.deleteMany({ where: { id: { in: cleanupIds.copies } } });
    }
    if (cleanupIds.resources.length) {
      await prisma.resource.deleteMany({ where: { id: { in: cleanupIds.resources } } });
    }
  });

  it("blocks guest access to private files", () => {
    expect(canAccessPrivateResource(null, "PRIVATE")).toBe(false);
    expect(canAccessPrivateResource(null, "STAFF_ONLY")).toBe(false);
    expect(canAccessPrivateResource(null, "AUTH_REQUIRED")).toBe(false);
  });

  it("blocks student-level admin actions", async () => {
    expect(() => assertRole("STUDENT", ["ADMIN"])).toThrow(AppError);

    const [student, category, teacher] = await Promise.all([
      prisma.user.findFirstOrThrow({ where: { role: "STUDENT" } }),
      prisma.category.findFirstOrThrow(),
      prisma.user.findFirstOrThrow({ where: { role: "TEACHER" } })
    ]);

    const resource = await prisma.resource.create({
      data: {
        title: `Student RBAC Resource ${Date.now()}`,
        slug: `student-rbac-${Date.now()}`,
        description: "RBAC resource",
        categoryId: category.id,
        language: "UZ",
        resourceType: "TEXTBOOK",
        accessType: "PUBLIC",
        status: "PENDING_REVIEW",
        uploadedById: teacher.id
      }
    });
    cleanupIds.resources.push(resource.id);

    await expect(transitionResource(student, resource.id, "APPROVED")).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(returnLoan(student, "missing-loan")).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks teacher from editing another teacher's resource and approving content", async () => {
    const [teachers, category] = await Promise.all([prisma.user.findMany({ where: { role: "TEACHER" }, orderBy: { createdAt: "asc" }, take: 2 }), prisma.category.findFirstOrThrow()]);

    const [teacherA, teacherB] = teachers;
    if (!teacherA || !teacherB || teacherA.id === teacherB.id) {
      throw new Error("Seed must provide at least two distinct teachers for RBAC tests");
    }

    const resource = await prisma.resource.create({
      data: {
        title: `Teacher Owned ${Date.now()}`,
        slug: `teacher-owned-${Date.now()}`,
        description: "Ownership resource",
        categoryId: category.id,
        language: "UZ",
        resourceType: "TEXTBOOK",
        accessType: "PUBLIC",
        status: "DRAFT",
        uploadedById: teacherA.id
      }
    });
    cleanupIds.resources.push(resource.id);

    await expect(
      updateResource(teacherB, resource.id, {
        title: "Updated",
        description: "Updated description for ownership",
        categoryId: category.id,
        language: "UZ",
        resourceType: "TEXTBOOK",
        accessType: "PUBLIC",
        authorIds: [],
        authorNames: [],
        keywords: "ownership"
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    await expect(transitionResource(teacherB, resource.id, "APPROVED")).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(transitionResource(teacherB, resource.id, "PENDING_REVIEW")).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("blocks department-head privileged actions outside allowed scope", async () => {
    const [departmentHead, student, category, teacher, librarian] = await Promise.all([
      prisma.user.findFirstOrThrow({ where: { role: "DEPARTMENT_HEAD" } }),
      prisma.user.findFirstOrThrow({ where: { role: "STUDENT" } }),
      prisma.category.findFirstOrThrow(),
      prisma.user.findFirstOrThrow({ where: { role: "TEACHER" } }),
      prisma.user.findFirstOrThrow({ where: { role: "LIBRARIAN" } })
    ]);

    const resource = await prisma.resource.create({
      data: {
        title: `Department RBAC ${Date.now()}`,
        slug: `department-rbac-${Date.now()}`,
        description: "Department scope resource",
        categoryId: category.id,
        language: "UZ",
        resourceType: "TEXTBOOK",
        accessType: "PUBLIC",
        status: "PENDING_REVIEW",
        uploadedById: teacher.id
      }
    });
    cleanupIds.resources.push(resource.id);

    const copy = await prisma.bookCopy.create({
      data: {
        resourceId: resource.id,
        inventoryNumber: `DEP-INV-${Date.now()}`,
        barcode: `DEP-BC-${Date.now()}`,
        status: "AVAILABLE"
      }
    });
    cleanupIds.copies.push(copy.id);

    const reservation = await prisma.reservation.create({
      data: {
        userId: student.id,
        resourceId: resource.id,
        copyId: copy.id,
        pickupDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
        pickupDeadline: new Date(Date.now() + 1000 * 60 * 60 * 48),
        status: "PENDING",
        qrCode: `dep-head:${resource.id}:${student.id}`
      }
    });
    cleanupIds.reservations.push(reservation.id);

    const loan = await issueLoan(librarian, {
      userId: student.id,
      resourceId: resource.id,
      copyId: copy.id,
      dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    });
    cleanupIds.loans.push(loan.id);

    expect(() => assertRole("DEPARTMENT_HEAD", ["ADMIN"])).toThrow(AppError);
    await expect(updateReservationStatus(departmentHead, reservation.id, "APPROVED")).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(transitionResource(departmentHead, resource.id, "APPROVED")).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(returnLoan(departmentHead, loan.id)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows moderator, librarian, and admin privileged actions where expected", async () => {
    const [moderator, librarian, admin, category, teacher, student] = await Promise.all([
      prisma.user.findFirstOrThrow({ where: { role: "MODERATOR" } }),
      prisma.user.findFirstOrThrow({ where: { role: "LIBRARIAN" } }),
      prisma.user.findFirstOrThrow({ where: { role: "ADMIN" } }),
      prisma.category.findFirstOrThrow(),
      prisma.user.findFirstOrThrow({ where: { role: "TEACHER" } }),
      prisma.user.findFirstOrThrow({ where: { role: "STUDENT" } })
    ]);

    const resource = await prisma.resource.create({
      data: {
        title: `Moderator Approve ${Date.now()}`,
        slug: `moderator-approve-${Date.now()}`,
        description: "Moderator approve resource",
        categoryId: category.id,
        language: "UZ",
        resourceType: "TEXTBOOK",
        accessType: "PUBLIC",
        status: "PENDING_REVIEW",
        uploadedById: teacher.id
      }
    });
    cleanupIds.resources.push(resource.id);

    const approved = await transitionResource(moderator, resource.id, "APPROVED");
    expect(approved.status).toBe("APPROVED");

    const copy = await prisma.bookCopy.create({
      data: {
        resourceId: resource.id,
        inventoryNumber: `RBAC-INV-${Date.now()}`,
        barcode: `RBAC-BC-${Date.now()}`,
        status: "AVAILABLE"
      }
    });
    cleanupIds.copies.push(copy.id);

    const loan = await issueLoan(librarian, {
      userId: student.id,
      resourceId: resource.id,
      copyId: copy.id,
      dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    });
    cleanupIds.loans.push(loan.id);
    expect(loan.copyId).toBe(copy.id);

    const updatedUser = await updateAdminEntity("users", student.id, { role: "TEACHER" }, admin.id);
    expect((updatedUser as { role: string }).role).toBe("TEACHER");

    await prisma.user.update({ where: { id: student.id }, data: { role: "STUDENT" } });
  });
});
