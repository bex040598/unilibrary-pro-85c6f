import Link from "next/link";

import { UserControls } from "@/components/auth/user-controls";
import { ThemeSwitch } from "@/components/layout/theme-switch";
import { getDictionary } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/permissions/rbac";
import { getRoleDashboardPath } from "@/lib/role-dashboard";

export async function SiteShell({
  locale,
  children
}: {
  locale: string;
  children: React.ReactNode;
}) {
  const dict = getDictionary(locale);
  const user = await getCurrentUser();
  const dashboardPath = user ? getRoleDashboardPath(locale, user.role) : `/${locale}/auth/login`;
  const profilePath =
    user?.role === "STUDENT"
      ? `/${locale}/cabinet/profile`
      : user?.role === "LIBRARIAN"
        ? `/${locale}/librarian/profile`
        : user?.role === "ADMIN"
          ? `/${locale}/admin/profile`
          : user?.role === "TEACHER"
            ? `/${locale}/teacher/profile`
            : dashboardPath;

  return (
    <div className="min-h-screen">
      <div className="border-b border-border/70 bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <p className="font-medium tracking-[0.2em]">ATMU</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Link href="/uz">UZ</Link>
              <Link href="/ru">RU</Link>
              <Link href="/en">EN</Link>
            </div>
            {user ? <Link href={profilePath}>{dict.common.profile}</Link> : <Link href={`/${locale}/auth/login`}>{dict.nav.login}</Link>}
            <Link href={`/${locale}/admin`}>{dict.nav.admin}</Link>
            <Link href={`/${locale}#contact`}>{dict.nav.contact}</Link>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Link href={`/${locale}`} className="text-lg font-semibold tracking-tight text-primary">
              ATMU Smart UniLibrary
            </Link>
            <p className="text-xs text-muted-foreground">Universitet akademik bilimlar ekotizimi</p>
          </div>
          <nav className="hidden items-center gap-6 text-sm lg:flex">
            <Link href={`/${locale}/catalog`}>{dict.nav.catalog}</Link>
            <Link href={`/${locale}/departments`}>{dict.nav.departments}</Link>
            <Link href={`/${locale}`}>{dict.nav.readingRoom}</Link>
            <Link href={`/${locale}`}>{dict.nav.aiSearch}</Link>
            <Link href={`/${locale}`}>{dict.nav.help}</Link>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <UserControls
                locale={locale}
                profilePath={profilePath}
                dashboardPath={dashboardPath}
                fullName={user.fullName}
                role={user.role}
              />
            ) : null}
            <ThemeSwitch />
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer id="contact" className="mt-24 border-t border-border/70 bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <p className="text-lg font-semibold">ATMU Smart UniLibrary</p>
            <p className="mt-3 text-sm text-primary-foreground/75">
              Universitet kutubxonasi, kafedra resurslari va o‘quv zali ekotizimi.
            </p>
          </div>
          <div>
            <p className="font-semibold">Platforma</p>
            <ul className="mt-3 space-y-2 text-sm text-primary-foreground/75">
              <li>Katalog</li>
              <li>{dict.nav.books}</li>
              <li>{dict.nav.readingRoom}</li>
              <li>O‘qituvchi ish jarayoni</li>
              <li>Admin statistikasi</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Aloqa</p>
            <ul className="mt-3 space-y-2 text-sm text-primary-foreground/75">
              <li>info@atmu.uz</li>
              <li>+998 55 404 55 55</li>
              <li>Qarshi shahri</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Siyosatlar</p>
            <ul className="mt-3 space-y-2 text-sm text-primary-foreground/75">
              <li>Maxfiylik siyosati</li>
              <li>Foydalanish qoidalari</li>
              <li>Yordam markazi</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
