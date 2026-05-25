export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { listMyLoans } from "@/server/services/loan-service";
import { listMyReservations } from "@/server/services/reservation-service";
import { listMySeatReservations } from "@/server/services/reading-room-service";
import { getStudentDashboard } from "@/server/services/student-dashboard-service";
import { getUserProfileBundle, getUserStatistics } from "@/server/services/user-profile-service";

const allowedSections = [
  "favorites",
  "history",
  "downloads",
  "recommendations",
  "reservations",
  "loans",
  "renewals",
  "reading-room",
  "profile",
  "statistics"
] as const;

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-border bg-surface-soft p-6 text-sm text-muted-foreground">{text}</div>;
}

function PageShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">{title}</h1>
      {children}
    </div>
  );
}

export default async function CabinetSectionPage({
  params
}: {
  params: Promise<{ locale: string; section: string }>;
}) {
  const { locale, section } = await params;
  const user = await requirePageRole("cabinet", locale);

  if (!allowedSections.includes(section as (typeof allowedSections)[number])) {
    notFound();
  }

  if (section === "favorites") {
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: { resource: true },
      orderBy: { createdAt: "desc" }
    });

    return (
      <PageShell title="Saqlangan resurslar">
        <Card className="space-y-4">
          {favorites.length ? (
            favorites.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4">
                <Link href={`/${locale}/catalog/${item.resource.slug}`} className="font-medium text-primary">
                  {item.resource.title}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">Saqlangan sana: {formatDate(item.createdAt)}</p>
              </div>
            ))
          ) : (
            <EmptyState text="Hozircha saqlangan resurslar mavjud emas." />
          )}
        </Card>
      </PageShell>
    );
  }

  if (section === "history") {
    const history = await prisma.viewLog.findMany({
      where: { userId: user.id },
      include: { resource: true },
      orderBy: { createdAt: "desc" },
      take: 30
    });

    return (
      <PageShell title="Ko‘rish tarixi">
        <Card className="space-y-4">
          {history.length ? (
            history.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <Link href={`/${locale}/catalog/${item.resource.slug}`} className="font-medium text-primary">
                  {item.resource.title}
                </Link>
                <p className="mt-1 text-muted-foreground">{formatDate(item.createdAt)}</p>
              </div>
            ))
          ) : (
            <EmptyState text="Ko‘rish tarixi hali shakllanmagan." />
          )}
        </Card>
      </PageShell>
    );
  }

  if (section === "downloads") {
    const downloads = await prisma.downloadLog.findMany({
      where: { userId: user.id },
      include: { resource: true },
      orderBy: { createdAt: "desc" },
      take: 30
    });

    return (
      <PageShell title="Yuklab olingan resurslar">
        <Card className="space-y-4">
          {downloads.length ? (
            downloads.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <Link href={`/${locale}/catalog/${item.resource.slug}`} className="font-medium text-primary">
                  {item.resource.title}
                </Link>
                <p className="mt-1 text-muted-foreground">
                  Format: {item.resource.fileFormat ?? "Noma’lum"} • Sana: {formatDate(item.createdAt)}
                </p>
              </div>
            ))
          ) : (
            <EmptyState text="Yuklab olingan resurslar hali mavjud emas." />
          )}
        </Card>
      </PageShell>
    );
  }

  if (section === "recommendations") {
    const dashboard = await getStudentDashboard(user.id);
    return (
      <PageShell title="Tavsiya etilgan resurslar">
        <Card className="space-y-4">
          {dashboard.recommendations.length ? (
            dashboard.recommendations.map((resource) => (
              <div key={resource.id} className="rounded-2xl border border-border bg-surface-soft p-4">
                <Link href={`/${locale}/catalog/${resource.slug}`} className="font-medium text-primary">
                  {resource.title}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  {resource.department?.nameUz ?? "Kafedra biriktirilmagan"} • {resource.category.nameUz}
                </p>
              </div>
            ))
          ) : (
            <EmptyState text="Hozircha sizga mos tavsiyalar topilmadi." />
          )}
        </Card>
      </PageShell>
    );
  }

  if (section === "reservations") {
    const reservations = await listMyReservations(user.id);
    return (
      <PageShell title="Band qilingan resurslar">
        <Card className="space-y-4">
          {reservations.length ? (
            reservations.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <p className="font-medium">{item.resource.title}</p>
                <p className="text-muted-foreground">
                  Holat: {item.status} • Olib ketish sanasi: {formatDate(item.pickupDate)}
                </p>
              </div>
            ))
          ) : (
            <EmptyState text="Hozircha band qilingan resurslar mavjud emas." />
          )}
        </Card>
      </PageShell>
    );
  }

  if (section === "loans") {
    const loans = await listMyLoans(user.id);
    return (
      <PageShell title="Mening aylanmalarim">
        <Card className="space-y-4">
          {loans.length ? (
            loans.map((loan) => (
              <div key={loan.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <p className="font-medium">{loan.resource.title}</p>
                <p className="text-muted-foreground">
                  Holat: {loan.status} • Qaytarish muddati: {formatDate(loan.dueAt)}
                </p>
              </div>
            ))
          ) : (
            <EmptyState text="Faol yoki yakunlangan aylanma yozuvlari yo‘q." />
          )}
        </Card>
      </PageShell>
    );
  }

  if (section === "renewals") {
    const renewals = await prisma.renewalRequest.findMany({
      where: { userId: user.id },
      include: { loan: { include: { resource: true } } },
      orderBy: { createdAt: "desc" }
    });

    return (
      <PageShell title="Muddat uzaytirish so‘rovlari">
        <Card className="space-y-4">
          {renewals.length ? (
            renewals.map((renewal) => (
              <div key={renewal.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <p className="font-medium">{renewal.loan.resource.title}</p>
                <p className="text-muted-foreground">Holat: {renewal.status}</p>
              </div>
            ))
          ) : (
            <EmptyState text="Muddat uzaytirish so‘rovlari mavjud emas." />
          )}
        </Card>
      </PageShell>
    );
  }

  if (section === "reading-room") {
    const items = await listMySeatReservations(user.id);
    return (
      <PageShell title="O‘quv zali bronlari">
        <Card className="space-y-4">
          {items.length ? (
            items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <p className="font-medium">{item.room.name}</p>
                <p className="text-muted-foreground">
                  Joy: {item.seat.seatNumber} • Holat: {item.status}
                </p>
              </div>
            ))
          ) : (
            <EmptyState text="O‘quv zali bronlari hali mavjud emas." />
          )}
        </Card>
      </PageShell>
    );
  }

  if (section === "statistics") {
    const stats = await getUserStatistics(user.id);
    return (
      <PageShell title="Mening statistikam">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Ko‘rishlar" value={stats.views} />
          <StatCard label="Yuklab olishlar" value={stats.downloads} />
          <StatCard label="Saqlanganlar" value={stats.favorites} />
          <StatCard label="Bronlar" value={stats.reservations} />
          <StatCard label="Sharhlar" value={stats.reviews} />
        </div>
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Eng faol kategoriyalarim</h2>
          {stats.topCategories.length ? (
            stats.topCategories.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <p className="font-medium">{item.label}</p>
                <p className="text-muted-foreground">{item.value}</p>
              </div>
            ))
          ) : (
            <EmptyState text="Hozircha statistik ma’lumot yetarli emas." />
          )}
        </Card>
      </PageShell>
    );
  }

  const bundle = await getUserProfileBundle(user.id);
  return (
    <PageShell title="Profil">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Saqlanganlar" value={bundle.summary.favoritesCount} />
        <StatCard label="Yuklab olishlar" value={bundle.summary.downloadsCount} />
        <StatCard label="Ko‘rishlar" value={bundle.summary.viewsCount} />
        <StatCard label="Bronlar" value={bundle.summary.reservationsCount} />
      </div>
      <Card className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">F.I.Sh.</p>
          <p className="mt-1 font-medium">{bundle.summary.fullName}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
          <p className="mt-1 font-medium">{bundle.summary.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Fakultet</p>
          <p className="mt-1 font-medium">{bundle.summary.faculty ?? "Kiritilmagan"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Kafedra / yo‘nalish</p>
          <p className="mt-1 font-medium">{bundle.summary.department ?? "Kiritilmagan"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Guruh</p>
          <p className="mt-1 font-medium">{bundle.summary.group ?? "Kiritilmagan"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Student ID</p>
          <p className="mt-1 font-medium">{bundle.summary.studentNumber ?? "Kiritilmagan"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Rol</p>
          <p className="mt-1 font-medium">{bundle.summary.role}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Oxirgi kirish</p>
          <p className="mt-1 font-medium">
            {bundle.summary.lastLoginAt ? formatDate(bundle.summary.lastLoginAt) : "Ma’lumot yo‘q"}
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
