"use client";

import { RouteErrorPanel } from "@/components/layout/route-error-panel";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorPanel error={error} reset={reset} title="Department head workspace could not be loaded" />;
}
