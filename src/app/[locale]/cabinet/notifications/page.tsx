export const dynamic = "force-dynamic";

import { NotificationCenter } from "@/components/dashboard/notification-center";
import { requirePageRole } from "@/lib/permissions/rbac";
import { listNotifications } from "@/server/services/notification-service";

export default async function CabinetNotificationsPage() {
  const user = await requirePageRole("cabinet");
  const notifications = await listNotifications(user.id);

  return (
    <NotificationCenter
      initialNotifications={notifications}
      heading="Bildirishnomalar"
      subtitle="Reservation, loan, renewal, resource va reading-room holatlari shu yerda jamlanadi."
    />
  );
}
