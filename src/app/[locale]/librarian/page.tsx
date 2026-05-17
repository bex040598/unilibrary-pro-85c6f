export const dynamic = "force-dynamic";

import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { listReservations } from "@/server/services/reservation-service";
import { listAllLoans, listOverdueLoans } from "@/server/services/loan-service";
import { listReadingRooms } from "@/server/services/reading-room-service";

export default async function LibrarianPage() {
  await requirePageRole("librarian");
  const [reservations, loans, overdue, rooms] = await Promise.all([
    listReservations(),
    listAllLoans(),
    listOverdueLoans(),
    listReadingRooms()
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-primary">Librarian operations</p>
        <h1 className="mt-2 text-3xl font-semibold">Bugungi operatsion nazorat</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Bugungi bronlar" value={reservations.length} />
        <StatCard label="Active loans" value={loans.length} />
        <StatCard label="Overdue" value={overdue.length} />
        <StatCard label="Reading room occupancy" value={rooms.reduce((acc, room) => acc + room.bookings.length, 0)} />
      </div>
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Pickup va return queue</h2>
        {reservations.slice(0, 8).map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
            <p className="font-medium">{item.resource.title}</p>
            <p className="text-muted-foreground">
              {item.user.fullName} • {item.status}
            </p>
          </div>
        ))}
      </Card>
    </div>
  );
}
