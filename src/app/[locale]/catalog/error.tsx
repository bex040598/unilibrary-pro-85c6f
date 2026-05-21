"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CatalogError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[catalog] route error", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Card className="space-y-4 border-danger/30 bg-danger/5 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-danger">Katalog xatosi</p>
        <h1 className="text-2xl font-semibold text-foreground">Katalog sahifasini yuklashda muammo yuz berdi</h1>
        <p className="text-sm text-muted-foreground">
          Sahifani qayta yuklab ko'ring. Muammo saqlanib qolsa, ma'lumotlar bazasi yoki server loglarini tekshirish kerak bo'ladi.
        </p>
        {error.digest ? <p className="text-xs text-muted-foreground">Digest: {error.digest}</p> : null}
        <div className="flex justify-center">
          <Button onClick={() => reset()}>Qayta urinib ko'rish</Button>
        </div>
      </Card>
    </div>
  );
}
