"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type Props = {
  locale: string;
  profilePath: string;
  dashboardPath: string;
  fullName: string;
  role: string;
};

function getFavoritesPath(locale: string, role: string) {
  if (role === "STUDENT") {
    return `/${locale}/cabinet/favorites`;
  }
  if (role === "LIBRARIAN") {
    return `/${locale}/librarian/resources`;
  }
  if (role === "ADMIN") {
    return `/${locale}/admin/resources`;
  }
  return `/${locale}/teacher/resources`;
}

function getStatisticsPath(locale: string, role: string) {
  if (role === "STUDENT") {
    return `/${locale}/cabinet/statistics`;
  }
  if (role === "LIBRARIAN") {
    return `/${locale}/librarian/statistics`;
  }
  if (role === "ADMIN") {
    return `/${locale}/admin/statistics`;
  }
  return `/${locale}/teacher/statistics`;
}

export function UserControls({ locale, profilePath, dashboardPath, fullName, role }: Props) {
  const router = useRouter();

  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
          {fullName.slice(0, 1).toUpperCase()}
        </span>
        <div className="hidden text-left sm:block">
          <p className="max-w-32 truncate font-medium">{fullName}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </summary>
      <div className="absolute right-0 z-50 mt-3 min-w-56 rounded-2xl border border-border bg-background p-2 shadow-xl">
        <button className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-surface-soft" onClick={() => router.push(profilePath)}>
          Mening profilim
        </button>
        <button className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-surface-soft" onClick={() => router.push(dashboardPath)}>
          Dashboard
        </button>
        <button
          className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-surface-soft"
          onClick={() => router.push(getFavoritesPath(locale, role))}
        >
          Saqlanganlar
        </button>
        <button
          className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-surface-soft"
          onClick={() => router.push(getStatisticsPath(locale, role))}
        >
          Statistikam
        </button>
        <button
          className="w-full rounded-xl px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
          onClick={async () => {
            const response = await fetch("/api/auth/logout", { method: "POST" });
            const payload = await response.json().catch(() => null);

            if (!response.ok) {
              toast.error(payload?.error?.message ?? "Chiqishda xatolik yuz berdi");
              return;
            }

            toast.success("Tizimdan chiqildi");
            router.push(`/${locale}/auth/login`);
            router.refresh();
          }}
        >
          Chiqish
        </button>
      </div>
    </details>
  );
}
