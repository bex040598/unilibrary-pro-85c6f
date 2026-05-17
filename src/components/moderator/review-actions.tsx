"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ModeratorReviewActions({ resourceId }: { resourceId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  async function submit(action: "approve" | "reject" | "needs-revision") {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/resources/${resourceId}/${action}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: action === "approve" ? undefined : JSON.stringify({ reason: reason || note })
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error?.message ?? "Review action failed");
        }

        toast.success(`Resource ${action} action completed`);
        router.push("/uz/moderator/pending");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unknown error");
      }
    });
  }

  return (
    <div className="space-y-4">
      <Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Moderator note" />
      <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Rejection or revision reason" />
      <div className="flex flex-wrap gap-3">
        <Button disabled={isPending} onClick={() => submit("approve")}>
          Approve
        </Button>
        <Button disabled={isPending || reason.trim().length < 3} variant="secondary" onClick={() => submit("needs-revision")}>
          Needs revision
        </Button>
        <Button disabled={isPending || reason.trim().length < 3} variant="secondary" onClick={() => submit("reject")}>
          Reject
        </Button>
      </div>
    </div>
  );
}
