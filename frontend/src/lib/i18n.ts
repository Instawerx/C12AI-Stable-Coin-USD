import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources
import enCommon from '../locales/en/common.json';
import enDashboard from '../locales/en/dashboard.json';
import esCommon from '../locales/es/common.json';
import esDashboard from '../locales/es/dashboard.json';

// Translation resources
const resources = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
  },
  es: {
    common: esCommon,
    dashboard: esDashboard,
  },
};

// Supported languages
export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

// Language detection options
const detectionOptions = {
  // Order of detection methods
  order: [
    'localStorage',
    'sessionStorage',
    'navigator',
    'htmlTag',
    'path',
    'subdomain'
  ],

  // Keys to look for in localStorage/sessionStorage
  lookupLocalStorage: 'i18nextLng',
  lookupSessionStorage: 'i18nextLng',

  // Cache the detected language
  caches: ['localStorage'],

  // Exclude certain languages from detection
  excludeCacheFor: ['cimode'],

  // Check for language preference in URL path
  checkWhitelist: true,

  // Fallback to default if detection fails
  fallbackLng: 'en',
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'dashboard'],

    detection: detectionOptions,

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false, // Disable suspense for better error handling
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em'],
    },

    // Development options
    debug: process.env.NODE_ENV === 'development',

    // Performance options
    load: 'languageOnly', // Load only language code, not region
    cleanCode: true, // Clean language codes

    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',

    // Missing translations
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation: ${lng}.${ns}.${key}`);
      }
    },

    // Post-processing
    postProcess: ['interval', 'plural'],
  });

// Custom hooks and utilities
export const getLanguageFromPath = (pathname: string): string | null => {
  const segments = pathname.split('/').filter(Boolean);
  const langCode = segments[0];

  return supportedLanguages.some(lang => lang.code === langCode) ? langCode : null;
};

export const getPathWithoutLanguage = (pathname: string): string => {
  const langCode = getLanguageFromPath(pathname);
  if (langCode) {
    return pathname.replace(`/${langCode}`, '') || '/';
  }
  return pathname;
};

export const getLocalizedPath = (pathname: string, language: string): string => {
  const pathWithoutLang = getPathWithoutLanguage(pathname);
  return language === 'en' ? pathWithoutLang : `/${language}${pathWithoutLang}`;
};

// Format numbers and currencies based on locale
export const formatNumber = (value: number, language: string = 'en'): string => {
  return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US').format(value);
};

export const formatCurrency = (
  value: number,
  currency: string = 'USD',
  language: string = 'en'
): string => {
  return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US', {
    style: 'currency',
    currency,
  }).format(value);
};

// Date formatting
export const formatDate = (date: Date | string, language: string = 'en'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US');
};

export const formatDateTime = (date: Date | string, language: string = 'en'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(language === 'es' ? 'es-ES' : 'en-US');
};

// Storage helpers
export const saveLanguagePreference = (language: string): void => {
  localStorage.setItem('i18nextLng', language);
};

export const getLanguagePreference = (): string | null => {
  return localStorage.getItem('i18nextLng');
};

// Browser language detection
export const detectBrowserLanguage = (): string => {
  const browserLang = navigator.language.split('-')[0];
  return supportedLanguages.some(lang => lang.code === browserLang) ? browserLang : 'en';
};

// Validation helpers
export const isRTL = (language: string): boolean => {
  // Add RTL languages here if needed
  const rtlLanguages = ['ar', 'he', 'fa'];
  return rtlLanguages.includes(language);
};

export const validateTranslationKey = (key: string): boolean => {
  return i18n.exists(key);
};

export default i18n;