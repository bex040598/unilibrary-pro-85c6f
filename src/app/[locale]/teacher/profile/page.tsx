export const dynamic = "force-dynamic";

import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { requirePageRole } from "@/lib/permissions/rbac";
import { getUserProfileBundle } from "@/server/services/user-profile-service";

export default async function TeacherProfilePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requirePageRole("teacher", locale);
  const profile = await getUserProfileBundle(user.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-primary">O‘qituvchi profili</p>
        <h1 className="mt-2 text-3xl font-semibold">Resurslar va akademik faollik</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Yuklangan resurslar" value={profile.summary.uploadedResourcesCount} />
        <StatCard label="Tasdiqlangan resurslar" value={profile.summary.approvedResourcesCount} />
        <StatCard label="Saqlanganlar" value={profile.summary.favoritesCount} />
        <StatCard label="Ko‘rishlar" value={profile.summary.viewsCount} />
      </div>
      <Card className="grid gap-4 md:grid-cols-2">
        <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Ism familiya</p><p className="mt-1 font-medium">{profile.summary.fullName}</p></div>
        <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p><p className="mt-1 font-medium">{profile.summary.email}</p></div>
        <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Kafedra</p><p className="mt-1 font-medium">{profile.summary.department ?? "Kiritilmagan"}</p></div>
        <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Employee ID</p><p className="mt-1 font-medium">{profile.summary.employeeId ?? "Kiritilmagan"}</p></div>
      </Card>
    </div>
  );
}
