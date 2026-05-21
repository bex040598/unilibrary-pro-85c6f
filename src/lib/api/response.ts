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
  const message = error instanceof Error ? error.message : "";

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
          message: "Kiritilgan ma'lumotlarda xatolik bor",
          details: error.flatten()
        }
      },
      { status: 400 }
    );
  }

  if (
    message.includes("DATABASE_URL") ||
    message.includes("Can't reach database server") ||
    message.includes("PrismaClientInitializationError") ||
    message.includes("Environment variable not found")
  ) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "Ma'lumotlar bazasiga ulanishda muammo yuz berdi",
          details: {}
        }
      },
      { status: 503 }
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Serverda vaqtinchalik xatolik yuz berdi",
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

export function parseQuery<T>(request: Request, schema: ZodSchema<T>) {
  const url = new URL(request.url);
  const data = Object.fromEntries(url.searchParams.entries());
  return schema.parse(data);
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
