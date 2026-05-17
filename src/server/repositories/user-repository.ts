import { prisma } from "@/lib/db/prisma";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },
  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        faculty: true,
        department: true
      }
    });
  }
};
