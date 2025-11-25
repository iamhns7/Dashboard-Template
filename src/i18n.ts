import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './utils/translate/En.json';
import tr from './utils/translate/Tr.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      tr: { translation: tr }
    },
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
