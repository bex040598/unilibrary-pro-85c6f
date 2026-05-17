import { afterAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/db/prisma";
import { createResource, listResources, transitionResource } from "@/server/services/resource-service";
import { createReservation, pickupReservation, updateReservationStatus } from "@/server/services/reservation-service";
import { issueLoan, requestRenewal, reviewRenewal } from "@/server/services/loan-service";
import { createSeatReservation, updateSeatReservationStatus } from "@/server/services/reading-room-service";
import { updateAdminEntity } from "@/server/services/admin-crud-service";

const cleanupIds = {
  resources: [] as string[],
  copies: [] as string[],
  reservations: [] as string[],
  loans: [] as string[],
  renewals: [] as string[],
  rooms: [] as string[],
  seats: [] as string[],
  seatReservations: [] as string[]
};

describe("enterprise flows", () => {
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
    if (cleanupIds.renewals.length) {
      await prisma.renewalRequest.deleteMany({ where: { id: { in: cleanupIds.renewals } } });
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

  it("teacher upload -> moderator approve -> catalog visibility", async () => {
    const [teacher, moderator, category, faculty, department] = await Promise.all([
      prisma.user.findFirstOrThrow({ where: { role: "TEACHER" } }),
      prisma.user.findFirstOrThrow({ where: { role: "MODERATOR" } }),
      prisma.category.findFirstOrThrow(),
      prisma.faculty.findFirstOrThrow(),
      prisma.department.findFirstOrThrow()
    ]);

    const file = new File([Buffer.from("%PDF-1.4 teacher upload")], "teacher-upload.pdf", { type: "application/pdf" });

    const resource = await createResource(
      teacher,
      {
        title: `Teacher Upload ${Date.now()}`,
        description: "Teacher upload flow resource description",
        abstract: "Teacher upload flow abstract",
        keywords: "teacher, upload",
        subject: "Software engineering",
        categoryId: category.id,
        facultyId: faculty.id,
        departmentId: department.id,
        language: "UZ",
        publicationYear: 2026,
        publisher: "ATMU",
        isbn: "978-1111-1111",
        udk: "004.1",
        bbk: "32.81",
        pages: 120,
        resourceType: "TEXTBOOK",
        accessType: "AUTH_REQUIRED",
        authorIds: [],
        authorNames: ["Teacher Author"]
      },
      file
    );
    cleanupIds.resources.push(resource.id);

    const submitted = await transitionResource(teacher, resource.id, "PENDING_REVIEW");
    expect(submitted.status).toBe("PENDING_REVIEW");

    const approved = await transitionResource(moderator, resource.id, "APPROVED");
    expect(approved.status).toBe("APPROVED");

    const listed = await listResources({ sort: "latest", page: 1, limit: 20, q: resource.title });
    expect(listed.items.some((item) => item.id === resource.id)).toBe(true);
  });

  it("loan overdue -> renewal request -> librarian approve", async () => {
    const [librarian, teacher, student, category] = await Promise.all([
      prisma.user.findFirstOrThrow({ where: { role: "LIBRARIAN" } }),
      prisma.user.findFirstOrThrow({ where: { role: "TEACHER" } }),
      prisma.user.findFirstOrThrow({ where: { role: "STUDENT" } }),
      prisma.category.findFirstOrThrow()
    ]);

    const resource = await prisma.resource.create({
      data: {
        title: `Renewal Flow ${Date.now()}`,
        slug: `renewal-flow-${Date.now()}`,
        description: "Renewal flow resource",
        categoryId: category.id,
        language: "UZ",
        resourceType: "TEXTBOOK",
        accessType: "PUBLIC",
        status: "APPROVED",
        uploadedById: teacher.id
      }
    });
    cleanupIds.resources.push(resource.id);

    const copy = await prisma.bookCopy.create({
      data: {
        resourceId: resource.id,
        inventoryNumber: `REN-INV-${Date.now()}`,
        barcode: `REN-BC-${Date.now()}`,
        status: "AVAILABLE"
      }
    });
    cleanupIds.copies.push(copy.id);

    const loan = await issueLoan(librarian, {
      userId: student.id,
      resourceId: resource.id,
      copyId: copy.id,
      dueAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
    });
    cleanupIds.loans.push(loan.id);

    const renewal = await requestRenewal(student, loan.id, new Date(Date.now() + 1000 * 60 * 60 * 24 * 5));
    cleanupIds.renewals.push(renewal.id);

    const approved = await reviewRenewal(librarian, loan.id, true, "Approved by test");
    expect(approved.status).toBe("APPROVED");
  });

  it("student reservation -> librarian approve -> pickup -> loan", async () => {
    const [student, librarian, teacher, category] = await Promise.all([
      prisma.user.findFirstOrThrow({ where: { role: "STUDENT" } }),
      prisma.user.findFirstOrThrow({ where: { role: "LIBRARIAN" } }),
      prisma.user.findFirstOrThrow({ where: { role: "TEACHER" } }),
      prisma.category.findFirstOrThrow()
    ]);

    const resource = await prisma.resource.create({
      data: {
        title: `Reservation Flow ${Date.now()}`,
        slug: `reservation-flow-${Date.now()}`,
        description: "Reservation flow resource",
        categoryId: category.id,
        language: "UZ",
        resourceType: "TEXTBOOK",
        accessType: "PUBLIC",
        status: "APPROVED",
        uploadedById: teacher.id
      }
    });
    cleanupIds.resources.push(resource.id);

    const copy = await prisma.bookCopy.create({
      data: {
        resourceId: resource.id,
        inventoryNumber: `RES-INV-${Date.now()}`,
        barcode: `RES-BC-${Date.now()}`,
        status: "AVAILABLE"
      }
    });
    cleanupIds.copies.push(copy.id);

    const reservation = await createReservation(student, resource.id, new Date(Date.now() + 1000 * 60 * 60 * 24));
    cleanupIds.reservations.push(reservation.id);
    await updateReservationStatus(librarian, reservation.id, "APPROVED");
    const loan = await pickupReservation(librarian, reservation.id);
    cleanupIds.loans.push(loan.id);
    expect(loan.userId).toBe(student.id);
  });

  it("reading room booking -> check-in -> check-out", async () => {
    const [student, librarian] = await Promise.all([
      prisma.user.findFirstOrThrow({ where: { role: "STUDENT" } }),
      prisma.user.findFirstOrThrow({ where: { role: "LIBRARIAN" } })
    ]);

    const room = await prisma.readingRoom.create({
      data: {
        name: `Seat Flow ${Date.now()}`,
        floor: "test",
        capacity: 5,
        openingTime: "08:00",
        closingTime: "18:00",
        status: "ACTIVE"
      }
    });
    cleanupIds.rooms.push(room.id);

    const seat = await prisma.seat.create({
      data: {
        roomId: room.id,
        seatNumber: `S-${Date.now()}`,
        status: "AVAILABLE"
      }
    });
    cleanupIds.seats.push(seat.id);

    const booking = await createSeatReservation(student, {
      roomId: room.id,
      seatId: seat.id,
      startTime: new Date("2026-05-21T08:00:00.000Z"),
      endTime: new Date("2026-05-21T10:00:00.000Z")
    });
    cleanupIds.seatReservations.push(booking.id);

    const checkedIn = await updateSeatReservationStatus(librarian, booking.id, "CHECKED_IN");
    expect(checkedIn.status).toBe("CHECKED_IN");

    const checkedOut = await updateSeatReservationStatus(librarian, booking.id, "COMPLETED");
    expect(checkedOut.status).toBe("COMPLETED");
  });

  it("admin can change user role", async () => {
    const [admin, student] = await Promise.all([
      prisma.user.findFirstOrThrow({ where: { role: "ADMIN" } }),
      prisma.user.findFirstOrThrow({ where: { role: "STUDENT" } })
    ]);

    const updated = await updateAdminEntity("users", student.id, { role: "TEACHER" }, admin.id);
    expect((updated as { role: string }).role).toBe("TEACHER");

    await prisma.user.update({ where: { id: student.id }, data: { role: "STUDENT" } });
  });
});
