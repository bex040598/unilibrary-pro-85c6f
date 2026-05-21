export const dynamic = "force-dynamic";

import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDepartmentBySlug } from "@/server/services/department-service";

export default async function DepartmentDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const department = await getDepartmentBySlug(slug);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-primary">{department.faculty.nameUz}</p>
          <h1 className="mt-2 text-3xl font-semibold">{department.nameUz}</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {department.description ?? "Kafedra tavsifi hozircha kiritilmagan, lekin uning resurslari va aloqa ma'lumotlari quyida ko'rsatilgan."}
          </p>
        </div>
        <Link href={`/${locale}/departments`}>
          <Button variant="secondary">Barcha kafedralar</Button>
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr,1.15fr]">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Aloqa ma'lumotlari</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Kod</p>
              <p className="mt-1 font-medium">{department.code ?? "ATMU"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Mudir</p>
              <p className="mt-1 font-medium">{department.headName ?? "Kiritilmagan"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
              <p className="mt-1 font-medium">{department.email ?? "Kiritilmagan"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Telefon</p>
              <p className="mt-1 font-medium">{department.phone ?? "Kiritilmagan"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Xona</p>
              <p className="mt-1 font-medium">{department.room ?? "Kiritilmagan"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Foydalanuvchilar</p>
              <p className="mt-1 font-medium">{department._count.users}</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Kafedra bo'yicha ko'rsatkichlar</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-surface-soft p-4">
              <p className="text-sm text-muted-foreground">Resurslar soni</p>
              <p className="mt-2 text-2xl font-semibold">{department._count.resources}</p>
            </div>
            <div className="rounded-2xl bg-surface-soft p-4">
              <p className="text-sm text-muted-foreground">Fakultet</p>
              <p className="mt-2 text-lg font-semibold">{department.faculty.nameUz}</p>
            </div>
            <div className="rounded-2xl bg-surface-soft p-4">
              <p className="text-sm text-muted-foreground">Holat</p>
              <p className="mt-2 text-lg font-semibold">{department.isActive ? "Faol" : "Faolsiz"}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Shu kafedraga tegishli resurslar</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tasdiqlangan akademik materiallar ro'yxati.</p>
          </div>
          <Link href={`/${locale}/catalog?departmentId=${department.id}`} className="text-sm font-semibold text-primary">
            Katalogda ochish
          </Link>
        </div>
        {department.resources.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {department.resources.map((resource) => (
              <div key={resource.id} className="rounded-2xl border border-border bg-surface-soft p-4">
                <p className="font-medium">{resource.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {resource.resourceType} • {resource.language}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {resource.authors.map((item) => item.author.fullName).join(", ") || resource.uploadedBy.fullName}
                </p>
                <Link href={`/${locale}/catalog/${resource.slug}`} className="mt-3 inline-block text-sm font-semibold text-primary">
                  Batafsil ko'rish
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface-soft p-10 text-center text-sm text-muted-foreground">
            Hozircha bu kafedraga tasdiqlangan resurs biriktirilmagan.
          </div>
        )}
      </Card>
    </div>
  );
}
