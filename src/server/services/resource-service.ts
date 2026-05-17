import type { Prisma, User } from "@prisma/client";

import { AppError } from "@/lib/errors/app-error";
import { prisma } from "@/lib/db/prisma";
import { slugify, buildPagination } from "@/lib/utils";
import { resourceRepository } from "@/server/repositories/resource-repository";
import { canManageResource } from "@/server/policies/resource-policy";
import { assertTransition, resourceTransitions } from "@/lib/permissions/transitions";
import { writeAuditLog } from "@/server/services/audit-service";
import { saveUpload } from "@/lib/storage/local-storage";
import { generateCitations } from "@/lib/citation";

type ResourceInput = {
  title: string;
  description: string;
  abstract?: string;
  keywords?: string;
  categoryId: string;
  facultyId?: string;
  departmentId?: string;
  language: string;
  publicationYear?: number;
  publisher?: string;
  isbn?: string;
  udk?: string;
  bbk?: string;
  pages?: number;
  resourceType: string;
  accessType: string;
  authorIds: string[];
};

type ResourceQuery = {
  q?: string;
  category?: string;
  language?: string;
  facultyId?: string;
  departmentId?: string;
  resourceType?: string;
  accessType?: string;
  hasAvailableCopies?: string;
  rating?: number;
  sort: string;
  page: number;
  limit: number;
};

function sanitizeResource(resource: NonNullable<Awaited<ReturnType<typeof resourceRepository.findById>>>) {
  return {
    ...resource,
    authorNames: resource.authors.map((item) => item.author.fullName),
    availableCopies: resource.copies.filter((copy) => copy.status === "AVAILABLE").length
  };
}

export async function listResources(query: ResourceQuery) {
  const { items, total } = await resourceRepository.list(query);
  return {
    items: items.map(sanitizeResource),
    meta: buildPagination(query.page, query.limit, total)
  };
}

export async function getResourceBySlug(slug: string) {
  const resource = await resourceRepository.findBySlug(slug);
  if (!resource) {
    throw new AppError("NOT_FOUND", "Resource not found", 404);
  }

  return sanitizeResource(resource);
}

export async function getResourceById(id: string) {
  const resource = await resourceRepository.findById(id);
  if (!resource) {
    throw new AppError("NOT_FOUND", "Resource not found", 404);
  }

  return sanitizeResource(resource);
}

export async function createResource(user: User, input: ResourceInput, file?: File | null) {
  let fileMeta: Awaited<ReturnType<typeof saveUpload>> | null = null;
  if (file) {
    fileMeta = await saveUpload(file);
  }

  const resource = await prisma.resource.create({
    data: {
      title: input.title,
      slug: `${slugify(input.title)}-${Math.random().toString(36).slice(2, 7)}`,
      description: input.description,
      abstract: input.abstract,
      keywords: input.keywords,
      categoryId: input.categoryId,
      facultyId: input.facultyId,
      departmentId: input.departmentId,
      language: input.language,
      publicationYear: input.publicationYear,
      publisher: input.publisher,
      isbn: input.isbn,
      udk: input.udk,
      bbk: input.bbk,
      pages: input.pages,
      resourceType: input.resourceType,
      accessType: input.accessType,
      uploadedById: user.id,
      status: user.role === "LIBRARIAN" ? "APPROVED" : "DRAFT",
      fileUrl: fileMeta?.filepath,
      fileSize: fileMeta?.size,
      fileFormat: fileMeta?.format,
      fileChecksum: fileMeta?.checksum,
      authors: {
        createMany: {
          data: input.authorIds.map((authorId) => ({ authorId }))
        }
      }
    },
    include: {
      authors: true
    }
  });

  await writeAuditLog({
    userId: user.id,
    action: "CREATE",
    entity: "Resource",
    entityId: resource.id,
    newValue: { title: resource.title, status: resource.status }
  });

  return resource;
}

export async function updateResource(user: User, resourceId: string, input: ResourceInput, file?: File | null) {
  const current = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: { authors: true }
  });

  if (!current) {
    throw new AppError("NOT_FOUND", "Resource not found", 404);
  }

  if (!canManageResource(user, current.uploadedById)) {
    throw new AppError("FORBIDDEN", "Resource cannot be edited", 403);
  }

  let fileMeta: Awaited<ReturnType<typeof saveUpload>> | null = null;
  if (file) {
    fileMeta = await saveUpload(file);
  }

  const resource = await prisma.$transaction(async (tx) => {
    await tx.resourceAuthor.deleteMany({ where: { resourceId } });

    return tx.resource.update({
      where: { id: resourceId },
      data: {
        title: input.title,
        slug: current.slug,
        description: input.description,
        abstract: input.abstract,
        keywords: input.keywords,
        categoryId: input.categoryId,
        facultyId: input.facultyId,
        departmentId: input.departmentId,
        language: input.language,
        publicationYear: input.publicationYear,
        publisher: input.publisher,
        isbn: input.isbn,
        udk: input.udk,
        bbk: input.bbk,
        pages: input.pages,
        resourceType: input.resourceType,
        accessType: input.accessType,
        rejectionReason: null,
        fileUrl: fileMeta?.filepath ?? current.fileUrl,
        fileSize: fileMeta?.size ?? current.fileSize,
        fileFormat: fileMeta?.format ?? current.fileFormat,
        fileChecksum: fileMeta?.checksum ?? current.fileChecksum,
        authors: {
          createMany: {
            data: input.authorIds.map((authorId) => ({ authorId }))
          }
        }
      }
    });
  });

  await writeAuditLog({
    userId: user.id,
    action: "UPDATE",
    entity: "Resource",
    entityId: resource.id,
    oldValue: { title: current.title, status: current.status },
    newValue: { title: resource.title, status: resource.status }
  });

  return resource;
}

export async function deleteResource(user: User, resourceId: string) {
  const current = await prisma.resource.findUnique({ where: { id: resourceId } });
  if (!current) {
    throw new AppError("NOT_FOUND", "Resource not found", 404);
  }

  if (!canManageResource(user, current.uploadedById) && user.role !== "ADMIN") {
    throw new AppError("FORBIDDEN", "Resource cannot be deleted", 403);
  }

  await prisma.resource.delete({ where: { id: resourceId } });

  await writeAuditLog({
    userId: user.id,
    action: "DELETE",
    entity: "Resource",
    entityId: resourceId,
    oldValue: current
  });
}

export async function transitionResource(user: User, resourceId: string, nextStatus: string, rejectionReason?: string) {
  const current = await prisma.resource.findUnique({ where: { id: resourceId } });
  if (!current) {
    throw new AppError("NOT_FOUND", "Resource not found", 404);
  }

  if (
    (nextStatus === "PENDING_REVIEW" && user.id !== current.uploadedById && user.role !== "ADMIN") ||
    (["APPROVED", "REJECTED", "NEEDS_REVISION", "ARCHIVED"].includes(nextStatus) &&
      !["MODERATOR", "LIBRARIAN", "ADMIN"].includes(user.role))
  ) {
    throw new AppError("FORBIDDEN", "Status transition not allowed", 403);
  }

  assertTransition(current.status, nextStatus, resourceTransitions);

  const updated = await prisma.resource.update({
    where: { id: resourceId },
    data: {
      status: nextStatus,
      rejectionReason: rejectionReason ?? null,
      approvedById: nextStatus === "APPROVED" ? user.id : current.approvedById,
      approvedAt: nextStatus === "APPROVED" ? new Date() : current.approvedAt
    }
  });

  await writeAuditLog({
    userId: user.id,
    action: `RESOURCE_${nextStatus}`,
    entity: "Resource",
    entityId: resourceId,
    oldValue: { status: current.status },
    newValue: { status: nextStatus, rejectionReason }
  });

  return updated;
}

export async function toggleFavorite(userId: string, resourceId: string, enabled: boolean) {
  if (enabled) {
    await prisma.favorite.upsert({
      where: {
        userId_resourceId: {
          userId,
          resourceId
        }
      },
      create: {
        userId,
        resourceId
      },
      update: {}
    });
  } else {
    await prisma.favorite.deleteMany({
      where: { userId, resourceId }
    });
  }

  await writeAuditLog({
    userId,
    action: enabled ? "FAVORITE_ADD" : "FAVORITE_REMOVE",
    entity: "Resource",
    entityId: resourceId
  });
}

export async function listSimilarResources(resourceId: string) {
  const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
  if (!resource) {
    return [];
  }

  const similar = await prisma.resource.findMany({
    where: {
      id: { not: resourceId },
      status: "APPROVED",
      OR: [
        { categoryId: resource.categoryId },
        { departmentId: resource.departmentId ?? undefined },
        { facultyId: resource.facultyId ?? undefined }
      ]
    },
    take: 6,
    orderBy: [{ ratingAvg: "desc" }, { viewCount: "desc" }]
  });

  return similar;
}

export async function listReviews(resourceId: string) {
  return prisma.review.findMany({
    where: {
      resourceId,
      status: "APPROVED"
    },
    include: {
      user: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function createReview(user: User, resourceId: string, input: { rating: number; comment?: string }) {
  const review = await prisma.review.upsert({
    where: {
      userId_resourceId: {
        userId: user.id,
        resourceId
      }
    },
    create: {
      userId: user.id,
      resourceId,
      rating: input.rating,
      comment: input.comment,
      status: "APPROVED"
    },
    update: {
      rating: input.rating,
      comment: input.comment,
      status: "APPROVED"
    }
  });

  const aggregate = await prisma.review.aggregate({
    where: {
      resourceId,
      status: "APPROVED"
    },
    _avg: {
      rating: true
    },
    _count: {
      rating: true
    }
  });

  await prisma.resource.update({
    where: { id: resourceId },
    data: {
      ratingAvg: aggregate._avg.rating ?? 0,
      ratingCount: aggregate._count.rating
    }
  });

  return review;
}

export async function listCopies(resourceId: string) {
  return prisma.bookCopy.findMany({
    where: { resourceId },
    orderBy: { createdAt: "desc" }
  });
}

export async function createCopy(
  user: User,
  resourceId: string,
  input: { inventoryNumber: string; barcode: string; shelfLocation?: string }
) {
  if (!["LIBRARIAN", "ADMIN"].includes(user.role)) {
    throw new AppError("FORBIDDEN", "Only librarians can create book copies", 403);
  }

  const copy = await prisma.bookCopy.create({
    data: {
      resourceId,
      inventoryNumber: input.inventoryNumber,
      barcode: input.barcode,
      shelfLocation: input.shelfLocation,
      qrCode: input.barcode
    }
  });

  await writeAuditLog({
    userId: user.id,
    action: "CREATE_COPY",
    entity: "BookCopy",
    entityId: copy.id,
    newValue: copy
  });

  return copy;
}

export async function getCitation(resourceId: string) {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: {
      authors: {
        include: {
          author: true
        }
      }
    }
  });

  if (!resource) {
    throw new AppError("NOT_FOUND", "Resource not found", 404);
  }

  return generateCitations({
    title: resource.title,
    authors: resource.authors.map((item) => item.author.fullName),
    year: resource.publicationYear,
    publisher: resource.publisher,
    isbn: resource.isbn
  });
}

export async function trackView(resourceId: string, userId?: string | null, meta?: { ipAddress?: string | null; userAgent?: string | null }) {
  await prisma.$transaction([
    prisma.resource.update({
      where: { id: resourceId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    }),
    prisma.viewLog.create({
      data: {
        resourceId,
        userId: userId ?? null,
        ipAddress: meta?.ipAddress ?? null,
        userAgent: meta?.userAgent ?? null
      }
    })
  ]);
}

export async function trackDownload(resourceId: string, userId?: string | null, meta?: { ipAddress?: string | null; userAgent?: string | null }) {
  await prisma.$transaction([
    prisma.resource.update({
      where: { id: resourceId },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    }),
    prisma.downloadLog.create({
      data: {
        resourceId,
        userId: userId ?? null,
        ipAddress: meta?.ipAddress ?? null,
        userAgent: meta?.userAgent ?? null
      }
    })
  ]);
}
