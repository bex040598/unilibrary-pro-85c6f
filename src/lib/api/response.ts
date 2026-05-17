import { ZodError, type ZodSchema } from "zod";
import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors/app-error";
import { buildPagination } from "@/lib/utils";

export function successResponse<T>(data: T, message = "OK", meta: Record<string, unknown> = {}) {
  return NextResponse.json({
    success: true,
    data,
    message,
    meta
  });
}

export function paginatedResponse<T>(data: T[], page: number, limit: number, total: number, message = "OK") {
  return successResponse(data, message, buildPagination(page, limit, total));
}

export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? {}
        }
      },
      { status: error.status }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          details: error.flatten()
        }
      },
      { status: 400 }
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Unexpected server error",
        details: {}
      }
    },
    { status: 500 }
  );
}

export async function parseBody<T>(request: Request, schema: ZodSchema<T>) {
  const body = await request.json();
  return schema.parse(body);
}

export function withRoute<TArgs extends unknown[]>(
  handler: (...args: TArgs) => Promise<Response> | Response
) {
  return async (...args: TArgs) => {
    try {
      return await handler(...args);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
