export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "INVALID_STATUS_TRANSITION"
  | "FILE_TOO_LARGE"
  | "INVALID_FILE_TYPE"
  | "FILE_UPLOAD_FAILED"
  | "RESOURCE_NOT_AVAILABLE"
  | "COPY_NOT_AVAILABLE"
  | "SEAT_ALREADY_BOOKED"
  | "LOAN_ALREADY_RETURNED"
  | "OWNERSHIP_REQUIRED";

export class AppError extends Error {
  constructor(
    public code: AppErrorCode,
    message: string,
    public status = 400,
    public details?: unknown
  ) {
    super(message);
  }
}
