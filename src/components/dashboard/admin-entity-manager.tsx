"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type EntityName = "users" | "categories" | "faculties" | "departments" | "announcements" | "settings" | "book-copies" | "resources";

type SelectOption = {
  value: string;
  label: string;
};

type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "email" | "textarea" | "select" | "number";
  required?: boolean;
  options?: SelectOption[];
};

type FilterConfig = {
  key: string;
  label: string;
  options: SelectOption[];
};

type Props = {
  entity: EntityName;
  title: string;
  initialItems: Record<string, unknown>[];
  initialMeta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  auxiliary: {
    faculties?: SelectOption[];
    departments?: SelectOption[];
    categories?: SelectOption[];
    resources?: SelectOption[];
    users?: SelectOption[];
  };
};

function stringifyValue(value: unknown) {
  if (value == null) return "-";
  if (typeof value === "object") {
    if ("title" in (value as Record<string, unknown>) && typeof (value as Record<string, unknown>).title === "string") {
      return String((value as Record<string, unknown>).title);
    }
    if ("fullName" in (value as Record<string, unknown>) && typeof (value as Record<string, unknown>).fullName === "string") {
      return String((value as Record<string, unknown>).fullName);
    }
    if ("nameUz" in (value as Record<string, unknown>) && typeof (value as Record<string, unknown>).nameUz === "string") {
      return String((value as Record<string, unknown>).nameUz);
    }
    return JSON.stringify(value);
  }
  return String(value);
}

function getEntityConfig(entity: EntityName, auxiliary: Props["auxiliary"]) {
  switch (entity) {
    case "users":
      return {
        columns: ["fullName", "email", "role", "status"],
        fields: [
          { name: "fullName", label: "Full name", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "password", label: "Password" },
          {
            name: "role",
            label: "Role",
            type: "select",
            required: true,
            options: ["ADMIN", "LIBRARIAN", "MODERATOR", "DEPARTMENT_HEAD", "TEACHER", "STUDENT"].map((value) => ({ value, label: value }))
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: ["ACTIVE", "BLOCKED", "PENDING", "ARCHIVED"].map((value) => ({ value, label: value }))
          },
          { name: "facultyId", label: "Faculty", type: "select", options: auxiliary.faculties ?? [] },
          { name: "departmentId", label: "Department", type: "select", options: auxiliary.departments ?? [] }
        ] satisfies FieldConfig[],
        filters: [
          { key: "role", label: "Role", options: [{ value: "", label: "All roles" }, ...["ADMIN", "LIBRARIAN", "MODERATOR", "DEPARTMENT_HEAD", "TEACHER", "STUDENT"].map((value) => ({ value, label: value }))] },
          { key: "status", label: "Status", options: [{ value: "", label: "All statuses" }, ...["ACTIVE", "BLOCKED", "PENDING", "ARCHIVED"].map((value) => ({ value, label: value }))] }
        ] satisfies FilterConfig[]
      };
    case "categories":
      return {
        columns: ["nameUz", "slug", "icon"],
        fields: [
          { name: "nameUz", label: "Name UZ", required: true },
          { name: "nameRu", label: "Name RU", required: true },
          { name: "nameEn", label: "Name EN", required: true },
          { name: "slug", label: "Slug", required: true },
          { name: "icon", label: "Icon" }
        ] satisfies FieldConfig[],
        filters: [] satisfies FilterConfig[]
      };
    case "faculties":
      return {
        columns: ["nameUz", "slug"],
        fields: [
          { name: "nameUz", label: "Name UZ", required: true },
          { name: "nameRu", label: "Name RU", required: true },
          { name: "nameEn", label: "Name EN", required: true },
          { name: "slug", label: "Slug", required: true }
        ] satisfies FieldConfig[],
        filters: [] satisfies FilterConfig[]
      };
    case "departments":
      return {
        columns: ["nameUz", "code", "faculty", "headName", "email", "isActive"],
        fields: [
          { name: "facultyId", label: "Faculty", type: "select", required: true, options: auxiliary.faculties ?? [] },
          { name: "nameUz", label: "Name UZ", required: true },
          { name: "nameRu", label: "Name RU", required: true },
          { name: "nameEn", label: "Name EN", required: true },
          { name: "slug", label: "Slug", required: true },
          { name: "code", label: "Code" },
          { name: "headName", label: "Head name" },
          { name: "email", label: "Email", type: "email" },
          { name: "phone", label: "Phone" },
          { name: "room", label: "Room" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "imageUrl", label: "Image URL" },
          {
            name: "isActive",
            label: "Is active",
            type: "select",
            required: true,
            options: [
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" }
            ]
          }
        ] satisfies FieldConfig[],
        filters: [{ key: "facultyId", label: "Faculty", options: [{ value: "", label: "All faculties" }, ...(auxiliary.faculties ?? [])] }] satisfies FilterConfig[]
      };
    case "announcements":
      return {
        columns: ["title", "status", "imageUrl"],
        fields: [
          { name: "title", label: "Title", required: true },
          { name: "content", label: "Content", type: "textarea", required: true },
          { name: "imageUrl", label: "Image URL" },
          {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: ["DRAFT", "PUBLISHED", "ARCHIVED"].map((value) => ({ value, label: value }))
          }
        ] satisfies FieldConfig[],
        filters: [{ key: "status", label: "Status", options: [{ value: "", label: "All statuses" }, ...["DRAFT", "PUBLISHED", "ARCHIVED"].map((value) => ({ value, label: value }))] }] satisfies FilterConfig[]
      };
    case "settings":
      return {
        columns: ["key", "value"],
        fields: [
          { name: "key", label: "Key", required: true },
          { name: "rawValue", label: "JSON value", type: "textarea", required: true }
        ] satisfies FieldConfig[],
        filters: [] satisfies FilterConfig[]
      };
    case "book-copies":
      return {
        columns: ["inventoryNumber", "status", "resource"],
        fields: [
          { name: "resourceId", label: "Resource", type: "select", required: true, options: auxiliary.resources ?? [] },
          { name: "inventoryNumber", label: "Inventory number", required: true },
          { name: "barcode", label: "Barcode", required: true },
          { name: "shelfLocation", label: "Shelf location" },
          {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: ["AVAILABLE", "RESERVED", "BORROWED", "LOST", "MAINTENANCE"].map((value) => ({ value, label: value }))
          }
        ] satisfies FieldConfig[],
        filters: [{ key: "status", label: "Status", options: [{ value: "", label: "All statuses" }, ...["AVAILABLE", "RESERVED", "BORROWED", "LOST", "MAINTENANCE"].map((value) => ({ value, label: value }))] }] satisfies FilterConfig[]
      };
    case "resources":
      return {
        columns: ["title", "status", "resourceType", "accessType"],
        fields: [
          { name: "title", label: "Title", required: true },
          { name: "slug", label: "Slug", required: true },
          { name: "description", label: "Description", type: "textarea", required: true },
          { name: "categoryId", label: "Category", type: "select", required: true, options: auxiliary.categories ?? [] },
          { name: "uploadedById", label: "Owner", type: "select", required: true, options: auxiliary.users ?? [] },
          {
            name: "language",
            label: "Language",
            type: "select",
            required: true,
            options: ["UZ", "RU", "EN"].map((value) => ({ value, label: value }))
          },
          {
            name: "resourceType",
            label: "Resource type",
            type: "select",
            required: true,
            options: ["TEXTBOOK", "STUDY_GUIDE", "MONOGRAPH", "ARTICLE", "DISSERTATION", "ABSTRACT", "METHODICAL_GUIDE", "LAB_WORK", "PRESENTATION", "VIDEO", "OTHER"].map((value) => ({ value, label: value }))
          },
          {
            name: "accessType",
            label: "Access type",
            type: "select",
            required: true,
            options: ["PUBLIC", "AUTH_REQUIRED", "STAFF_ONLY", "PRIVATE"].map((value) => ({ value, label: value }))
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: ["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED", "NEEDS_REVISION", "ARCHIVED"].map((value) => ({ value, label: value }))
          }
        ] satisfies FieldConfig[],
        filters: [
          { key: "status", label: "Status", options: [{ value: "", label: "All statuses" }, ...["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED", "NEEDS_REVISION", "ARCHIVED"].map((value) => ({ value, label: value }))] },
          { key: "resourceType", label: "Type", options: [{ value: "", label: "All types" }, ...["TEXTBOOK", "STUDY_GUIDE", "MONOGRAPH", "ARTICLE", "DISSERTATION", "ABSTRACT", "METHODICAL_GUIDE", "LAB_WORK", "PRESENTATION", "VIDEO", "OTHER"].map((value) => ({ value, label: value }))] },
          { key: "accessType", label: "Access", options: [{ value: "", label: "All access" }, ...["PUBLIC", "AUTH_REQUIRED", "STAFF_ONLY", "PRIVATE"].map((value) => ({ value, label: value }))] }
        ] satisfies FilterConfig[]
      };
  }
}

export function AdminEntityManager({ entity, title, initialItems, initialMeta, auxiliary }: Props) {
  const config = useMemo(() => getEntityConfig(entity, auxiliary), [entity, auxiliary]);
  const [items, setItems] = useState(initialItems);
  const [meta, setMeta] = useState(initialMeta);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formState, setFormState] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditingItem(null);
    setIsCreating(true);
    setFormState({});
  }

  function openEdit(item: Record<string, unknown>) {
    setEditingItem(item);
    setIsCreating(false);
    const nextState = Object.fromEntries(
      config.fields.map((field) => {
        const rawValue = item[field.name];
        return [field.name, rawValue == null ? "" : typeof rawValue === "string" ? rawValue : String(rawValue)];
      })
    );
    setFormState(nextState);
  }

  function closeForm() {
    setEditingItem(null);
    setIsCreating(false);
    setFormState({});
  }

  async function fetchItems(nextPage = meta.page) {
    const params = new URLSearchParams({
      page: String(nextPage),
      limit: String(meta.limit),
      q: search
    });

    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }

    const response = await fetch(`/api/admin/entities/${entity}?${params.toString()}`);
    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.error?.message ?? "Entity list load failed");
    }

    setItems(payload.data);
    setMeta(payload.meta);
  }

  function submitFilters(nextPage = 1) {
    startTransition(() => {
      fetchItems(nextPage).catch((error) => {
        toast.error(error instanceof Error ? error.message : "Entity list load failed");
      });
    });
  }

  function updateField(name: string, value: string) {
    setFormState((current) => ({ ...current, [name]: value }));
  }

  async function saveEntity() {
    const payload = Object.fromEntries(
      Object.entries(formState)
        .filter(([, value]) => value !== "")
        .map(([key, value]) => [key, key === "rawValue" ? tryParseJson(value) : value])
    );

    const method = editingItem ? "PUT" : "POST";
    const url = editingItem ? `/api/admin/entities/${entity}/${editingItem.id}` : `/api/admin/entities/${entity}`;

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error?.message ?? "Save failed");
    }

    toast.success(editingItem ? "Entity updated." : "Entity created.");
    closeForm();
    await fetchItems();
  }

  function deleteEntity(item: Record<string, unknown>) {
    if (!window.confirm(`${title}: ushbu yozuvni o'chirishni tasdiqlaysizmi?`)) {
      return;
    }

    startTransition(() => {
      fetch(`/api/admin/entities/${entity}/${item.id}`, { method: "DELETE" })
        .then(async (response) => {
          const result = await response.json();
          if (!response.ok || !result.success) {
            throw new Error(result.error?.message ?? "Delete failed");
          }
          toast.success("Entity deleted.");
          await fetchItems(meta.page);
        })
        .catch((error) => {
          toast.error(error instanceof Error ? error.message : "Delete failed");
        });
    });
  }

  function handleSaveClick() {
    startTransition(() => {
      saveEntity().catch((error) => {
        toast.error(error instanceof Error ? error.message : "Save failed");
      });
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-primary">Admin CRUD</p>
          <h1 className="mt-2 text-3xl font-semibold capitalize">{title}</h1>
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex items-center gap-2">
            <Input placeholder="Search..." value={search} onChange={(event) => setSearch(event.target.value)} />
            <Button onClick={() => submitFilters()}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
          {config.filters.map((filter) => (
            <Select
              key={filter.key}
              value={filters[filter.key] ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                setFilters((current) => ({ ...current, [filter.key]: value }));
              }}
            >
              {filter.options.map((option) => (
                <option key={`${filter.key}-${option.value || "all"}`} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          ))}
          <Button variant="secondary" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      {(isCreating || editingItem) && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{editingItem ? "Edit entity" : "Create entity"}</h2>
            <Button variant="ghost" onClick={closeForm}>
              Close
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {config.fields.map((field) => (
              <label key={field.name} className="space-y-2 text-sm">
                <span className="font-medium">{field.label}</span>
                {field.type === "textarea" ? (
                  <Textarea value={formState[field.name] ?? ""} onChange={(event) => updateField(field.name, event.target.value)} />
                ) : field.type === "select" ? (
                  <Select value={formState[field.name] ?? ""} onChange={(event) => updateField(field.name, event.target.value)}>
                    <option value="">Select</option>
                    {(field.options ?? []).map((option) => (
                      <option key={`${field.name}-${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    type={field.type === "email" ? "email" : "text"}
                    value={formState[field.name] ?? ""}
                    onChange={(event) => updateField(field.name, event.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveClick} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        {isPending ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-2xl bg-surface-soft" />
            ))}
          </div>
        ) : items.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-surface-soft text-left">
                <tr>
                  {config.columns.map((column) => (
                    <th key={column} className="px-4 py-3 font-semibold capitalize">
                      {column}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={String(item.id)} className="border-t border-border">
                    {config.columns.map((column) => (
                      <td key={`${item.id}-${column}`} className="px-4 py-3 align-top">
                        {stringifyValue(item[column])}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => openEdit(item)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="ghost" onClick={() => deleteEntity(item)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-muted-foreground">No records found for this query.</div>
        )}
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Page {meta.page} / {meta.totalPages} - {meta.total} total
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={!meta.hasPrev || isPending} onClick={() => submitFilters(meta.page - 1)}>
            Prev
          </Button>
          <Button variant="secondary" disabled={!meta.hasNext || isPending} onClick={() => submitFilters(meta.page + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function tryParseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
