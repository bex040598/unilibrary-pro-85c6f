export const dynamic = "force-dynamic";

import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { getUserProfileBundle } from "@/server/services/user-profile-service";

export default async function LibrarianProfilePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requirePageRole("librarian", locale);
  const profile = await getUserProfileBundle(user.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-primary">Kutubxonachi profili</p>
        <h1 className="mt-2 text-3xl font-semibold">Kutubxonachi faoliyati va shaxsiy ma’lumotlar</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Qo‘shilgan resurslar" value={profile.summary.uploadedResourcesCount} />
        <StatCard label="Tasdiqlangan resurslar" value={profile.summary.approvedResourcesCount} />
        <StatCard label="Audit amallari" value={profile.summary.auditActionsCount} />
        <StatCard label="Bildirishnomalar" value={profile.summary.unreadNotifications} />
      </div>
      <Card className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">F.I.Sh.</p>
          <p className="mt-1 font-medium">{profile.summary.fullName}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
          <p className="mt-1 font-medium">{profile.summary.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Lavozim</p>
          <p className="mt-1 font-medium">{profile.summary.position ?? "Kutubxonachi"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Mas’ul bo‘lim</p>
          <p className="mt-1 font-medium">{profile.summary.department ?? "Biriktirilmagan"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Employee ID</p>
          <p className="mt-1 font-medium">{profile.summary.employeeId ?? "Kiritilmagan"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Telefon</p>
          <p className="mt-1 font-medium">{profile.summary.phone ?? "Kiritilmagan"}</p>
        </div>
      </Card>
    </div>
  );
}
