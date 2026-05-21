import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { getAppUrl } from "@/lib/app-url";
import { appName, locales } from "@/lib/constants";
import { getLocale } from "@/lib/i18n";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = getLocale(locale);

  return {
    title: `${appName} | ${safeLocale.toUpperCase()}`,
    description: "Enterprise academic library platform",
    openGraph: {
      title: appName,
      description: "Enterprise academic library platform",
      url: `${getAppUrl()}/${safeLocale}`
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = (locales as readonly string[]).includes(locale) ? locale : getLocale(locale);
  return <SiteShell locale={safeLocale}>{children}</SiteShell>;
}
