import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ptBR from "./pt-BR.json";
import en from "./en.json";

const savedLanguage = localStorage.getItem("oee_language") || "pt-BR";

i18n.use(initReactI18next).init({
  resources: {
    "pt-BR": { translation: ptBR },
    en: { translation: en },
  },
  lng: savedLanguage,
  fallbackLng: "pt-BR",
  interpolation: {
    escapeValue: false,
  },
});

export function changeLanguage(lang: "pt-BR" | "en") {
  localStorage.setItem("oee_language", lang);
  i18n.changeLanguage(lang);
}

export default i18n;
