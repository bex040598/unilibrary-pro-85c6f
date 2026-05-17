export const dynamic = "force-dynamic";

import { resourceQuerySchema } from "@/lib/validation/resource";
import { listResources } from "@/server/services/resource-service";
import { prisma } from "@/lib/db/prisma";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ResourceCard } from "@/components/catalog/resource-card";
import { Button } from "@/components/ui/button";

export default async function CatalogPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const rawSearchParams = await searchParams;
  const parsed = resourceQuerySchema.parse({
    ...rawSearchParams,
    q: Array.isArray(rawSearchParams.q) ? rawSearchParams.q[0] : rawSearchParams.q,
    category: Array.isArray(rawSearchParams.category) ? rawSearchParams.category[0] : rawSearchParams.category,
    language: Array.isArray(rawSearchParams.language) ? rawSearchParams.language[0] : rawSearchParams.language,
    facultyId: Array.isArray(rawSearchParams.facultyId) ? rawSearchParams.facultyId[0] : rawSearchParams.facultyId,
    departmentId: Array.isArray(rawSearchParams.departmentId) ? rawSearchParams.departmentId[0] : rawSearchParams.departmentId,
    resourceType: Array.isArray(rawSearchParams.resourceType) ? rawSearchParams.resourceType[0] : rawSearchParams.resourceType,
    accessType: Array.isArray(rawSearchParams.accessType) ? rawSearchParams.accessType[0] : rawSearchParams.accessType,
    sort: Array.isArray(rawSearchParams.sort) ? rawSearchParams.sort[0] : rawSearchParams.sort,
    hasAvailableCopies: Array.isArray(rawSearchParams.hasAvailableCopies)
      ? rawSearchParams.hasAvailableCopies[0]
      : rawSearchParams.hasAvailableCopies,
    page: Array.isArray(rawSearchParams.page) ? rawSearchParams.page[0] : rawSearchParams.page,
    limit: Array.isArray(rawSearchParams.limit) ? rawSearchParams.limit[0] : rawSearchParams.limit
  });

  const [resources, categories, faculties, departments] = await Promise.all([
    listResources(parsed),
    prisma.category.findMany({ orderBy: { nameUz: "asc" } }),
    prisma.faculty.findMany({ orderBy: { nameUz: "asc" } }),
    prisma.department.findMany({ orderBy: { nameUz: "asc" } })
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
                <ResourceCard key={resource.id} locale={locale} resource={resource} />
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
