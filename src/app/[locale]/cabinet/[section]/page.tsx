export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { listMyLoans } from "@/server/services/loan-service";
import { listMyReservations } from "@/server/services/reservation-service";
import { listMySeatReservations } from "@/server/services/reading-room-service";

const allowedSections = ["favorites", "history", "downloads", "reservations", "loans", "renewals", "reading-room", "profile"] as const;

export default async function CabinetSectionPage({
  params
}: {
  params: Promise<{ section: string }>;
}) {
  const user = await requirePageRole("cabinet");
  const { section } = await params;

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
          {favorites.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4">
              <p className="font-medium">{item.resource.title}</p>
            </div>
          ))}
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
          {history.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              <p className="font-medium">{item.resource.title}</p>
              <p className="text-muted-foreground">{item.createdAt.toISOString()}</p>
            </div>
          ))}
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
          {downloads.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              <p className="font-medium">{item.resource.title}</p>
              <p className="text-muted-foreground">{item.createdAt.toISOString()}</p>
            </div>
          ))}
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
          {reservations.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              <p className="font-medium">{item.resource.title}</p>
              <p className="text-muted-foreground">{item.status}</p>
            </div>
          ))}
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
          {loans.map((loan) => (
            <div key={loan.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              <p className="font-medium">{loan.resource.title}</p>
              <p className="text-muted-foreground">
                {loan.status} - {loan.dueAt.toISOString().slice(0, 10)}
              </p>
            </div>
          ))}
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
          {renewals.map((renewal) => (
            <div key={renewal.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              <p className="font-medium">{renewal.loan.resource.title}</p>
              <p className="text-muted-foreground">{renewal.status}</p>
            </div>
          ))}
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
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              <p className="font-medium">{item.room.name}</p>
              <p className="text-muted-foreground">
                {item.seat.seatNumber} - {item.status}
              </p>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Profile</h1>
      <Card className="space-y-4">
        <pre className="overflow-x-auto rounded-2xl bg-surface-soft p-4 text-sm">{JSON.stringify(user, null, 2)}</pre>
      </Card>
    </div>
  );
}
