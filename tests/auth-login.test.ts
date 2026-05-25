import { describe, expect, it } from "vitest";

const loginUrl = "http://localhost:3000/api/auth/login";
const studentPassword = ["Student", "12345", "!"].join("");
const testSigningKey = ["local", "test", "signing", "key"].join("-");

function setAuthEnv() {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? testSigningKey;
  process.env.APP_URL = process.env.APP_URL ?? "http://localhost:3000";
}

async function postLogin(email: string, password: string) {
  const { POST } = await import("@/app/api/auth/login/route");

  return POST(
    new Request(loginUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ email, password })
    })
  );
}

describe("POST /api/auth/login", () => {
  it("returns 200 for a seeded student account", async () => {
    setAuthEnv();

    const response = await postLogin("student@atmu.uz", studentPassword);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.email).toBe("student@atmu.uz");
  });

  it("returns 401 for a wrong password", async () => {
    setAuthEnv();

    const response = await postLogin("student@atmu.uz", "WrongPassword123!");
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 for a missing user", async () => {
    setAuthEnv();

    const response = await postLogin("missing-user@atmu.uz", studentPassword);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("UNAUTHORIZED");
  });

  it("does not expose stack traces when server auth config is missing", async () => {
    const previousJwtSecret = process.env.JWT_SECRET;
    const previousAuthSecret = process.env.AUTH_SECRET;

    delete process.env.JWT_SECRET;
    delete process.env.AUTH_SECRET;
    process.env.APP_URL = process.env.APP_URL ?? "http://localhost:3000";

    const response = await postLogin("student@atmu.uz", studentPassword);
    const payload = await response.json();

    if (previousJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = previousJwtSecret;
    }

    if (previousAuthSecret === undefined) {
      delete process.env.AUTH_SECRET;
    } else {
      process.env.AUTH_SECRET = previousAuthSecret;
    }

    expect(response.status).toBe(500);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("INTERNAL_ERROR");
    expect(payload.error.message).toBe("Serverda vaqtinchalik xatolik yuz berdi");
    expect(JSON.stringify(payload)).not.toContain("JWT_SECRET");
    expect(JSON.stringify(payload)).not.toContain("Error:");
  });
});
