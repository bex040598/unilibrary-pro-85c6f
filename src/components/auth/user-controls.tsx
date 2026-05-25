"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

function getLabels(locale: string) {
  if (locale === "ru") {
    return {
      profile: "Мой профиль",
      dashboard: "Панель",
      favorites: "Сохранённое",
      statistics: "Моя статистика",
      logout: "Выйти",
      logoutSuccess: "Вы вышли из системы",
      logoutError: "Не удалось выйти из системы"
    };
  }

  if (locale === "en") {
    return {
      profile: "My Profile",
      dashboard: "Dashboard",
      favorites: "Saved Items",
      statistics: "My Statistics",
      logout: "Logout",
      logoutSuccess: "You have signed out",
      logoutError: "Unable to sign out"
    };
  }

  return {
    profile: "Mening profilim",
    dashboard: "Dashboard",
    favorites: "Saqlanganlar",
    statistics: "Statistikam",
    logout: "Chiqish",
    logoutSuccess: "Tizimdan chiqildi",
    logoutError: "Chiqishda xatolik yuz berdi"
  };
}

export function UserControls({ locale, profilePath, dashboardPath, fullName, role }: Props) {
  const router = useRouter();
  const labels = getLabels(locale);

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
          {labels.profile}
        </button>
        <button className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-surface-soft" onClick={() => router.push(dashboardPath)}>
          {labels.dashboard}
        </button>
        <button
          className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-surface-soft"
          onClick={() => router.push(getFavoritesPath(locale, role))}
        >
          {labels.favorites}
        </button>
        <button
          className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-surface-soft"
          onClick={() => router.push(getStatisticsPath(locale, role))}
        >
          {labels.statistics}
        </button>
        <button
          className="w-full rounded-xl px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
          onClick={async () => {
            const response = await fetch("/api/auth/logout", { method: "POST" });
            const payload = await response.json().catch(() => null);

            if (!response.ok) {
              toast.error(payload?.error?.message ?? labels.logoutError);
              return;
            }

            toast.success(labels.logoutSuccess);
            router.push(`/${locale}/auth/login`);
            router.refresh();
          }}
        >
          {labels.logout}
        </button>
      </div>
    </details>
  );
}
