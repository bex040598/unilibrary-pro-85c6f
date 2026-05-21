import { afterAll, describe, expect, it } from "vitest";

import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors/app-error";
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

  it("returns unauthorized for invalid credentials", async () => {
    await expect(
      loginUser({
        email: "missing-user@atmu.uz",
        password: "WrongPassword123!"
      })
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      message: "Email yoki parol noto'g'ri"
    } satisfies Partial<AppError>);
  });

  it("blocks inactive accounts from logging in", async () => {
    const email = `vitest-auth-blocked-${Date.now()}@atmu.uz`;

    const user = await registerUser({
      fullName: "Blocked User",
      email,
      password: "Student12345!",
      role: "STUDENT"
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { status: "BLOCKED" }
    });

    await expect(
      loginUser({
        email,
        password: "Student12345!"
      })
    ).rejects.toMatchObject({
      code: "FORBIDDEN"
    } satisfies Partial<AppError>);
  });
});
