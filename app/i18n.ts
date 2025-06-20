import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "./locales/en-US/translation.json";
import ptTranslations from "./locales/pt-BR/translation.json";

const resources = {
  "en-US": {
    translation: enTranslations
  },
  "pt-BR": {
    translation: ptTranslations
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "pt-BR",

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

  export default i18n;
