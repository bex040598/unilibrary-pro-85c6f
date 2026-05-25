export const dynamic = "force-dynamic";

import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { getUserProfileBundle } from "@/server/services/user-profile-service";
import { getOverviewStats } from "@/server/services/statistics-service";

export default async function AdminProfilePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requirePageRole("admin", locale);
  const [profile, overview] = await Promise.all([getUserProfileBundle(user.id), getOverviewStats()]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-primary">Administrator profili</p>
        <h1 className="mt-2 text-3xl font-semibold">Tizim boshqaruvi va profil ko‘rsatkichlari</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Audit amallari" value={profile.summary.auditActionsCount} />
        <StatCard label="Xavfsizlik loglari" value={profile.summary.securityLogsCount} />
        <StatCard label="Jami resurslar" value={overview.totalResources} />
        <StatCard label="Jami foydalanuvchilar" value={overview.totalUsers} />
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
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Rol</p>
          <p className="mt-1 font-medium">{profile.summary.role}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Oxirgi kirish</p>
          <p className="mt-1 font-medium">
            {profile.summary.lastLoginAt ? new Date(profile.summary.lastLoginAt).toLocaleString("uz-UZ") : "Ma’lumot yo‘q"}
          </p>
        </div>
      </Card>
    </div>
  );
}
