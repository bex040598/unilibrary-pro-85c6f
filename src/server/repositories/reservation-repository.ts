import { prisma } from "@/lib/db/prisma";

export const reservationRepository = {
  findById(id: string) {
    return prisma.reservation.findUnique({
      where: { id },
      include: {
        user: true,
        resource: true,
        copy: true
      }
    });
  },
  listByUser(userId: string) {
    return prisma.reservation.findMany({
      where: { userId },
      include: {
        resource: true,
        copy: true
      },
      orderBy: { createdAt: "desc" }
    });
  },
  listAll() {
    return prisma.reservation.findMany({
      include: {
        user: true,
        resource: true,
        copy: true
      },
      orderBy: { createdAt: "desc" }
    });
  }
};
