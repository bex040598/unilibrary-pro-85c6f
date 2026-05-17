import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/app-url";
import { locales } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getAppUrl();

  return locales.flatMap((locale) => [
    {
      url: `${baseUrl}/${locale}`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/${locale}/catalog`,
      lastModified: new Date()
    },
    {
      url: `${baseUrl}/${locale}/auth/login`,
      lastModified: new Date()
    }
  ]);
}
