import type { Metadata } from "next";

import "@/app/globals.css";

import { appName } from "@/lib/constants";
import { getAppUrl } from "@/lib/app-url";
import { AppProviders } from "@/components/layout/app-providers";

export const metadata: Metadata = {
  title: appName,
  description: "University enterprise library platform for ATMU",
  metadataBase: new URL(getAppUrl())
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
