import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors/app-error";
import { buildPagination } from "@/lib/utils";
import { writeAuditLog } from "@/server/services/audit-service";

type AdminEntity = "users" | "categories" | "faculties" | "departments" | "announcements" | "settings" | "book-copies" | "resources";

export async function listAdminEntity(
  entity: AdminEntity,
  query: { q?: string; page: number; limit: number; status?: string; role?: string; facultyId?: string; resourceType?: string; accessType?: string }
) {
  const skip = (query.page - 1) * query.limit;

  switch (entity) {
    case "users": {
      const where = {
        ...(query.q
          ? {
              OR: [{ fullName: { contains: query.q } }, { email: { contains: query.q } }]
            }
          : {}),
        ...(query.role ? { role: query.role } : {}),
        ...(query.status ? { status: query.status } : {})
      };
      const [items, total] = await prisma.$transaction([
        prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: query.limit }),
        prisma.user.count({ where })
      ]);
      return { items, meta: buildPagination(query.page, query.limit, total) };
    }
    case "categories": {
      const where = query.q ? { OR: [{ nameUz: { contains: query.q } }, { slug: { contains: query.q } }] } : {};
      const [items, total] = await prisma.$transaction([
        prisma.category.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: query.limit }),
        prisma.category.count({ where })
      ]);
      return { items, meta: buildPagination(query.page, query.limit, total) };
    }
    case "faculties": {
      const where = query.q ? { OR: [{ nameUz: { contains: query.q } }, { slug: { contains: query.q } }] } : {};
      const [items, total] = await prisma.$transaction([
        prisma.faculty.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: query.limit }),
        prisma.faculty.count({ where })
      ]);
      return { items, meta: buildPagination(query.page, query.limit, total) };
    }
    case "departments": {
      const where = {
        ...(query.q ? { OR: [{ nameUz: { contains: query.q } }, { slug: { contains: query.q } }] } : {}),
        ...(query.facultyId ? { facultyId: query.facultyId } : {})
      };
      const [items, total] = await prisma.$transaction([
        prisma.department.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: query.limit }),
        prisma.department.count({ where })
      ]);
      return { items, meta: buildPagination(query.page, query.limit, total) };
    }
    case "announcements": {
      const where = {
        ...(query.q ? { title: { contains: query.q } } : {}),
        ...(query.status ? { status: query.status } : {})
      };
      const [items, total] = await prisma.$transaction([
        prisma.announcement.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: query.limit }),
        prisma.announcement.count({ where })
      ]);
      return { items, meta: buildPagination(query.page, query.limit, total) };
    }
    case "settings": {
      const where = query.q ? { key: { contains: query.q } } : {};
      const [items, total] = await prisma.$transaction([
        prisma.systemSetting.findMany({ where, orderBy: { key: "asc" }, skip, take: query.limit }),
        prisma.systemSetting.count({ where })
      ]);
      return { items, meta: buildPagination(query.page, query.limit, total) };
    }
    case "book-copies": {
      const where = {
        ...(query.q ? { inventoryNumber: { contains: query.q } } : {}),
        ...(query.status ? { status: query.status } : {})
      };
      const [items, total] = await prisma.$transaction([
        prisma.bookCopy.findMany({ where, include: { resource: true }, orderBy: { createdAt: "desc" }, skip, take: query.limit }),
        prisma.bookCopy.count({ where })
      ]);
      return { items, meta: buildPagination(query.page, query.limit, total) };
    }
    case "resources": {
      const where = {
        ...(query.q ? { title: { contains: query.q } } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.resourceType ? { resourceType: query.resourceType } : {}),
        ...(query.accessType ? { accessType: query.accessType } : {})
      };
      const [items, total] = await prisma.$transaction([
        prisma.resource.findMany({ where, include: { uploadedBy: true }, orderBy: { createdAt: "desc" }, skip, take: query.limit }),
        prisma.resource.count({ where })
      ]);
      return { items, meta: buildPagination(query.page, query.limit, total) };
    }
    default:
      throw new AppError("NOT_FOUND", "Unsupported admin entity", 404);
  }
}

export async function createAdminEntity(entity: AdminEntity, payload: Record<string, unknown>, adminUserId: string) {
  let created: unknown;

  switch (entity) {
    case "users":
      created = await prisma.user.create({
        data: {
          fullName: String(payload.fullName),
          email: String(payload.email),
          passwordHash: await hashPassword(String(payload.password ?? "Password123!")),
          role: String(payload.role ?? "STUDENT"),
          status: String(payload.status ?? "ACTIVE"),
          facultyId: (payload.facultyId as string | undefined) || null,
          departmentId: (payload.departmentId as string | undefined) || null
        }
      });
      break;
    case "categories":
      created = await prisma.category.create({ data: payload as never });
      break;
    case "faculties":
      created = await prisma.faculty.create({ data: payload as never });
      break;
    case "departments":
      created = await prisma.department.create({ data: payload as never });
      break;
    case "announcements":
      created = await prisma.announcement.create({ data: payload as never });
      break;
    case "settings":
      created = await prisma.systemSetting.create({
        data: {
          key: String(payload.key),
          value: JSON.stringify(payload.value ?? payload.rawValue ?? null)
        }
      });
      break;
    case "book-copies":
      created = await prisma.bookCopy.create({ data: payload as never });
      break;
    case "resources":
      created = await prisma.resource.create({ data: payload as never });
      break;
    default:
      throw new AppError("NOT_FOUND", "Unsupported admin entity", 404);
  }

  await writeAuditLog({
    userId: adminUserId,
    action: "ADMIN_CREATE",
    entity,
    newValue: created
  });

  return created;
}

export async function updateAdminEntity(entity: AdminEntity, id: string, payload: Record<string, unknown>, adminUserId: string) {
  let updated: unknown;

  switch (entity) {
    case "users":
      updated = await prisma.user.update({
        where: { id },
        data: {
          fullName: payload.fullName as string | undefined,
          email: payload.email as string | undefined,
          role: payload.role as string | undefined,
          status: payload.status as string | undefined,
          facultyId: (payload.facultyId as string | undefined) || undefined,
          departmentId: (payload.departmentId as string | undefined) || undefined
        }
      });
      break;
    case "categories":
      updated = await prisma.category.update({ where: { id }, data: payload as never });
      break;
    case "faculties":
      updated = await prisma.faculty.update({ where: { id }, data: payload as never });
      break;
    case "departments":
      updated = await prisma.department.update({ where: { id }, data: payload as never });
      break;
    case "announcements":
      updated = await prisma.announcement.update({ where: { id }, data: payload as never });
      break;
    case "settings":
      updated = await prisma.systemSetting.update({
        where: { id },
        data: {
          key: payload.key as string | undefined,
          value: JSON.stringify(payload.value ?? payload.rawValue ?? null)
        }
      });
      break;
    case "book-copies":
      updated = await prisma.bookCopy.update({ where: { id }, data: payload as never });
      break;
    case "resources":
      updated = await prisma.resource.update({ where: { id }, data: payload as never });
      break;
    default:
      throw new AppError("NOT_FOUND", "Unsupported admin entity", 404);
  }

  await writeAuditLog({
    userId: adminUserId,
    action: "ADMIN_UPDATE",
    entity,
    entityId: id,
    newValue: updated
  });

  return updated;
}

export async function deleteAdminEntity(entity: AdminEntity, id: string, adminUserId: string) {
  switch (entity) {
    case "users":
      await prisma.user.delete({ where: { id } });
      break;
    case "categories":
      await prisma.category.delete({ where: { id } });
      break;
    case "faculties":
      await prisma.faculty.delete({ where: { id } });
      break;
    case "departments":
      await prisma.department.delete({ where: { id } });
      break;
    case "announcements":
      await prisma.announcement.delete({ where: { id } });
      break;
    case "settings":
      await prisma.systemSetting.delete({ where: { id } });
      break;
    case "book-copies":
      await prisma.bookCopy.delete({ where: { id } });
      break;
    case "resources":
      await prisma.resource.delete({ where: { id } });
      break;
    default:
      throw new AppError("NOT_FOUND", "Unsupported admin entity", 404);
  }

  await writeAuditLog({
    userId: adminUserId,
    action: "ADMIN_DELETE",
    entity,
    entityId: id
  });
}
