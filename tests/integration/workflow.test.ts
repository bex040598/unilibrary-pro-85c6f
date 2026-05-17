import crypto from "node:crypto";

import { afterAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/db/prisma";
import { createReservation, pickupReservation, updateReservationStatus } from "@/server/services/reservation-service";
import { returnLoan } from "@/server/services/loan-service";
import { createSeatReservation } from "@/server/services/reading-room-service";
import { AppError } from "@/lib/errors/app-error";

const cleanupIds = {
  resources: [] as string[],
  copies: [] as string[],
  rooms: [] as string[],
  seats: [] as string[],
  reservations: [] as string[],
  loans: [] as string[],
  seatReservations: [] as string[]
};

describe("core workflows", () => {
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

  it("creates a reservation, picks up a loan, and returns the copy", async () => {
    const [student, librarian, category, teacher] = await Promise.all([
      prisma.user.findFirstOrThrow({ where: { role: "STUDENT" } }),
      prisma.user.findFirstOrThrow({ where: { role: "LIBRARIAN" } }),
      prisma.category.findFirstOrThrow(),
      prisma.user.findFirstOrThrow({ where: { role: "TEACHER" } })
    ]);

    const resource = await prisma.resource.create({
      data: {
        title: `Vitest Workflow Resource ${Date.now()}`,
        slug: `vitest-workflow-${Date.now()}`,
        description: "Workflow resource",
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
        inventoryNumber: `VITEST-INV-${Date.now()}`,
        barcode: `VITEST-BC-${Date.now()}`,
        status: "AVAILABLE"
      }
    });
    cleanupIds.copies.push(copy.id);

    const reservation = await createReservation(student, resource.id, new Date(Date.now() + 1000 * 60 * 60 * 24));
    cleanupIds.reservations.push(reservation.id);

    expect(reservation.copyId).toBe(copy.id);

    await updateReservationStatus(librarian, reservation.id, "APPROVED");
    const loan = await pickupReservation(librarian, reservation.id);
    cleanupIds.loans.push(loan.id);

    const borrowedCopy = await prisma.bookCopy.findUniqueOrThrow({ where: { id: copy.id } });
    expect(borrowedCopy.status).toBe("BORROWED");

    await returnLoan(librarian, loan.id);
    const availableCopy = await prisma.bookCopy.findUniqueOrThrow({ where: { id: copy.id } });
    expect(availableCopy.status).toBe("AVAILABLE");
  });

  it("blocks overlapping seat reservations", async () => {
    const student = await prisma.user.findFirstOrThrow({ where: { role: "STUDENT" } });

    const room = await prisma.readingRoom.create({
      data: {
        name: `Vitest Room ${Date.now()}`,
        floor: "test",
        capacity: 10,
        openingTime: "08:00",
        closingTime: "20:00",
        status: "ACTIVE"
      }
    });
    cleanupIds.rooms.push(room.id);

    const seat = await prisma.seat.create({
      data: {
        roomId: room.id,
        seatNumber: crypto.randomUUID().slice(0, 8),
        status: "AVAILABLE"
      }
    });
    cleanupIds.seats.push(seat.id);

    const first = await createSeatReservation(student, {
      roomId: room.id,
      seatId: seat.id,
      startTime: new Date("2026-05-18T09:00:00.000Z"),
      endTime: new Date("2026-05-18T11:00:00.000Z")
    });
    cleanupIds.seatReservations.push(first.id);

    try {
      await createSeatReservation(student, {
        roomId: room.id,
        seatId: seat.id,
        startTime: new Date("2026-05-18T10:00:00.000Z"),
        endTime: new Date("2026-05-18T12:00:00.000Z")
      });
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("SEAT_ALREADY_BOOKED");
      return;
    }

    throw new Error("Expected SEAT_ALREADY_BOOKED");
  });
});
