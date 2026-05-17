import { resourceInputSchema } from "@/lib/validation/resource";

function formField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

export async function parseResourceFormData(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  const payload = resourceInputSchema.parse({
    title: formField(formData, "title"),
    description: formField(formData, "description"),
    abstract: formField(formData, "abstract"),
    keywords: formField(formData, "keywords"),
    categoryId: formField(formData, "categoryId"),
    facultyId: formField(formData, "facultyId"),
    departmentId: formField(formData, "departmentId"),
    language: formField(formData, "language"),
    publicationYear: formField(formData, "publicationYear"),
    publisher: formField(formData, "publisher"),
    isbn: formField(formData, "isbn"),
    udk: formField(formData, "udk"),
    bbk: formField(formData, "bbk"),
    pages: formField(formData, "pages"),
    resourceType: formField(formData, "resourceType"),
    accessType: formField(formData, "accessType"),
    authorIds: JSON.parse(formField(formData, "authorIds") ?? "[]")
  });

  return {
    payload,
    file: file instanceof File ? file : null
  };
}
