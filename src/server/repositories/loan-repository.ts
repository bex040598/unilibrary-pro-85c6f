import { prisma } from "@/lib/db/prisma";

export const loanRepository = {
  listByUser(userId: string) {
    return prisma.loan.findMany({
      where: { userId },
      include: {
        resource: true,
        copy: true,
        renewals: true
      },
      orderBy: { issuedAt: "desc" }
    });
  },
  listAll() {
    return prisma.loan.findMany({
      include: {
        user: true,
        resource: true,
        copy: true,
        renewals: true
      },
      orderBy: { issuedAt: "desc" }
    });
  },
  findById(id: string) {
    return prisma.loan.findUnique({
      where: { id },
      include: {
        user: true,
        resource: true,
        copy: true,
        renewals: true
      }
    });
  }
};
