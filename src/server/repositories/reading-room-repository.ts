import { prisma } from "@/lib/db/prisma";

export const readingRoomRepository = {
  listRooms() {
    return prisma.readingRoom.findMany({
      include: {
        seats: true,
        bookings: {
          where: {
            status: {
              in: ["BOOKED", "CHECKED_IN"]
            }
          }
        }
      },
      orderBy: { name: "asc" }
    });
  },
  getRoom(id: string) {
    return prisma.readingRoom.findUnique({
      where: { id },
      include: {
        seats: true
      }
    });
  },
  listUserReservations(userId: string) {
    return prisma.seatReservation.findMany({
      where: { userId },
      include: {
        room: true,
        seat: true
      },
      orderBy: { startTime: "desc" }
    });
  },
  listAllReservations() {
    return prisma.seatReservation.findMany({
      include: {
        room: true,
        seat: true,
        user: true
      },
      orderBy: { startTime: "desc" }
    });
  }
};
