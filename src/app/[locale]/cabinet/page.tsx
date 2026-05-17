export const dynamic = "force-dynamic";

import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { listMyLoans, listOverdueLoans } from "@/server/services/loan-service";
import { listMyReservations } from "@/server/services/reservation-service";
import { listMySeatReservations } from "@/server/services/reading-room-service";
import { prisma } from "@/lib/db/prisma";

export default async function CabinetPage() {
  const user = await requirePageRole("cabinet");
  const [favorites, reservations, loans, seatReservations, overdue] = await Promise.all([
    prisma.favorite.count({ where: { userId: user.id } }),
    listMyReservations(user.id),
    listMyLoans(user.id),
    listMySeatReservations(user.id),
    listOverdueLoans()
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-primary">Student cabinet</p>
        <h1 className="mt-2 text-3xl font-semibold">Mening kutubxona kabinetim</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Saqlangan resurslar" value={favorites} />
        <StatCard label="Aktiv reservation" value={reservations.filter((item) => item.status === "APPROVED").length} />
        <StatCard label="Aktiv loan" value={loans.filter((item) => item.status !== "RETURNED").length} />
        <StatCard label="Reading room bronlari" value={seatReservations.length} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Mening reservationlarim</h2>
          <div className="space-y-3">
            {reservations.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <p className="font-medium">{item.resource.title}</p>
                <p className="mt-1 text-muted-foreground">
                  {item.status} • Copy {item.copy.inventoryNumber}
                </p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Loan va overdue nazorati</h2>
          <div className="space-y-3">
            {loans.map((loan) => (
              <div key={loan.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <p className="font-medium">{loan.resource.title}</p>
                <p className="mt-1 text-muted-foreground">
                  {loan.status} • Due at {loan.dueAt.toISOString().slice(0, 10)}
                </p>
              </div>
            ))}
            {overdue.some((loan) => loan.userId === user.id) ? (
              <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                Sizda overdue qaytarishlar mavjud.
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
