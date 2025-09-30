Agent: frontend
Goal: Implement internationalisation and localisation support in the user interface.
Steps:
- Install and configure an i18n library (e.g. i18next or react-i18next) for your chosen framework.
- Create translation resource files (such as `en.json`, `es.json`, etc.) inside a `locales` directory.
- Replace all hard‑coded user‑facing strings with translation keys and wrap components using translation hooks or providers.
- Implement language detection based on user preference, browser settings, or IP geolocation, and allow manual switching via a language selector.
- Optionally store translation resources in Firestore or another source if dynamic updates are needed.
- Write tests to verify that translations load correctly, switching languages works, and fallback logic is triggered when a key is missing.
Acceptance:
- Users can switch UI language at runtime and translations update without reloading.
- All visible text comes from translation resources with sensible fallbacks.
- Tests confirm translation loading, language switching, and fallback behaviour.
