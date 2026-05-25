export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { prisma } from "@/lib/db/prisma";
import { listAllLoans, listOverdueLoans } from "@/server/services/loan-service";
import { listReadingRooms, listSeatReservations } from "@/server/services/reading-room-service";
import { listReservations } from "@/server/services/reservation-service";

const allowedSections = ["reservations", "loans", "returns", "overdue", "renewals", "reading-room", "book-copies", "reports"] as const;

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

export default async function LibrarianSectionPage({
  params
}: {
  params: Promise<{ locale: string; section: string }>;
}) {
  const { locale, section } = await params;
  await requirePageRole("librarian", locale);

  if (!allowedSections.includes(section as (typeof allowedSections)[number])) {
    notFound();
  }

  if (section === "reservations") {
    const reservations = await listReservations();
    return (
      <PageShell title="Bronlar navbati">
        <Card className="space-y-4">
          {reservations.length ? (
            reservations.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <p className="font-medium">{item.resource.title}</p>
                <p className="text-muted-foreground">
                  {item.user.fullName} • {item.status}
                </p>
              </div>
            ))
          ) : (
            <EmptyState text="Hozircha bron navbati mavjud emas." />
          )}
        </Card>
      </PageShell>
    );
  }

  if (section === "loans" || section === "returns") {
    const loans = await listAllLoans();
    const filtered = loans.filter((loan) => (section === "returns" ? loan.status !== "RETURNED" : true));
    return (
      <PageShell title={section === "loans" ? "Aylanmalar" : "Qaytarish navbati"}>
        <Card className="space-y-4">
          {filtered.length ? (
            filtered.map((loan) => (
              <div key={loan.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <p className="font-medium">{loan.resource.title}</p>
                <p className="text-muted-foreground">
                  {loan.user.fullName} • {loan.status}
                </p>
              </div>
            ))
          ) : (
            <EmptyState text="Hozircha yozuvlar topilmadi." />
          )}
        </Card>
      </PageShell>
    );
  }

  if (section === "overdue") {
    const loans = await listOverdueLoans();
    return (
      <PageShell title="Kechikkan aylanmalar">
        <Card className="space-y-4">
          {loans.length ? (
            loans.map((loan) => (
              <div key={loan.id} className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm">
                <p className="font-medium">{loan.resource.title}</p>
                <p className="text-danger">{loan.user.fullName}</p>
              </div>
            ))
          ) : (
            <EmptyState text="Kechikkan aylanmalar topilmadi." />
          )}
        </Card>
      </PageShell>
    );
  }

  if (section === "renewals") {
    const renewals = await prisma.renewalRequest.findMany({
      include: { loan: { include: { resource: true } }, user: true },
      orderBy: { createdAt: "desc" }
    });
    return (
      <PageShell title="Muddat uzaytirish so‘rovlari">
        <Card className="space-y-4">
          {renewals.length ? (
            renewals.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <p className="font-medium">{item.loan.resource.title}</p>
                <p className="text-muted-foreground">
                  {item.user.fullName} • {item.status}
                </p>
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
    const [rooms, reservations] = await Promise.all([listReadingRooms(), listSeatReservations()]);
    return (
      <PageShell title="O‘quv zali bronlari">
        <Card className="space-y-4">
          <pre className="overflow-x-auto rounded-2xl bg-surface-soft p-4 text-sm">{JSON.stringify({ rooms, reservations }, null, 2)}</pre>
        </Card>
      </PageShell>
    );
  }

  if (section === "book-copies") {
    const copies = await prisma.bookCopy.findMany({
      include: { resource: true },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    return (
      <PageShell title="Bosma nusxalar">
        <Card className="space-y-4">
          {copies.length ? (
            copies.map((copy) => (
              <div key={copy.id} className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
                <p className="font-medium">{copy.resource.title}</p>
                <p className="text-muted-foreground">
                  {copy.inventoryNumber} • {copy.status}
                </p>
              </div>
            ))
          ) : (
            <EmptyState text="Bosma nusxalar hali qo‘shilmagan." />
          )}
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell title="Hisobotlar">
      <Card className="rounded-2xl border border-dashed border-border bg-surface-soft p-8 text-sm text-muted-foreground">
        Hisobotlar API va grafiklar kutubxonachi statistikasi bilan ulangan. Batafsil ko‘rinish keyingi iteratsiyada kengaytiriladi.
      </Card>
    </PageShell>
  );
}
