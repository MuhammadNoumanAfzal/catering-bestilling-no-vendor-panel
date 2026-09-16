import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import nb from "./nb";
import en from "./en";

const LANGUAGE_STORAGE_KEY = "vendor-portal-language";
const DEFAULT_LANGUAGE = "nb";
const supportedLanguages = ["nb", "en"];

function resolveInitialLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (supportedLanguages.includes(savedLanguage)) {
    return savedLanguage;
  }

  return DEFAULT_LANGUAGE;
}

const initialLanguage = resolveInitialLanguage();

i18n.use(initReactI18next).init({
  resources: { nb: { translation: nb }, en: { translation: en } },
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: supportedLanguages,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

document.documentElement.lang = initialLanguage;
i18n.on("languageChanged", (language) => {
  document.documentElement.lang = language;

  if (typeof window !== "undefined" && supportedLanguages.includes(language)) {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
});

export default i18n;
