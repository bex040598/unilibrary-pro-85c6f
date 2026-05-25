export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatDate } from "@/lib/utils";
import { listMyLoans } from "@/server/services/loan-service";
import { listMyReservations } from "@/server/services/reservation-service";
import { listMySeatReservations } from "@/server/services/reading-room-service";
import { getUserProfileBundle, getUserStatistics } from "@/server/services/user-profile-service";

const allowedSections = ["favorites", "history", "downloads", "reservations", "loans", "renewals", "reading-room", "profile", "statistics"] as const;

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-border bg-surface-soft p-6 text-sm text-muted-foreground">{text}</div>;
}

export default async function CabinetSectionPage({
  params
}: {
  params: Promise<{ locale: string; section: string }>;
}) {
  const { locale, section } = await params;
  const user = await requirePageRole("student", locale);

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
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Favorites</h1>
        <Card className="space-y-4">
          {favorites.length ? favorites.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4">
              <p className="font-medium">{item.resource.title}</p>
            </div>
          )) : <EmptyState text="Hozircha saqlangan resurslar mavjud emas." />}
        </Card>
      </div>
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
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">History</h1>
        <Card className="space-y-4">
          {history.length ? history.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              <p className="font-medium">{item.resource.title}</p>
              <p className="text-muted-foreground">{formatDate(item.createdAt)}</p>
            </div>
          )) : <EmptyState text="Ko‘rish tarixi hali shakllanmagan." />}
        </Card>
      </div>
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
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Downloads</h1>
        <Card className="space-y-4">
          {downloads.length ? downloads.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              <p className="font-medium">{item.resource.title}</p>
              <p className="text-muted-foreground">{formatDate(item.createdAt)}</p>
            </div>
          )) : <EmptyState text="Yuklab olingan resurslar hali mavjud emas." />}
        </Card>
      </div>
    );
  }

  if (section === "reservations") {
    const reservations = await listMyReservations(user.id);
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Reservations</h1>
        <Card className="space-y-4">
          {reservations.length ? reservations.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              <p className="font-medium">{item.resource.title}</p>
              <p className="text-muted-foreground">{item.status}</p>
            </div>
          )) : <EmptyState text="Hozircha bron yozuvlari mavjud emas." />}
        </Card>
      </div>
    );
  }

  if (section === "loans") {
    const loans = await listMyLoans(user.id);
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Loans</h1>
        <Card className="space-y-4">
          {loans.length ? loans.map((loan) => (
            <div key={loan.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              <p className="font-medium">{loan.resource.title}</p>
              <p className="text-muted-foreground">
                {loan.status} - {formatDate(loan.dueAt)}
              </p>
            </div>
          )) : <EmptyState text="Faol yoki yakunlangan aylanma yozuvlari yo‘q." />}
        </Card>
      </div>
    );
  }

  if (section === "renewals") {
    const renewals = await prisma.renewalRequest.findMany({
      where: { userId: user.id },
      include: { loan: { include: { resource: true } } },
      orderBy: { createdAt: "desc" }
    });

    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Renewals</h1>
        <Card className="space-y-4">
          {renewals.length ? renewals.map((renewal) => (
            <div key={renewal.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              <p className="font-medium">{renewal.loan.resource.title}</p>
              <p className="text-muted-foreground">{renewal.status}</p>
            </div>
          )) : <EmptyState text="Qayta uzaytirish so‘rovlari mavjud emas." />}
        </Card>
      </div>
    );
  }

  if (section === "reading-room") {
    const items = await listMySeatReservations(user.id);
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Reading room</h1>
        <Card className="space-y-4">
          {items.length ? items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              <p className="font-medium">{item.room.name}</p>
              <p className="text-muted-foreground">
                {item.seat.seatNumber} - {item.status}
              </p>
            </div>
          )) : <EmptyState text="O‘quv zali bronlari hali mavjud emas." />}
        </Card>
      </div>
    );
  }

  if (section === "statistics") {
    const stats = await getUserStatistics(user.id);
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Statistikam</h1>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Ko‘rishlar" value={stats.views} />
          <StatCard label="Yuklab olishlar" value={stats.downloads} />
          <StatCard label="Saqlanganlar" value={stats.favorites} />
          <StatCard label="Bronlar" value={stats.reservations} />
          <StatCard label="Sharhlar" value={stats.reviews} />
        </div>
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Eng ko‘p o‘qilgan yo‘nalishlarim</h2>
          {stats.topCategories.length ? stats.topCategories.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              <p className="font-medium">{item.label}</p>
              <p className="text-muted-foreground">{item.value}</p>
            </div>
          )) : <EmptyState text="Hozircha statistik ma’lumot yetarli emas." />}
        </Card>
      </div>
    );
  }

  const bundle = await getUserProfileBundle(user.id);
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Profil</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Saqlanganlar" value={bundle.summary.favoritesCount} />
        <StatCard label="Yuklab olishlar" value={bundle.summary.downloadsCount} />
        <StatCard label="Ko‘rishlar" value={bundle.summary.viewsCount} />
        <StatCard label="Bronlar" value={bundle.summary.reservationsCount} />
      </div>
      <Card className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Ism familiya</p>
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
      </Card>
    </div>
  );
}
