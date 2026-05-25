export const dynamic = "force-dynamic";

import Link from "next/link";

import { ResourceCard } from "@/components/catalog/resource-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getDatabaseHealth } from "@/lib/db/database-health";
import { prisma } from "@/lib/db/prisma";
import { getDictionary, getLocale } from "@/lib/i18n";
import { buildPagination } from "@/lib/utils";
import { resourceQuerySchema } from "@/lib/validation/resource";
import { listResources } from "@/server/services/resource-service";

type SearchParams = Record<string, string | string[] | undefined>;

const featuredChips = [
  { label: "Badiiy", slug: "badiiy-adabiyotlar" },
  { label: "Jahon adabiyoti", slug: "jahon-adabiyotlari" },
  { label: "Darslik", slug: "darsliklar" },
  { label: "O‘quv qo‘llanma", slug: "oquv-qollanmalar" },
  { label: "Monografiya", slug: "monografiyalar" },
  { label: "IT", slug: "raqamli-texnologiyalar" },
  { label: "Kiberxavfsizlik", slug: "kiberxavfsizlik" },
  { label: "AI", slug: "suniy-intellekt" },
  { label: "Iqtisodiyot", slug: "iqtisodiyot" }
];

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeQuery(searchParams: SearchParams) {
  const parsed = resourceQuerySchema.safeParse({
    q: firstValue(searchParams.q),
    category: firstValue(searchParams.category),
    genre: firstValue(searchParams.genre),
    language: firstValue(searchParams.language),
    facultyId: firstValue(searchParams.facultyId),
    departmentId: firstValue(searchParams.departmentId),
    resourceType: firstValue(searchParams.resourceType),
    accessType: firstValue(searchParams.accessType),
    hasAvailableCopies: firstValue(searchParams.hasAvailableCopies),
    rating: firstValue(searchParams.rating),
    sort: firstValue(searchParams.sort) ?? "mostViewed",
    page: firstValue(searchParams.page),
    limit: firstValue(searchParams.limit) ?? "12"
  });

  return parsed.success ? parsed.data : resourceQuerySchema.parse({ sort: "mostViewed" });
}

function normalizeResource(resource: {
  id: string;
  slug: string;
  title: string;
  genre: string | null;
  publicationYear: number | null;
  language: string;
  resourceType: string;
  fileFormat: string | null;
  ratingAvg: number;
  viewCount: number;
  downloadCount: number;
  accessType: string;
  status: string;
  category: { nameUz: string } | null;
  department: { nameUz: string } | null;
  authors: Array<{ author: { fullName: string } }>;
  copies: Array<{ status: string }>;
}) {
  return {
    ...resource,
    authorNames: resource.authors.map((item) => item.author.fullName),
    availableCopies: resource.copies.filter((copy) => copy.status === "AVAILABLE").length
  };
}

export default async function BooksPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const safeLocale = getLocale(locale);
  const dict = getDictionary(safeLocale);
  const query = normalizeQuery(await searchParams);
  const health = await getDatabaseHealth().catch(() => ({
    ok: false,
    diagnostics: { hint: "Database unavailable" },
    error: "Database unavailable"
  }));

  let categories: Array<{ id: string; nameUz: string; slug: string }> = [];
  let books = { items: [] as Array<ReturnType<typeof normalizeResource>>, meta: buildPagination(query.page, query.limit, 0) };
  let recommendedToday: Array<ReturnType<typeof normalizeResource>> = [];
  let popularStudents: Array<ReturnType<typeof normalizeResource>> = [];
  let newArrivals: Array<ReturnType<typeof normalizeResource>> = [];
  let teacherRecommendations: Array<ReturnType<typeof normalizeResource>> = [];

  if (health.ok) {
    const [categoryRows, result, recommendedRows, popularRows, newRows, teacherRows] = await Promise.all([
      prisma.category.findMany({ orderBy: { nameUz: "asc" } }),
      listResources(query),
      prisma.resource.findMany({
        where: { status: "APPROVED", resourceType: { in: ["TEXTBOOK", "STUDY_GUIDE", "MONOGRAPH"] } },
        include: { category: true, department: true, authors: { include: { author: true } }, copies: true },
        orderBy: [{ ratingAvg: "desc" }, { viewCount: "desc" }],
        take: 4
      }),
      prisma.resource.findMany({
        where: { status: "APPROVED" },
        include: { category: true, department: true, authors: { include: { author: true } }, copies: true },
        orderBy: [{ downloadCount: "desc" }, { viewCount: "desc" }],
        take: 4
      }),
      prisma.resource.findMany({
        where: { status: "APPROVED" },
        include: { category: true, department: true, authors: { include: { author: true } }, copies: true },
        orderBy: { createdAt: "desc" },
        take: 4
      }),
      prisma.resource.findMany({
        where: { status: "APPROVED", uploadedBy: { role: "TEACHER" } },
        include: { category: true, department: true, authors: { include: { author: true } }, copies: true },
        orderBy: [{ ratingAvg: "desc" }, { createdAt: "desc" }],
        take: 4
      })
    ]);

    categories = categoryRows;
    books = { items: result.items.map((item) => item as ReturnType<typeof normalizeResource>), meta: result.meta };
    recommendedToday = recommendedRows.map(normalizeResource);
    popularStudents = popularRows.map(normalizeResource);
    newArrivals = newRows.map(normalizeResource);
    teacherRecommendations = teacherRows.map(normalizeResource);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.24em] text-primary">{dict.nav.books}</p>
        <h1 className="text-4xl font-semibold">{dict.books.title}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{dict.books.subtitle}</p>
      </div>

      {!health.ok ? (
        <Card className="border-danger/30 bg-danger/5 text-danger">
          <p className="text-sm font-semibold">Database connection problem</p>
          <p className="mt-2 text-sm text-foreground">
            Kitoblar bo‘limi vaqtincha cheklangan rejimda ishlayapti. {health.error ?? health.diagnostics.hint}
          </p>
        </Card>
      ) : null}

      <Card className="space-y-4 p-4">
        <form className="grid gap-3 md:grid-cols-[1.2fr,180px,180px,180px,auto]">
          <Input name="q" defaultValue={query.q} placeholder={dict.books.searchPlaceholder} />
          <Select name="category" defaultValue={query.category}>
            <option value="">Barcha kategoriyalar</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.nameUz}
              </option>
            ))}
          </Select>
          <Input name="genre" defaultValue={query.genre} placeholder="Janr" />
          <Select name="sort" defaultValue={query.sort}>
            <option value="mostViewed">Eng ko‘p ko‘rilgan</option>
            <option value="mostDownloaded">Eng ko‘p yuklangan</option>
            <option value="highestRated">Eng yuqori baholangan</option>
            <option value="newest">Eng yangi</option>
            <option value="titleAsc">Nom A-Z</option>
            <option value="yearDesc">Yil bo‘yicha</option>
          </Select>
          <Button type="submit">Qidirish</Button>
        </form>
        <div className="flex flex-wrap gap-2">
          {featuredChips.map((chip) => (
            <Link key={chip.slug} href={`/${safeLocale}/books?category=${chip.slug}`} className="rounded-full bg-surface-soft px-4 py-2 text-xs font-medium">
              {chip.label}
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[280px,1fr]">
        <aside className="space-y-4">
          <Card className="space-y-4 p-4">
            <h2 className="text-lg font-semibold">Filterlar</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Kategoriya</p>
              <p>Janr</p>
              <p>Muallif</p>
              <p>Til</p>
              <p>Nashr yili</p>
              <p>Resurs turi</p>
              <p>Fakultet</p>
              <p>Kafedra</p>
              <p>Format</p>
              <p>Bosma nusxa mavjudligi</p>
              <p>Reyting</p>
            </div>
          </Card>
        </aside>
        <section className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {books.items.length ? (
              books.items.map((resource) => <ResourceCard key={resource.id} locale={safeLocale} resource={resource} />)
            ) : (
              <Card className="col-span-full border-dashed p-10 text-center text-sm text-muted-foreground">Hozircha kitoblar topilmadi.</Card>
            )}
          </div>
          <Card className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Sahifa {books.meta.page} / {books.meta.totalPages}
            </p>
            <p className="text-sm text-muted-foreground">Jami: {books.meta.total}</p>
          </Card>
        </section>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">{dict.books.recommendedToday}</h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {recommendedToday.map((resource) => (
            <ResourceCard key={resource.id} locale={safeLocale} resource={resource} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-4 p-4">
          <h3 className="text-xl font-semibold">{dict.books.mostViewed}</h3>
          <div className="space-y-3">
            {popularStudents.map((resource) => (
              <div key={resource.id} className="rounded-2xl bg-surface-soft p-4">
                <p className="font-medium">{resource.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{resource.authorNames?.join(", ")}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-4 p-4">
          <h3 className="text-xl font-semibold">{dict.books.newArrivals}</h3>
          <div className="space-y-3">
            {newArrivals.map((resource) => (
              <div key={resource.id} className="rounded-2xl bg-surface-soft p-4">
                <p className="font-medium">{resource.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{resource.category?.nameUz ?? "Resurs"}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-4 p-4">
          <h3 className="text-xl font-semibold">{dict.books.teacherRecommendations}</h3>
          <div className="space-y-3">
            {teacherRecommendations.map((resource) => (
              <div key={resource.id} className="rounded-2xl bg-surface-soft p-4">
                <p className="font-medium">{resource.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{resource.department?.nameUz ?? "ATMU"}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
