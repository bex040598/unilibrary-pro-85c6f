"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Option = {
  id: string;
  label: string;
};

type ResourceDraft = {
  id?: string;
  title?: string;
  description?: string;
  abstract?: string | null;
  keywords?: string | null;
  genre?: string | null;
  categoryId?: string;
  facultyId?: string | null;
  departmentId?: string | null;
  language?: string;
  publicationYear?: number | null;
  publisher?: string | null;
  isbn?: string | null;
  udk?: string | null;
  bbk?: string | null;
  pages?: number | null;
  resourceType?: string;
  accessType?: string;
  authorNames?: string[];
  status?: string;
  rejectionReason?: string | null;
};

const resourceTypeOptions = [
  "TEXTBOOK",
  "STUDY_GUIDE",
  "MONOGRAPH",
  "ARTICLE",
  "DISSERTATION",
  "ABSTRACT",
  "METHODICAL_GUIDE",
  "LAB_WORK",
  "PRESENTATION",
  "VIDEO",
  "OTHER"
];

const accessTypeOptions = ["PUBLIC", "AUTH_REQUIRED", "STAFF_ONLY", "PRIVATE"];
const languageOptions = ["UZ", "RU", "EN"];
const steps = ["Asosiy ma'lumot", "Akademik tasnif", "Fayl", "Metadata", "Preview"];

export function TeacherResourceWizard({
  locale,
  categories,
  faculties,
  departments,
  resource,
  draftRedirectPath,
  submitRedirectPath,
  allowSubmitToReview = true,
  draftButtonLabel = "Draft saqlash",
  submitButtonLabel = "Reviewga yuborish"
}: {
  locale: string;
  categories: Option[];
  faculties: Option[];
  departments: Array<Option & { facultyId?: string }>;
  resource?: ResourceDraft;
  draftRedirectPath?: string;
  submitRedirectPath?: string;
  allowSubmitToReview?: boolean;
  draftButtonLabel?: string;
  submitButtonLabel?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: resource?.title ?? "",
    description: resource?.description ?? "",
    abstract: resource?.abstract ?? "",
    keywords: resource?.keywords ?? "",
    subject: "",
    genre: resource?.genre ?? "",
    categoryId: resource?.categoryId ?? categories[0]?.id ?? "",
    facultyId: resource?.facultyId ?? faculties[0]?.id ?? "",
    departmentId: resource?.departmentId ?? departments[0]?.id ?? "",
    language: resource?.language ?? "UZ",
    publicationYear: resource?.publicationYear?.toString() ?? "",
    publisher: resource?.publisher ?? "",
    isbn: resource?.isbn ?? "",
    udk: resource?.udk ?? "",
    bbk: resource?.bbk ?? "",
    pages: resource?.pages?.toString() ?? "",
    resourceType: resource?.resourceType ?? "TEXTBOOK",
    accessType: resource?.accessType ?? "PUBLIC",
    authors: resource?.authorNames?.join(", ") ?? ""
  });

  const filteredDepartments = useMemo(
    () => departments.filter((item) => !form.facultyId || item.facultyId === form.facultyId),
    [departments, form.facultyId]
  );

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function saveDraft(submitToReview = false) {
    startTransition(async () => {
      try {
        const body = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          body.append(key, value);
        });
        body.set("authorIds", "[]");
        body.set(
          "authorNames",
          JSON.stringify(
            form.authors
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          )
        );

        if (file) {
          body.set("file", file);
        }

        if (coverImage) {
          body.set("coverImage", coverImage);
        }

        const targetId = resource?.id;
        const response = await fetch(targetId ? `/api/resources/${targetId}` : "/api/resources", {
          method: targetId ? "PUT" : "POST",
          body
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error?.message ?? "Resursni saqlab bo'lmadi");
        }

        const nextId = result.data.id as string;
        toast.success(submitToReview ? "Resurs saqlandi va reviewga yuborildi" : "Draft saqlandi");

        if (submitToReview) {
          const submitResponse = await fetch(`/api/resources/${nextId}/submit`, {
            method: "POST"
          });
          const submitResult = await submitResponse.json();
          if (!submitResponse.ok || !submitResult.success) {
            throw new Error(submitResult.error?.message ?? "Reviewga yuborib bo'lmadi");
          }
          toast.success("Moderator review uchun yuborildi");
          router.push(submitRedirectPath ?? `/${locale}/teacher/submissions`);
          router.refresh();
          return;
        }

        router.push(draftRedirectPath ?? `/${locale}/teacher/resources`);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Noma'lum xatolik yuz berdi");
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {steps.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index)}
              className={`rounded-full px-4 py-2 text-sm ${index === step ? "bg-primary text-white" : "bg-surface-soft"}`}
            >
              {index + 1}. {label}
            </button>
          ))}
        </div>
        {resource?.rejectionReason ? (
          <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
            Rejection reason: {resource.rejectionReason}
          </div>
        ) : null}
      </Card>

      {step === 0 ? (
        <Card className="grid gap-4 md:grid-cols-2">
          <Input value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Resurs nomi" />
          <Input
            value={form.authors}
            onChange={(event) => updateField("authors", event.target.value)}
            placeholder="Mualliflar, vergul bilan ajrating"
          />
          <Input value={form.genre} onChange={(event) => updateField("genre", event.target.value)} placeholder="Janr" />
          <div className="md:col-span-2">
            <Textarea
              value={form.abstract}
              onChange={(event) => updateField("abstract", event.target.value)}
              placeholder="Annotatsiya"
            />
          </div>
          <div className="md:col-span-2">
            <Textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Tavsif"
            />
          </div>
          <Input value={form.keywords} onChange={(event) => updateField("keywords", event.target.value)} placeholder="Kalit so'zlar" />
          <Select value={form.resourceType} onChange={(event) => updateField("resourceType", event.target.value)}>
            {resourceTypeOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card className="grid gap-4 md:grid-cols-2">
          <Select value={form.facultyId} onChange={(event) => updateField("facultyId", event.target.value)}>
            {faculties.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </Select>
          <Select value={form.departmentId} onChange={(event) => updateField("departmentId", event.target.value)}>
            {filteredDepartments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </Select>
          <Select value={form.categoryId} onChange={(event) => updateField("categoryId", event.target.value)}>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </Select>
          <Select value={form.language} onChange={(event) => updateField("language", event.target.value)}>
            {languageOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Input
            value={form.publicationYear}
            onChange={(event) => updateField("publicationYear", event.target.value)}
            placeholder="Nashr yili"
          />
          <Input value={form.subject} onChange={(event) => updateField("subject", event.target.value)} placeholder="Fan yoki yo'nalish (ixtiyoriy)" />
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="grid gap-4">
          <label className="grid gap-2 text-sm">
            Resurs fayli
            <Input type="file" accept=".pdf,.docx,.epub,.jpg,.jpeg,.png" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </label>
          <label className="grid gap-2 text-sm">
            Muqova rasmi
            <Input type="file" accept=".jpg,.jpeg,.png" onChange={(event) => setCoverImage(event.target.files?.[0] ?? null)} />
          </label>
          <div className="rounded-2xl border border-dashed border-border bg-surface-soft p-4 text-sm text-muted-foreground">
            Supported formats: PDF, DOCX, EPUB, JPG, PNG. Validation MIME, size va magic number darajasida bajariladi.
          </div>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="grid gap-4 md:grid-cols-2">
          <Input value={form.publisher} onChange={(event) => updateField("publisher", event.target.value)} placeholder="Publisher" />
          <Input value={form.isbn} onChange={(event) => updateField("isbn", event.target.value)} placeholder="ISBN" />
          <Input value={form.udk} onChange={(event) => updateField("udk", event.target.value)} placeholder="UDK" />
          <Input value={form.bbk} onChange={(event) => updateField("bbk", event.target.value)} placeholder="BBK" />
          <Input value={form.pages} onChange={(event) => updateField("pages", event.target.value)} placeholder="Pages" />
          <Select value={form.accessType} onChange={(event) => updateField("accessType", event.target.value)}>
            {accessTypeOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Card>
      ) : null}

      {step === 4 ? (
        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Ko'rib chiqish</h2>
          <pre className="overflow-x-auto rounded-2xl bg-surface-soft p-4 text-sm">{JSON.stringify(form, null, 2)}</pre>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              Fayl: {file?.name ?? "Mavjud fayl saqlanadi"}
            </div>
            <div className="rounded-2xl border border-border bg-surface-soft p-4 text-sm">
              Muqova: {coverImage?.name ?? "Mavjud muqova saqlanadi"}
            </div>
          </div>
        </Card>
      ) : null}

      <div className="flex flex-wrap justify-between gap-3">
        <Button variant="secondary" type="button" onClick={() => setStep((current) => Math.max(0, current - 1))}>
          Orqaga
        </Button>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" disabled={isPending} onClick={() => saveDraft(false)}>
            {draftButtonLabel}
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" disabled={isPending} onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}>
              Keyingi
            </Button>
          ) : allowSubmitToReview ? (
            <Button type="button" disabled={isPending} onClick={() => saveDraft(true)}>
              {submitButtonLabel}
            </Button>
          ) : null}
          {!allowSubmitToReview && step === steps.length - 1 ? (
            <Button type="button" disabled={isPending} onClick={() => saveDraft(false)}>
              Resursni saqlash
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
