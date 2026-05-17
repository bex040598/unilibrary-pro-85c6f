import { afterAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/db/prisma";
import { loginUser, registerUser } from "@/server/services/auth-service";

describe("auth service", () => {
  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: "vitest-auth-"
        }
      }
    });
  });

  it("registers and logs in a new user", async () => {
    const email = `vitest-auth-${Date.now()}@atmu.uz`;

    const user = await registerUser({
      fullName: "Vitest Auth User",
      email,
      password: "Student12345!",
      role: "STUDENT"
    });

    expect(user.email).toBe(email);

    const loggedIn = await loginUser({
      email,
      password: "Student12345!"
    });

    expect(loggedIn.id).toBe(user.id);
  });
});
