import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import nb from "./nb";
import en from "./en";

const initialLanguage = "en";

i18n.use(initReactI18next).init({
  resources: { nb: { translation: nb }, en: { translation: en } },
  lng: initialLanguage,
  fallbackLng: "en",
  supportedLngs: ["nb", "en"],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

document.documentElement.lang = initialLanguage;
i18n.on("languageChanged", (language) => {
  document.documentElement.lang = language;
});

export default i18n;
