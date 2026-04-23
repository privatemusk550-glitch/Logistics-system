/**
 * i18n/index.js
 * -------------
 * Sets up the react-i18next translation system.
 *
 * HOW IT WORKS:
 * 1. We import translation JSON files for each language
 * 2. i18next initialises with all languages and a fallback (English)
 * 3. It auto-detects the user's saved language from localStorage
 * 4. Import this file in main.jsx before rendering the app
 *
 * TO ADD A NEW LANGUAGE:
 * 1. Create a new file in /src/i18n/locales/xx.json (where xx = language code)
 * 2. Import it here and add it to the `resources` object
 * 3. Add it to the LANGUAGES array in Header.jsx
 *
 * For junior devs:
 * - `ns` means "namespace" — we just use one called 'translation' (the default)
 * - `fallbackLng` means: if a key is missing in the current language, use English
 * - `interpolation.escapeValue: false` is needed because React already escapes HTML
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all translation files
import en from './locales/en.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';

// Read saved language from localStorage, or use English as default
const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';

i18n
  .use(initReactI18next) // connects i18next to React
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      fr: { translation: fr },
    },
    lng: savedLanguage,        // starting language
    fallbackLng: 'en',         // fallback if key is missing
    interpolation: {
      escapeValue: false,      // React escapes strings automatically
    },
  });

// Set the correct text direction on load (Arabic is RTL)
document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';

export default i18n;
