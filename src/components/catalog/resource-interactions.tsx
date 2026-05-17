"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ResourceInteractionsProps = {
  resourceId: string;
  locale: string;
  initialIsFavorite: boolean;
  canInteract: boolean;
};

export function ResourceInteractions({
  resourceId,
  locale,
  initialIsFavorite,
  canInteract
}: ResourceInteractionsProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [isTrackingDownload, setIsTrackingDownload] = useState(false);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  const pickupDate = useMemo(() => {
    const nextDay = new Date(Date.now() + 1000 * 60 * 60 * 24);
    return nextDay.toISOString();
  }, []);

  async function withAuthGuard(task: () => Promise<void>) {
    if (!canInteract) {
      toast.error("Bu amal uchun tizimga kirish kerak.");
      router.push(`/${locale}/auth/login`);
      return;
    }

    await task();
  }

  async function handleFavoriteToggle() {
    await withAuthGuard(async () => {
      setIsSavingFavorite(true);

      try {
        const response = await fetch(`/api/resources/${resourceId}/favorite`, {
          method: isFavorite ? "DELETE" : "POST"
        });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.error?.message ?? "Favorite action failed");
        }

        setIsFavorite((current) => !current);
        toast.success(isFavorite ? "Saqlangan ro'yxatdan olib tashlandi." : "Resurs saqlandi.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Favorite action failed");
      } finally {
        setIsSavingFavorite(false);
      }
    });
  }

  async function handleReservation() {
    await withAuthGuard(async () => {
      setIsCreatingReservation(true);

      try {
        const response = await fetch("/api/reservations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            resourceId,
            pickupDate
          })
        });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.error?.message ?? "Reservation failed");
        }

        toast.success("Band qilish so'rovi yaratildi.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Reservation failed");
      } finally {
        setIsCreatingReservation(false);
      }
    });
  }

  async function handleDownload() {
    setIsTrackingDownload(true);

    try {
      const response = await fetch(`/api/resources/${resourceId}/download`, {
        method: "POST"
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error?.message ?? "Download tracking failed");
      }

      window.open(payload.data.url, "_blank", "noopener,noreferrer");
      toast.success("Yuklab olish boshlandi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Download failed");
    } finally {
      setIsTrackingDownload(false);
    }
  }

  async function handleReviewSubmit() {
    await withAuthGuard(async () => {
      setIsSubmittingReview(true);

      try {
        const response = await fetch(`/api/resources/${resourceId}/reviews`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            rating: Number(rating),
            comment
          })
        });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.error?.message ?? "Review submit failed");
        }

        setComment("");
        toast.success("Review saqlandi.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Review submit failed");
      } finally {
        setIsSubmittingReview(false);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <Button onClick={handleFavoriteToggle} disabled={isSavingFavorite}>
          {isSavingFavorite ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Heart className="mr-2 h-4 w-4" />}
          {isFavorite ? "Saved" : "Favorite"}
        </Button>
        <Button variant="secondary" onClick={handleDownload} disabled={isTrackingDownload}>
          {isTrackingDownload ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Download
        </Button>
        <Button variant="secondary" onClick={handleReservation} disabled={isCreatingReservation}>
          {isCreatingReservation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Reserve
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-surface-soft p-4">
        <p className="text-sm font-medium">Review qoldirish</p>
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="h-4 w-4 text-accent" />
          <label htmlFor="rating">Rating</label>
          <select
            id="rating"
            className="rounded-xl border border-border bg-background px-3 py-2 text-foreground"
            value={rating}
            onChange={(event) => setRating(event.target.value)}
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value}/5
              </option>
            ))}
          </select>
        </div>
        <Textarea
          className="mt-3 min-h-28"
          placeholder="Fikr yoki tavsiyangizni yozing..."
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
        <Button className="mt-3 w-full" onClick={handleReviewSubmit} disabled={isSubmittingReview}>
          {isSubmittingReview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Review yuborish
        </Button>
      </div>
    </div>
  );
}
