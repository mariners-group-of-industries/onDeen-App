import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, {InitOptions} from 'i18next';
import {initReactI18next} from 'react-i18next';

import enTranslation from './en.json';
import arTranslation from './ar.json';

const resources = {
  en: {translation: enTranslation},
  ar: {translation: arTranslation},
};

type CustomI18nConfig = InitOptions & {
  compatibilityJSON: string;
  storage: typeof AsyncStorage;
};

const i18nConfig: CustomI18nConfig = {
  compatibilityJSON: 'v3',
  lng: 'en',
  fallbackLng: 'ar',
  resources,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  storage: AsyncStorage,
};

i18n
  .use(initReactI18next)
  .init(i18nConfig)
  .then(() => {
    // i18n is initialized
  });

export default i18n;
