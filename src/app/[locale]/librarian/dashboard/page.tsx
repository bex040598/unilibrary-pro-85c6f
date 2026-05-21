export const dynamic = "force-dynamic";

import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { formatDate } from "@/lib/utils";
import { getLibrarianDashboard } from "@/server/services/librarian-dashboard-service";

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-border bg-surface-soft p-6 text-sm text-muted-foreground">{text}</div>;
}

export default async function LibrarianDashboardPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requirePageRole("librarian", locale);
  const dashboard = await getLibrarianDashboard(user.id);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-primary">Kutubxonachi paneli</p>
          <h1 className="mt-2 text-3xl font-semibold">Katalog va aylanma nazorati</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Resurslar, bronlar, kitob qaytarishlar va kafedra bo'yicha akademik resurslar shu panel orqali boshqariladi.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/librarian/resources/new`}>
            <Button>Resurs qo'shish</Button>
          </Link>
          <Link href={`/${locale}/librarian/reservations`}>
            <Button variant="secondary">Bronlarni boshqarish</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Resurslar" value={dashboard.resources.length} />
        <StatCard label="Faol loanlar" value={dashboard.borrowings.filter((loan) => loan.status !== "RETURNED").length} />
        <StatCard label="Overdue" value={dashboard.overdue.length} />
        <StatCard label="Pending approvals" value={dashboard.pendingResources.length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr,1.15fr]">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Profil</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Ism familiya</p>
              <p className="mt-1 font-medium">{dashboard.profile.fullName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
              <p className="mt-1 font-medium">{dashboard.profile.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Lavozim</p>
              <p className="mt-1 font-medium">{dashboard.profile.position ?? "Kutubxonachi"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Mas'ul bo'lim</p>
              <p className="mt-1 font-medium">{dashboard.profile.department ?? "Biriktirilmagan"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Telefon</p>
              <p className="mt-1 font-medium">{dashboard.profile.phone ?? "Kiritilmagan"}</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Kitob berish va qaytarish</h2>
            <Link href={`/${locale}/librarian/returns`} className="text-sm font-semibold text-primary">
              Return queue
            </Link>
          </div>
          {dashboard.borrowings.length ? (
            <div className="space-y-3">
              {dashboard.borrowings.slice(0, 5).map((loan) => (
                <div key={loan.id} className="rounded-2xl border border-border bg-surface-soft p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{loan.resource.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {loan.user.fullName} • Qaytarish: {formatDate(loan.dueAt)}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{loan.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Hozircha faol aylanma yozuvlari topilmadi." />
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Katalog boshqaruvi</h2>
            <Link href={`/${locale}/librarian/book-copies`} className="text-sm font-semibold text-primary">
              Nusxalar
            </Link>
          </div>
          {dashboard.resources.length ? (
            dashboard.resources.slice(0, 4).map((resource) => (
              <div key={resource.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <p className="font-medium">{resource.title}</p>
                <p className="mt-1 text-muted-foreground">
                  {resource.department?.nameUz ?? "Kafedra biriktirilmagan"} • {resource.status}
                </p>
              </div>
            ))
          ) : (
            <EmptyState text="Hozircha katalog resurslari mavjud emas." />
          )}
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Bronlar</h2>
            <Link href={`/${locale}/librarian/reservations`} className="text-sm font-semibold text-primary">
              Barchasi
            </Link>
          </div>
          {dashboard.reservations.length ? (
            dashboard.reservations.slice(0, 4).map((reservation) => (
              <div key={reservation.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <p className="font-medium">{reservation.resource.title}</p>
                <p className="mt-1 text-muted-foreground">
                  {reservation.user.fullName} • {reservation.status}
                </p>
              </div>
            ))
          ) : (
            <EmptyState text="Hozircha bronlar yo'q." />
          )}
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Yangi yuklangan resurslar</h2>
            <Link href={`/${locale}/moderator/pending`} className="text-sm font-semibold text-primary">
              Moderator navbati
            </Link>
          </div>
          {dashboard.pendingResources.length ? (
            dashboard.pendingResources.slice(0, 4).map((resource) => (
              <div key={resource.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <p className="font-medium">{resource.title}</p>
                <p className="mt-1 text-muted-foreground">
                  {resource.uploadedBy.fullName} • {resource.department?.nameUz ?? "Kafedra yo'q"}
                </p>
              </div>
            ))
          ) : (
            <EmptyState text="Hozircha tasdiq kutayotgan resurslar yo'q." />
          )}
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Hisobotlar va nazorat</h2>
            <p className="mt-1 text-sm text-muted-foreground">Eng ko'p o'qilgan resurslar, faol talabalar va kechikishlar ko'rsatkichi.</p>
          </div>
          <Link href={`/${locale}/librarian/reports`} className="text-sm font-semibold text-primary">
            To'liq hisobot
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface-soft p-4">
            <p className="text-sm text-muted-foreground">Eng ko'p o'qilgan resurs</p>
            <p className="mt-2 font-semibold">{dashboard.reports.mostViewedResources[0]?.title ?? "Hozircha ma'lumot yo'q"}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface-soft p-4">
            <p className="text-sm text-muted-foreground">Faol talabalar</p>
            <p className="mt-2 font-semibold">{dashboard.reports.activeStudents}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface-soft p-4">
            <p className="text-sm text-muted-foreground">Kechiktirilgan kitoblar</p>
            <p className="mt-2 font-semibold">{dashboard.reports.overdueCount}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
