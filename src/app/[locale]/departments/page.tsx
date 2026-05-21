export const dynamic = "force-dynamic";

import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { prisma } from "@/lib/db/prisma";
import { listDepartments } from "@/server/services/department-service";

type SearchParams = {
  q?: string;
  facultyId?: string;
  page?: string;
};

function buildHref(locale: string, params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return `/${locale}/departments${query ? `?${query}` : ""}`;
}

export default async function DepartmentsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const page = Number(query.page ?? "1");
  const [faculties, result] = await Promise.all([
    prisma.faculty.findMany({ orderBy: { nameUz: "asc" } }),
    listDepartments({
      q: query.q,
      facultyId: query.facultyId,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: 9
    })
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.24em] text-primary">Kafedralar</p>
        <h1 className="text-3xl font-semibold">Universitet kafedralari va ularning resurs markazlari</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Har bir kafedra bo'yicha aloqa ma'lumotlari, mas'ul shaxslar va shu bo'limga tegishli resurslarni bir joyda ko'ring.
        </p>
      </div>

      <Card className="p-4">
        <form className="grid gap-3 md:grid-cols-[1fr,220px,auto]">
          <Input name="q" defaultValue={query.q ?? ""} placeholder="Kafedra nomi yoki kodi bo'yicha qidirish" />
          <Select name="facultyId" defaultValue={query.facultyId ?? ""}>
            <option value="">Barcha fakultetlar</option>
            {faculties.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.nameUz}
              </option>
            ))}
          </Select>
          <Button type="submit">Qidirish</Button>
        </form>
      </Card>

      {result.items.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {result.items.map((department) => (
            <Card key={department.id} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold">{department.nameUz}</p>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {department.code ?? "ATMU"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{department.faculty.nameUz}</p>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Mudir: {department.headName ?? "Hozircha kiritilmagan"}</p>
                <p>Email: {department.email ?? "Hozircha kiritilmagan"}</p>
                <p>Xona: {department.room ?? "Hozircha kiritilmagan"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-surface-soft p-3 text-sm">
                  <p className="text-muted-foreground">Resurslar</p>
                  <p className="mt-1 font-semibold">{department._count.resources}</p>
                </div>
                <div className="rounded-2xl bg-surface-soft p-3 text-sm">
                  <p className="text-muted-foreground">Foydalanuvchilar</p>
                  <p className="mt-1 font-semibold">{department._count.users}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{department.description ?? "Kafedra tavsifi hozircha kiritilmagan."}</p>
              <Link href={`/${locale}/departments/${department.slug}`}>
                <Button variant="secondary" className="w-full">
                  Kafedra sahifasini ochish
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed p-10 text-center text-sm text-muted-foreground">
          Hozircha bu filtr bo'yicha kafedra topilmadi.
        </Card>
      )}

      <div className="flex items-center justify-between gap-3">
        <Link
          href={buildHref(locale, {
            q: query.q,
            facultyId: query.facultyId,
            page: result.meta.page - 1
          })}
          className={!result.meta.hasPrev ? "pointer-events-none opacity-50" : ""}
        >
          <Button variant="secondary">Oldingi</Button>
        </Link>
        <p className="text-sm text-muted-foreground">
          Sahifa {result.meta.page} / {result.meta.totalPages}
        </p>
        <Link
          href={buildHref(locale, {
            q: query.q,
            facultyId: query.facultyId,
            page: result.meta.page + 1
          })}
          className={!result.meta.hasNext ? "pointer-events-none opacity-50" : ""}
        >
          <Button variant="secondary">Keyingi</Button>
        </Link>
      </div>
    </div>
  );
}
