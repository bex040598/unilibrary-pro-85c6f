import { prisma } from "@/lib/db/prisma";
import { buildContains } from "@/lib/search/search-utils";

type ResourceQuery = {
  q?: string;
  category?: string;
  genre?: string;
  language?: string;
  facultyId?: string;
  departmentId?: string;
  resourceType?: string;
  accessType?: string;
  hasAvailableCopies?: string;
  rating?: number;
  status?: string;
  page: number;
  limit: number;
  sort: string;
};

const resourceInclude = {
  category: true,
  faculty: true,
  department: true,
  authors: {
    include: {
      author: true
    }
  },
  copies: true,
  reviews: {
    where: {
      status: "APPROVED"
    },
    include: {
      user: true
    }
  }
} as const;

function buildWhere(query: ResourceQuery) {
  const where: Record<string, unknown> = {
    status: query.status ?? "APPROVED"
  };

  if (query.q) {
    where.OR = [
      { title: buildContains(query.q) },
      { abstract: buildContains(query.q) },
      { keywords: buildContains(query.q) },
      {
        authors: {
          some: {
            author: {
              fullName: buildContains(query.q)
            }
          }
        }
      }
    ];
  }

  if (query.category) {
    where.category = { slug: query.category };
  }

  if (query.genre) {
    where.genre = buildContains(query.genre);
  }

  if (query.language) {
    where.language = query.language;
  }

  if (query.facultyId) {
    where.facultyId = query.facultyId;
  }

  if (query.departmentId) {
    where.departmentId = query.departmentId;
  }

  if (query.resourceType) {
    where.resourceType = query.resourceType;
  }

  if (query.accessType) {
    where.accessType = query.accessType;
  }

  if (query.hasAvailableCopies === "true") {
    where.copies = {
      some: {
        status: "AVAILABLE"
      }
    };
  }

  if (query.rating) {
    where.ratingAvg = {
      gte: query.rating
    };
  }

  return where;
}

function buildOrderBy(sort: string) {
  switch (sort) {
    case "popular":
    case "mostViewed":
      return { viewCount: "desc" as const };
    case "downloads":
    case "mostDownloaded":
      return { downloadCount: "desc" as const };
    case "rating":
    case "highestRated":
      return { ratingAvg: "desc" as const };
    case "year":
    case "yearDesc":
      return { publicationYear: "desc" as const };
    case "titleAsc":
      return { title: "asc" as const };
    case "newest":
    default:
      return { createdAt: "desc" as const };
  }
}

export const resourceRepository = {
  async list(query: ResourceQuery) {
    const where = buildWhere(query);
    const [items, total] = await prisma.$transaction([
      prisma.resource.findMany({
        where,
        include: resourceInclude,
        orderBy: buildOrderBy(query.sort),
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      prisma.resource.count({ where })
    ]);

    return { items, total };
  },
  findById(id: string) {
    return prisma.resource.findUnique({
      where: { id },
      include: resourceInclude
    });
  },
  findBySlug(slug: string) {
    return prisma.resource.findUnique({
      where: { slug },
      include: resourceInclude
    });
  },
  getSuggestions(query: string) {
    return prisma.resource.findMany({
      where: {
        status: "APPROVED",
        OR: [{ title: buildContains(query) }, { keywords: buildContains(query) }]
      },
      select: {
        id: true,
        title: true,
        slug: true
      },
      take: 8
    });
  }
};
