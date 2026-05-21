export const dynamic = "force-dynamic";

import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { getStudentDashboard } from "@/server/services/student-dashboard-service";
import { formatDate } from "@/lib/utils";

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-border bg-surface-soft p-6 text-sm text-muted-foreground">{text}</div>;
}

export default async function StudentDashboardPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requirePageRole("student", locale);
  const dashboard = await getStudentDashboard(user.id);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-primary">Talaba kabineti</p>
          <h1 className="mt-2 text-3xl font-semibold">O'qish va kutubxona faoliyatingiz bir joyda</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Profil, band qilingan resurslar, qaytarish muddati va o'quv zali bronlari shu yerda jamlangan.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/catalog`}>
            <Button>Katalogga o'tish</Button>
          </Link>
          <Link href={`/${locale}/cabinet/profile`}>
            <Button variant="secondary">Profilni ko'rish</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Saqlangan resurslar" value={dashboard.resources.favorites.length} />
        <StatCard label="Faol loanlar" value={dashboard.borrowings.activeCount} />
        <StatCard label="Kechikkan kitoblar" value={dashboard.borrowings.overdueCount} />
        <StatCard label="Faol bronlar" value={dashboard.bookings.filter((item) => ["BOOKED", "CHECKED_IN"].includes(item.status)).length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Profil ma'lumotlari</h2>
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
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Guruh</p>
              <p className="mt-1 font-medium">{dashboard.profile.group ?? "Hozircha kiritilmagan"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Fakultet</p>
              <p className="mt-1 font-medium">{dashboard.profile.faculty ?? "Hozircha kiritilmagan"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Yo'nalish</p>
              <p className="mt-1 font-medium">{dashboard.profile.direction ?? "Hozircha kiritilmagan"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Student ID</p>
              <p className="mt-1 font-medium">{dashboard.profile.studentNumber ?? "Hozircha kiritilmagan"}</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Kutubxona aylanmasi</h2>
            <Link href={`/${locale}/cabinet/loans`} className="text-sm font-semibold text-primary">
              Barchasini ko'rish
            </Link>
          </div>
          {dashboard.borrowings.items.length ? (
            <div className="space-y-3">
              {dashboard.borrowings.items.slice(0, 4).map((loan) => (
                <div key={loan.id} className="rounded-2xl border border-border bg-surface-soft p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{loan.resource.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Qaytarish muddati: {formatDate(loan.dueAt)}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{loan.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Hozircha olingan kitoblar mavjud emas." />
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Mening resurslarim</h2>
            <Link href={`/${locale}/cabinet/favorites`} className="text-sm font-semibold text-primary">
              Batafsil
            </Link>
          </div>
          {dashboard.resources.favorites.length ? (
            dashboard.resources.favorites.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <p className="font-medium">{item.resource.title}</p>
                <p className="mt-1 text-muted-foreground">Saqlangan resurs</p>
              </div>
            ))
          ) : (
            <EmptyState text="Hozircha saqlangan kitoblar yo'q." />
          )}
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">O'quv zali</h2>
            <Link href={`/${locale}/cabinet/reading-room`} className="text-sm font-semibold text-primary">
              Bronlarni ko'rish
            </Link>
          </div>
          {dashboard.bookings.length ? (
            dashboard.bookings.slice(0, 4).map((booking) => (
              <div key={booking.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <p className="font-medium">{booking.room.name}</p>
                <p className="mt-1 text-muted-foreground">
                  Joy: {booking.seat.seatNumber} • Holat: {booking.status}
                </p>
              </div>
            ))
          ) : (
            <EmptyState text="Hozircha o'quv zali bronlari mavjud emas." />
          )}
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Bildirishnomalar</h2>
            <Link href={`/${locale}/cabinet/notifications`} className="text-sm font-semibold text-primary">
              Hammasi
            </Link>
          </div>
          {dashboard.notifications.length ? (
            dashboard.notifications.slice(0, 4).map((notification) => (
              <div key={notification.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <p className="font-medium">{notification.title}</p>
                <p className="mt-1 text-muted-foreground">{notification.message}</p>
              </div>
            ))
          ) : (
            <EmptyState text="Hozircha bildirishnomalar mavjud emas." />
          )}
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">AI tavsiyalari</h2>
            <p className="mt-1 text-sm text-muted-foreground">Yo'nalishingiz va ko'rish tarixingiz asosida tavsiya qilingan resurslar.</p>
          </div>
          <Link href={`/${locale}/catalog`} className="text-sm font-semibold text-primary">
            Katalogni ko'rish
          </Link>
        </div>
        {dashboard.recommendations.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dashboard.recommendations.map((resource) => (
              <div key={resource.id} className="rounded-2xl border border-border bg-surface-soft p-4">
                <p className="font-medium">{resource.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {resource.department?.nameUz ?? "Kafedra biriktirilmagan"} • {resource.category.nameUz}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="Hozircha sizga mos tavsiyalar topilmadi." />
        )}
      </Card>
    </div>
  );
}
