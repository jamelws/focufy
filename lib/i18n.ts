import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// importa los objetos .ts en lugar de .json
import es from "@/locales/es/translation";
import en from "@/locales/en/translation";
import fr from "@/locales/fr/translation";

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: "es", // idioma por defecto
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
