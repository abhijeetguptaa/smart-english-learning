import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const supportedLngs = ['en'];

const localeLoaders = {
  en: () => import('./locales/en/en.json'),
};

const dynamicLocaleBackend = {
  type: 'backend',
  init: () => {},
  read: async (language, _namespace, callback) => {
    try {
      const loader = localeLoaders.en;
      const module = await loader();
      callback(null, module.default);
    } catch (error) {
      callback(error, false);
    }
  },
};

i18n
  .use(dynamicLocaleBackend)
  .use(initReactI18next)
  .init({
    debug: import.meta.env.DEV,
    fallbackLng: 'en',
    supportedLngs,
    ns: ['translation'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
