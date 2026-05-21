export const dynamic = "force-dynamic";

import Link from "next/link";
import { BookOpenText, BrainCircuit, CalendarDays, LibraryBig, ShieldCheck, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResourceCard } from "@/components/catalog/resource-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { getDictionary } from "@/lib/i18n";
import { getDatabaseHealth } from "@/lib/db/database-health";
import { getOverviewStats } from "@/server/services/statistics-service";
import { listResources } from "@/server/services/resource-service";
import { prisma } from "@/lib/db/prisma";

const quickActions: [string, typeof CalendarDays][] = [
  ["Kitob band qilish", CalendarDays],
  ["QR orqali resurs ochish", Sparkles],
  ["O'qituvchi resurs yuklash", BookOpenText],
  ["Moderator tekshiruvi", BrainCircuit],
  ["O'quv zali bron qilish", LibraryBig],
  ["Citation yaratish", Sparkles]
];

async function getHomeData() {
  try {
    const [stats, latest, departments, rooms] = await Promise.all([
      getOverviewStats(),
      listResources({ sort: "latest", page: 1, limit: 6 }),
      prisma.department.findMany({
        include: {
          _count: {
            select: {
              resources: true,
              users: true
            }
          }
        },
        take: 6
      }),
      prisma.readingRoom.findMany({
        include: {
          seats: true,
          bookings: {
            where: {
              status: {
                in: ["BOOKED", "CHECKED_IN"]
              }
            }
          }
        },
        take: 2
      })
    ]);

    return { stats, latest: latest.items, departments, rooms, databaseOk: true, databaseHint: null as string | null };
  } catch {
    const database = await getDatabaseHealth().catch(() => ({
      ok: false,
      diagnostics: { hint: "Database unavailable" },
      error: "Database unavailable"
    }));

    return {
      stats: {
        totalResources: 0,
        totalUsers: 0,
        activeStudents: 0,
        todayDownloads: 0,
        pendingResources: 0,
        overdueBooks: 0,
        activeLoans: 0,
        readingOccupancy: 0,
        failedLogins: 0
      },
      latest: [],
      departments: [],
      rooms: [],
      databaseOk: false,
      databaseHint: database.error ?? database.diagnostics.hint ?? "Database unavailable"
    };
  }
}

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const { stats, latest, departments, rooms, databaseOk, databaseHint } = await getHomeData();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-20 px-4 py-8 sm:px-6 lg:px-8">
      {!databaseOk ? (
        <Card className="border-danger/30 bg-danger/5 text-danger">
          <p className="text-sm font-semibold">Database connection problem</p>
          <p className="mt-2 text-sm text-foreground">
            Platforma hozir ma'lumotlar bazasiga ulana olmayapti. {databaseHint ?? "Database unavailable"}.
          </p>
        </Card>
      ) : null}
      <section className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
        <div className="space-y-8">
          <span className="inline-flex rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            {dict.home.badge}
          </span>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {dict.home.title}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">{dict.home.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}/catalog`}>
              <Button>Katalogga o'tish</Button>
            </Link>
            <Button variant="secondary">O'quv zalidan joy olish</Button>
            <Button variant="secondary">AI qidiruvni sinash</Button>
          </div>
          <Card className="grid gap-4 p-4 lg:grid-cols-[1fr,auto] lg:items-center">
            <div>
              <p className="text-sm text-muted-foreground">Universal Smart Search</p>
              <p className="mt-1 text-sm text-foreground">{dict.home.searchPlaceholder}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <span className="rounded-full bg-muted px-3 py-2 text-xs font-medium">Barcha resurslar</span>
              <span className="rounded-full bg-muted px-3 py-2 text-xs font-medium">Bosma nusxalar</span>
              <span className="rounded-full bg-muted px-3 py-2 text-xs font-medium">AI tavsiyalar</span>
            </div>
          </Card>
        </div>
        <Card className="relative overflow-hidden border-primary/10 bg-[linear-gradient(135deg,rgba(11,45,77,0.98),rgba(30,90,168,0.84))] text-white">
          <div className="absolute inset-0 bg-grid bg-[size:34px_34px] opacity-10" />
          <div className="relative space-y-5 p-1">
            <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.24em] text-white/70">Smart UniLibrary</p>
              <h2 className="mt-3 text-2xl font-semibold">ATMU uchun yagona akademik platforma</h2>
              <p className="mt-3 text-sm leading-7 text-white/80">
                Elektron katalog, kafedra resurslari, kutubxona aylanmasi va o'quv zali boshqaruvi yagona ekotizimda jamlangan.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Katalog", "Darsliklar, maqolalar va metodik qo'llanmalar"],
                ["Kafedralar", "Har bir bo'lim bo'yicha resurs markazlari"],
                ["Kutubxona aylanmasi", "Band qilish, qaytarish va overdue nazorati"],
                ["Xavfsiz kirish", "Role-based auth va professional boshqaruv"]
              ].map(([title, description], index) => (
                <div key={title} className="rounded-[24px] border border-white/15 bg-white/10 p-5">
                  <div className="mb-3 inline-flex rounded-2xl bg-white/15 p-3">
                    {index === 3 ? <ShieldCheck className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                  </div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-2 text-sm text-white/75">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {quickActions.map(([label, Icon]) => (
          <Card key={label as string} className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium">{label}</p>
          </Card>
        ))}
      </section>

      {databaseOk ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Aktiv foydalanuvchilar" value={stats.totalUsers} />
          <StatCard label="Band qilingan kitoblar" value={stats.activeLoans} />
          <StatCard label="Failed login attempts" value={stats.failedLogins} />
        </section>
      ) : null}

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-primary">Featured resources</p>
            <h2 className="mt-2 text-3xl font-semibold">Yangi resurslar</h2>
          </div>
          <Link href={`/${locale}/catalog`} className="text-sm font-semibold text-primary">
            To'liq katalog
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {latest.map((resource) => (
            <ResourceCard key={resource.id} locale={locale} resource={resource} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-primary">Department resource hub</p>
          <h2 className="mt-2 text-3xl font-semibold">Kafedralar bo'yicha bilim markazlari</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((department) => (
            <Card key={department.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{department.nameUz}</p>
                  <p className="text-sm text-muted-foreground">{department._count.resources} resurs</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
                  {department._count.users} foydalanuvchi
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Eng faol fan va oxirgi yangilanish statistikasi keyingi sprintlarda chuqurlashtiriladi.</p>
              <Link href={`/${locale}/kafedralar/${department.slug}`}>
                <Button variant="secondary">Kafedra kutubxonasiga kirish</Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-primary">Reading room preview</p>
          <h2 className="mt-2 text-3xl font-semibold">O'quv zali bandlik ko'rinishi</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {rooms.map((room) => (
            <Card key={room.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-semibold">{room.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {room.floor} • {room.openingTime} - {room.closingTime}
                  </p>
                </div>
                <span className="rounded-full bg-success/10 px-3 py-2 text-xs font-semibold text-success">
                  {room.capacity - room.bookings.length} bo'sh joy
                </span>
              </div>
              <div className="grid grid-cols-10 gap-2">
                {room.seats.slice(0, 20).map((seat) => {
                  const busy = room.bookings.some((booking) => booking.seatId === seat.id);
                  return (
                    <div
                      key={seat.id}
                      className={`flex h-10 items-center justify-center rounded-xl text-xs font-semibold ${
                        busy ? "bg-danger/15 text-danger" : "bg-success/15 text-success"
                      }`}
                    >
                      {seat.seatNumber}
                    </div>
                  );
                })}
              </div>
              <Button>Joy band qilish</Button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
