import { defaultLocale, locales, type Locale } from "@/lib/constants";

type Dictionary = {
  nav: Record<string, string>;
  home: Record<string, string>;
  auth: Record<string, string>;
  common: Record<string, string>;
};

const dictionaries: Record<Locale, Dictionary> = {
  uz: {
    nav: {
      catalog: "Katalog",
      departments: "Kafedralar",
      readingRoom: "O'quv zali",
      aiSearch: "AI qidiruv",
      help: "Yordam",
      login: "Kirish",
      admin: "Admin",
      contact: "Aloqa"
    },
    home: {
      badge: "ATMU Smart UniLibrary Enterprise",
      title: "Universitet bilim resurslari yagona raqamli ekotizimda",
      subtitle:
        "Elektron katalog, kafedralar resurslari, bosma kitoblar aylanishi, o'quv zali bron qilish va AI-ready qidiruv bitta platformada.",
      searchPlaceholder: "Kitob, muallif, kafedra, fan yoki kalit so'z kiriting..."
    },
    auth: {
      loginTitle: "Shaxsiy kabinetga kirish",
      registerTitle: "Yangi foydalanuvchi ro'yxatdan o'tishi"
    },
    common: {
      view: "Ko'rish",
      download: "Yuklab olish",
      save: "Saqlash",
      reserve: "Band qilish",
      citation: "Citation",
      search: "Qidirish"
    }
  },
  ru: {
    nav: {
      catalog: "Каталог",
      departments: "Кафедры",
      readingRoom: "Читальный зал",
      aiSearch: "AI поиск",
      help: "Помощь",
      login: "Войти",
      admin: "Админ",
      contact: "Контакты"
    },
    home: {
      badge: "ATMU Smart UniLibrary Enterprise",
      title: "Единая цифровая экосистема университетских знаний",
      subtitle:
        "Электронный каталог, кафедральные ресурсы, оборот печатных книг, бронирование читального зала и AI-ready поиск на одной платформе.",
      searchPlaceholder: "Введите книгу, автора, кафедру, предмет или ключевое слово..."
    },
    auth: {
      loginTitle: "Вход в личный кабинет",
      registerTitle: "Регистрация нового пользователя"
    },
    common: {
      view: "Открыть",
      download: "Скачать",
      save: "Сохранить",
      reserve: "Забронировать",
      citation: "Цитата",
      search: "Поиск"
    }
  },
  en: {
    nav: {
      catalog: "Catalog",
      departments: "Departments",
      readingRoom: "Reading Room",
      aiSearch: "AI Search",
      help: "Help",
      login: "Login",
      admin: "Admin",
      contact: "Contact"
    },
    home: {
      badge: "ATMU Smart UniLibrary Enterprise",
      title: "University knowledge resources in one digital ecosystem",
      subtitle:
        "Electronic catalog, department resources, circulation of printed books, reading-room booking, and AI-ready discovery in a single platform.",
      searchPlaceholder: "Search by book, author, department, course, or keyword..."
    },
    auth: {
      loginTitle: "Sign in to your account",
      registerTitle: "Create a new account"
    },
    common: {
      view: "View",
      download: "Download",
      save: "Save",
      reserve: "Reserve",
      citation: "Citation",
      search: "Search"
    }
  }
};

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
