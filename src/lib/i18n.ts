import { defaultLocale, locales, type Locale } from "@/lib/constants";
import uz from "@/lib/locales/uz.json";
import ru from "@/lib/locales/ru.json";
import en from "@/lib/locales/en.json";

type Dictionary = {
  nav: Record<string, string>;
  home: Record<string, string>;
  auth: Record<string, string>;
  common: Record<string, string>;
  books: Record<string, string>;
};

const dictionaries: Record<Locale, Dictionary> = { uz, ru, en };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getLocale(value?: string) {
  if (value && isLocale(value)) {
    return value;
  }

  return defaultLocale;
}

export function getDictionary(locale: string) {
  return dictionaries[getLocale(locale)];
}
