import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteShell } from "@/components/layout/site-shell";
import { getAppUrl } from "@/lib/app-url";
import { appName, locales } from "@/lib/constants";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: `${appName} | ${locale.toUpperCase()}`,
    description: "Enterprise academic library platform",
    openGraph: {
      title: appName,
      description: "Enterprise academic library platform",
      url: `${getAppUrl()}/${locale}`
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

  if (!(locales as readonly string[]).includes(locale)) {
    notFound();
  }

  return <SiteShell locale={locale}>{children}</SiteShell>;
}
