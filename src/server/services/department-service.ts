import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors/app-error";
import { buildContains } from "@/lib/search/search-utils";
import { buildPagination } from "@/lib/utils";
import { writeAuditLog } from "@/server/services/audit-service";
import type { DepartmentInput, DepartmentQueryInput } from "@/lib/validation/department";

function buildWhere(query: DepartmentQueryInput) {
  return {
    ...(query.includeInactive === "true" ? {} : { isActive: true }),
    ...(query.facultyId ? { facultyId: query.facultyId } : {}),
    ...(query.q
      ? {
          OR: [
            { nameUz: buildContains(query.q) },
            { nameRu: buildContains(query.q) },
            { nameEn: buildContains(query.q) },
            { slug: buildContains(query.q) },
            { code: buildContains(query.q) },
            { faculty: { is: { nameUz: buildContains(query.q) } } }
          ]
        }
      : {})
  };
}

export async function listDepartments(query: DepartmentQueryInput) {
  const where = buildWhere(query);
  const [items, total] = await prisma.$transaction([
    prisma.department.findMany({
      where,
      include: {
        faculty: true,
        _count: {
          select: {
            resources: true,
            users: true
          }
        }
      },
      orderBy: [{ faculty: { nameUz: "asc" } }, { nameUz: "asc" }],
      skip: (query.page - 1) * query.limit,
      take: query.limit
    }),
    prisma.department.count({ where })
  ]);

  return {
    items,
    meta: buildPagination(query.page, query.limit, total)
  };
}

export async function getDepartmentById(id: string) {
  const department = await prisma.department.findUnique({
    where: { id },
    include: {
      faculty: true,
      resources: {
        where: { status: "APPROVED" },
        include: {
          category: true,
          uploadedBy: true
        },
        orderBy: { createdAt: "desc" },
        take: 12
      },
      _count: {
        select: {
          resources: true,
          users: true
        }
      }
    }
  });

  if (!department) {
    throw new AppError("NOT_FOUND", "Kafedra topilmadi", 404);
  }

  return department;
}

export async function getDepartmentBySlug(slug: string) {
  const department = await prisma.department.findUnique({
    where: { slug },
    include: {
      faculty: true,
      resources: {
        where: { status: "APPROVED" },
        include: {
          category: true,
          uploadedBy: true,
          authors: {
            include: {
              author: true
            }
          },
          copies: true
        },
        orderBy: { createdAt: "desc" },
        take: 12
      },
      _count: {
        select: {
          resources: true,
          users: true
        }
      }
    }
  });

  if (!department) {
    throw new AppError("NOT_FOUND", "Kafedra topilmadi", 404);
  }

  return department;
}

function normalizeDepartmentPayload(input: DepartmentInput) {
  return {
    facultyId: input.facultyId,
    nameUz: input.nameUz,
    nameRu: input.nameRu,
    nameEn: input.nameEn,
    slug: input.slug,
    code: input.code?.trim() || null,
    headName: input.headName?.trim() || null,
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    room: input.room?.trim() || null,
    description: input.description?.trim() || null,
    imageUrl: input.imageUrl?.trim() || null,
    isActive: input.isActive ?? true
  };
}

export async function createDepartment(input: DepartmentInput, actorUserId: string) {
  const department = await prisma.department.create({
    data: normalizeDepartmentPayload(input)
  });

  await writeAuditLog({
    userId: actorUserId,
    action: "CREATE_DEPARTMENT",
    entity: "Department",
    entityId: department.id,
    newValue: department
  });

  return department;
}

export async function updateDepartment(id: string, input: DepartmentInput, actorUserId: string) {
  const previous = await prisma.department.findUnique({ where: { id } });
  if (!previous) {
    throw new AppError("NOT_FOUND", "Kafedra topilmadi", 404);
  }

  const department = await prisma.department.update({
    where: { id },
    data: normalizeDepartmentPayload(input)
  });

  await writeAuditLog({
    userId: actorUserId,
    action: "UPDATE_DEPARTMENT",
    entity: "Department",
    entityId: id,
    oldValue: previous,
    newValue: department
  });

  return department;
}

export async function archiveDepartment(id: string, actorUserId: string) {
  const previous = await prisma.department.findUnique({ where: { id } });
  if (!previous) {
    throw new AppError("NOT_FOUND", "Kafedra topilmadi", 404);
  }

  const department = await prisma.department.update({
    where: { id },
    data: {
      isActive: false
    }
  });

  await writeAuditLog({
    userId: actorUserId,
    action: "ARCHIVE_DEPARTMENT",
    entity: "Department",
    entityId: id,
    oldValue: previous,
    newValue: department
  });

  return department;
}
