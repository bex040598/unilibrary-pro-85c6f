import type { User } from "@prisma/client";

import { AppError } from "@/lib/errors/app-error";
import { prisma } from "@/lib/db/prisma";
import { assertTransition, seatReservationTransitions } from "@/lib/permissions/transitions";
import { readingRoomRepository } from "@/server/repositories/reading-room-repository";
import { writeAuditLog } from "@/server/services/audit-service";

export async function listReadingRooms() {
  return readingRoomRepository.listRooms();
}

export async function createReadingRoom(
  user: User,
  input: { name: string; floor: string; capacity: number; openingTime: string; closingTime: string }
) {
  if (!["LIBRARIAN", "ADMIN"].includes(user.role)) {
    throw new AppError("FORBIDDEN", "Only librarians can manage reading rooms", 403);
  }

  return prisma.readingRoom.create({
    data: {
      ...input,
      status: "ACTIVE"
    }
  });
}

export async function listSeats(roomId: string) {
  const room = await readingRoomRepository.getRoom(roomId);
  if (!room) {
    throw new AppError("NOT_FOUND", "Reading room not found", 404);
  }

  return room.seats;
}

export async function createSeat(
  user: User,
  roomId: string,
  input: { seatNumber: string; hasPowerSocket?: boolean; hasComputer?: boolean }
) {
  if (!["LIBRARIAN", "ADMIN"].includes(user.role)) {
    throw new AppError("FORBIDDEN", "Only librarians can manage seats", 403);
  }

  return prisma.seat.create({
    data: {
      roomId,
      seatNumber: input.seatNumber,
      hasPowerSocket: input.hasPowerSocket ?? false,
      hasComputer: input.hasComputer ?? false
    }
  });
}

export async function createSeatReservation(
  user: User,
  input: { roomId: string; seatId: string; startTime: Date; endTime: Date }
) {
  if (input.endTime <= input.startTime) {
    throw new AppError("VALIDATION_ERROR", "End time must be after start time", 400);
  }

  const overlap = await prisma.seatReservation.findFirst({
    where: {
      seatId: input.seatId,
      status: {
        in: ["BOOKED", "CHECKED_IN"]
      },
      startTime: {
        lt: input.endTime
      },
      endTime: {
        gt: input.startTime
      }
    }
  });

  if (overlap) {
    throw new AppError("SEAT_ALREADY_BOOKED", "Seat is already booked for the selected time", 409);
  }

  const seatReservation = await prisma.seatReservation.create({
    data: {
      userId: user.id,
      roomId: input.roomId,
      seatId: input.seatId,
      startTime: input.startTime,
      endTime: input.endTime,
      qrCode: `${input.roomId}:${input.seatId}:${user.id}:${input.startTime.toISOString()}`
    }
  });

  await writeAuditLog({
    userId: user.id,
    action: "CREATE_SEAT_RESERVATION",
    entity: "SeatReservation",
    entityId: seatReservation.id
  });

  return seatReservation;
}

export async function listMySeatReservations(userId: string) {
  return readingRoomRepository.listUserReservations(userId);
}

export async function listSeatReservations() {
  return readingRoomRepository.listAllReservations();
}

export async function updateSeatReservationStatus(user: User, reservationId: string, nextStatus: string) {
  const reservation = await prisma.seatReservation.findUnique({
    where: { id: reservationId }
  });

  if (!reservation) {
    throw new AppError("NOT_FOUND", "Seat reservation not found", 404);
  }

  if (nextStatus === "CANCELLED") {
    if (reservation.userId !== user.id && !["LIBRARIAN", "ADMIN"].includes(user.role)) {
      throw new AppError("FORBIDDEN", "You cannot cancel this reservation", 403);
    }
  } else if (!["LIBRARIAN", "ADMIN"].includes(user.role)) {
    throw new AppError("FORBIDDEN", "Only librarians can change this reservation", 403);
  }

  assertTransition(reservation.status, nextStatus, seatReservationTransitions);

  return prisma.seatReservation.update({
    where: { id: reservationId },
    data: {
      status: nextStatus,
      checkInAt: nextStatus === "CHECKED_IN" ? new Date() : reservation.checkInAt,
      checkOutAt: nextStatus === "COMPLETED" ? new Date() : reservation.checkOutAt
    }
  });
}
