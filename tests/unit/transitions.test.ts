import { describe, expect, it } from "vitest";

import { assertTransition, reservationTransitions } from "@/lib/permissions/transitions";
import { AppError } from "@/lib/errors/app-error";

describe("status transitions", () => {
  it("allows valid reservation transitions", () => {
    expect(() => assertTransition("PENDING", "APPROVED", reservationTransitions)).not.toThrow();
  });

  it("blocks invalid reservation transitions", () => {
    try {
      assertTransition("REJECTED", "APPROVED", reservationTransitions);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("INVALID_STATUS_TRANSITION");
      return;
    }

    throw new Error("Expected INVALID_STATUS_TRANSITION");
  });
});
