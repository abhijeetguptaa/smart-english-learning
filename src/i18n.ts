import i18n, { BackendModule } from 'i18next';
import { initReactI18next } from 'react-i18next';

const supportedLngs = ['en'];

const localeLoaders: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import('./locales/en/en.json'),
};

const dynamicLocaleBackend: BackendModule = {
  type: 'backend',
  init: () => {},
  read: async (language, _namespace, callback) => {
    try {
      const loader = localeLoaders[language] || localeLoaders.en;
      const module = await loader();
      callback(null, module.default);
    } catch (error) {
      callback(error as Error, false);
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
