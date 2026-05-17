"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function RouteErrorPanel({
  error,
  reset,
  title
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title: string;
}) {
  useEffect(() => {
    toast.error(error.message || "Unexpected route error");
  }, [error]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Card className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-danger">Error state</p>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{error.message || "Unexpected route error"}</p>
        <div className="flex justify-center">
          <Button onClick={reset}>Try again</Button>
        </div>
      </Card>
    </div>
  );
}
