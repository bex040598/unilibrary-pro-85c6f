export const dynamic = "force-dynamic";

import { ResourceCard } from "@/components/catalog/resource-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getDatabaseHealth } from "@/lib/db/database-health";
import { getLocale } from "@/lib/i18n";
import { buildPagination } from "@/lib/utils";
import { resourceQuerySchema } from "@/lib/validation/resource";
import { prisma } from "@/lib/db/prisma";
import { listResources } from "@/server/services/resource-service";

type CatalogSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseCatalogSearchParams(rawSearchParams: CatalogSearchParams) {
  const result = resourceQuerySchema.safeParse({
    q: firstValue(rawSearchParams.q),
    category: firstValue(rawSearchParams.category),
    language: firstValue(rawSearchParams.language),
    facultyId: firstValue(rawSearchParams.facultyId),
    departmentId: firstValue(rawSearchParams.departmentId),
    resourceType: firstValue(rawSearchParams.resourceType),
    accessType: firstValue(rawSearchParams.accessType),
    hasAvailableCopies: firstValue(rawSearchParams.hasAvailableCopies),
    rating: firstValue(rawSearchParams.rating),
    sort: firstValue(rawSearchParams.sort),
    page: firstValue(rawSearchParams.page),
    limit: firstValue(rawSearchParams.limit)
  });

  if (result.success) {
    return result.data;
  }

  return resourceQuerySchema.parse({});
}

async function getCatalogData(query: ReturnType<typeof parseCatalogSearchParams>) {
  const empty = {
    resources: {
      items: [],
      meta: buildPagination(query.page, query.limit, 0)
    },
    categories: [],
    faculties: [],
    departments: [],
    databaseOk: false,
    databaseHint: "Ma'lumotlar bazasi hozircha mavjud emas"
  };

  const health = await getDatabaseHealth().catch(() => ({
    ok: false,
    diagnostics: { hint: "Database unavailable" },
    error: "Database unavailable"
  }));

  if (!health.ok) {
    return {
      ...empty,
      databaseHint: health.error ?? health.diagnostics.hint ?? empty.databaseHint
    };
  }

  try {
    const [resources, categories, faculties, departments] = await Promise.all([
      listResources(query),
      prisma.category.findMany({ orderBy: { nameUz: "asc" } }),
      prisma.faculty.findMany({ orderBy: { nameUz: "asc" } }),
      prisma.department.findMany({ where: { isActive: true }, orderBy: { nameUz: "asc" } })
    ]);

    return {
      resources,
      categories,
      faculties,
      departments,
      databaseOk: true,
      databaseHint: null as string | null
    };
  } catch (error) {
    console.error("[catalog] failed to load page data", error);

    return {
      ...empty,
      databaseHint: "Katalog ma'lumotlarini yuklashda vaqtinchalik muammo yuz berdi"
    };
  }
}

export default async function CatalogPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<CatalogSearchParams>;
}) {
  const { locale } = await params;
  const safeLocale = getLocale(locale);
  const rawSearchParams = await searchParams;
  const parsed = parseCatalogSearchParams(rawSearchParams);
  const { resources, categories, faculties, departments, databaseOk, databaseHint } = await getCatalogData(parsed);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {!databaseOk ? (
        <Card className="mb-6 border-danger/30 bg-danger/5 text-danger">
          <p className="text-sm font-semibold">Database connection problem</p>
          <p className="mt-2 text-sm text-foreground">
            Katalog vaqtincha cheklangan rejimda ishlayapti. {databaseHint ?? "Ma'lumotlar bazasiga ulanib bo'lmadi"}.
          </p>
        </Card>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        <aside className="space-y-4">
          <Card>
            <form className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Qidiruv</label>
                <Input name="q" defaultValue={parsed.q} placeholder="Kalit so'z..." />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Kategoriya</label>
                <Select name="category" defaultValue={parsed.category}>
                  <option value="">Barchasi</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.nameUz}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Til</label>
                <Select name="language" defaultValue={parsed.language}>
                  <option value="">Barchasi</option>
                  <option value="UZ">UZ</option>
                  <option value="RU">RU</option>
                  <option value="EN">EN</option>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Fakultet</label>
                <Select name="facultyId" defaultValue={parsed.facultyId}>
                  <option value="">Barchasi</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.nameUz}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Kafedra</label>
                <Select name="departmentId" defaultValue={parsed.departmentId}>
                  <option value="">Barchasi</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.nameUz}
                    </option>
                  ))}
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Filterlash
              </Button>
            </form>
          </Card>
        </aside>
        <section className="space-y-6">
          <Card className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-primary">Catalog marketplace</p>
              <h1 className="mt-2 text-3xl font-semibold">ATMU resurslar katalogi</h1>
            </div>
            <form className="grid gap-3 sm:grid-cols-[1fr,180px]">
              <Input name="q" defaultValue={parsed.q} placeholder="Qidiruv..." />
              <Select name="sort" defaultValue={parsed.sort}>
                <option value="latest">Eng yangi</option>
                <option value="popular">Mashhur</option>
                <option value="downloads">Downloads</option>
                <option value="rating">Reyting</option>
                <option value="year">Yil</option>
              </Select>
            </form>
          </Card>
          {resources.items.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {resources.items.map((resource) => (
                <ResourceCard key={resource.id} locale={safeLocale} resource={resource} />
              ))}
            </div>
          ) : (
            <Card className="space-y-4 text-center">
              <p className="text-xl font-semibold">Qidiruv bo'yicha resurs topilmadi</p>
              <p className="text-sm text-muted-foreground">
                Filterlarni tozalab ko'ring yoki boshqa kalit so'z bilan qidiring.
              </p>
            </Card>
          )}
          <Card className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Sahifa {resources.meta.page} / {resources.meta.totalPages}
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" disabled={!resources.meta.hasPrev}>
                Oldingi
              </Button>
              <Button variant="secondary" disabled={!resources.meta.hasNext}>
                Keyingi
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
