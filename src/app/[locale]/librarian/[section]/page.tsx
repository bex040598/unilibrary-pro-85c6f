export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { listAllLoans, listOverdueLoans } from "@/server/services/loan-service";
import { listReadingRooms, listSeatReservations } from "@/server/services/reading-room-service";
import { listReservations } from "@/server/services/reservation-service";

const allowedSections = ["reservations", "loans", "returns", "overdue", "renewals", "reading-room", "book-copies", "reports"] as const;

export default async function LibrarianSectionPage({
  params
}: {
  params: Promise<{ section: string }>;
}) {
  await requirePageRole("librarian");
  const { section } = await params;

  if (!allowedSections.includes(section as (typeof allowedSections)[number])) {
    notFound();
  }

  if (section === "reservations") {
    const reservations = await listReservations();
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Reservations queue</h1>
        <Card className="space-y-4">
          {reservations.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              <p className="font-medium">{item.resource.title}</p>
              <p className="text-muted-foreground">
                {item.user.fullName} - {item.status}
              </p>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  if (section === "loans" || section === "returns") {
    const loans = await listAllLoans();
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">{section === "loans" ? "Loans" : "Return queue"}</h1>
        <Card className="space-y-4">
          {loans
            .filter((loan) => (section === "returns" ? loan.status !== "RETURNED" : true))
            .map((loan) => (
              <div key={loan.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <p className="font-medium">{loan.resource.title}</p>
                <p className="text-muted-foreground">
                  {loan.user.fullName} - {loan.status}
                </p>
              </div>
            ))}
        </Card>
      </div>
    );
  }

  if (section === "overdue") {
    const loans = await listOverdueLoans();
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Overdue</h1>
        <Card className="space-y-4">
          {loans.map((loan) => (
            <div key={loan.id} className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm">
              <p className="font-medium">{loan.resource.title}</p>
              <p className="text-danger">{loan.user.fullName}</p>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  if (section === "renewals") {
    const renewals = await prisma.renewalRequest.findMany({
      include: { loan: { include: { resource: true } }, user: true },
      orderBy: { createdAt: "desc" }
    });
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Renewals</h1>
        <Card className="space-y-4">
          {renewals.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              <p className="font-medium">{item.loan.resource.title}</p>
              <p className="text-muted-foreground">
                {item.user.fullName} - {item.status}
              </p>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  if (section === "reading-room") {
    const [rooms, reservations] = await Promise.all([listReadingRooms(), listSeatReservations()]);
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Reading room</h1>
        <Card className="space-y-4">
          <pre className="overflow-x-auto rounded-2xl bg-surface-soft p-4 text-sm">{JSON.stringify({ rooms, reservations }, null, 2)}</pre>
        </Card>
      </div>
    );
  }

  if (section === "book-copies") {
    const copies = await prisma.bookCopy.findMany({
      include: { resource: true },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold">Book copies</h1>
        <Card className="space-y-4">
          {copies.map((copy) => (
            <div key={copy.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              <p className="font-medium">{copy.resource.title}</p>
              <p className="text-muted-foreground">
                {copy.inventoryNumber} - {copy.status}
              </p>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Reports</h1>
      <Card className="rounded-2xl border border-dashed border-border bg-surface-soft p-8 text-sm text-muted-foreground">
        CSV export va richer analytics keyingi patchda admin/librarian report endpoints bilan ulanadi.
      </Card>
    </div>
  );
}
