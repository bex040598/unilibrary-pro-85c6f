"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CitationBox({ citations }: { citations: Record<string, string> }) {
  const [active, setActive] = useState<keyof typeof citations>("apa");

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-surface p-5">
      <div className="flex flex-wrap gap-2">
        {Object.keys(citations).map((key) => (
          <button
            key={key}
            type="button"
            className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
              active === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
            onClick={() => setActive(key as keyof typeof citations)}
          >
            {key}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-surface-soft p-4 text-sm text-muted-foreground">{citations[active]}</div>
      <Button
        type="button"
        variant="secondary"
        onClick={async () => {
          await navigator.clipboard.writeText(citations[active]);
          toast.success("Havola nusxalandi");
        }}
      >
        Copy citation
      </Button>
    </div>
  );
}
