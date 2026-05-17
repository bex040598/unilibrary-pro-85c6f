type CitationInput = {
  title: string;
  authors: string[];
  year?: number | null;
  publisher?: string | null;
  isbn?: string | null;
};

export function generateCitations(input: CitationInput) {
  const authorText = input.authors.length > 0 ? input.authors.join(", ") : "Unknown author";
  const year = input.year ?? "n.d.";
  const publisher = input.publisher ?? "Unknown publisher";

  return {
    apa: `${authorText} (${year}). ${input.title}. ${publisher}.`,
    gost: `${authorText}. ${input.title}. - ${publisher}, ${year}.`,
    iso690: `${authorText}. ${input.title}. ${publisher}, ${year}. ISBN: ${input.isbn ?? "N/A"}.`,
    bibtex: `@book{${input.title.toLowerCase().replace(/\s+/g, "_")},\n  title = {${input.title}},\n  author = {${authorText}},\n  year = {${year}},\n  publisher = {${publisher}}\n}`
  };
}
