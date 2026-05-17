import { AppError } from "@/lib/errors/app-error";

export const resourceTransitions: Record<string, string[]> = {
  DRAFT: ["PENDING_REVIEW"],
  PENDING_REVIEW: ["APPROVED", "REJECTED", "NEEDS_REVISION"],
  NEEDS_REVISION: ["PENDING_REVIEW"],
  APPROVED: ["ARCHIVED"],
  REJECTED: ["DRAFT"],
  ARCHIVED: []
};

export const reservationTransitions: Record<string, string[]> = {
  PENDING: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["PICKED_UP", "EXPIRED", "CANCELLED"],
  REJECTED: [],
  PICKED_UP: [],
  EXPIRED: [],
  CANCELLED: []
};

export const loanTransitions: Record<string, string[]> = {
  ACTIVE: ["RETURNED", "OVERDUE", "EXTENDED", "LOST"],
  OVERDUE: ["RETURNED", "LOST"],
  EXTENDED: ["RETURNED", "OVERDUE"],
  RETURNED: [],
  LOST: []
};

export const seatReservationTransitions: Record<string, string[]> = {
  BOOKED: ["CHECKED_IN", "CANCELLED", "NO_SHOW"],
  CHECKED_IN: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: []
};

export function assertTransition(current: string, next: string, transitions: Record<string, string[]>) {
  const allowed = transitions[current] ?? [];
  if (!allowed.includes(next)) {
    throw new AppError("INVALID_STATUS_TRANSITION", `Invalid transition from ${current} to ${next}`, 400, {
      current,
      next
    });
  }
}
