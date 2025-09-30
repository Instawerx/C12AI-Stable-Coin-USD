# C12USD Localization Guide

This document describes the internationalization (i18n) implementation for the C12USD frontend application, supporting multiple languages for a global user base.

## 🌍 Overview

The C12USD application supports multiple languages using **react-i18next**, providing:

- **Dynamic Language Switching**: Users can change language at runtime
- **Automatic Language Detection**: Based on browser settings and user preferences
- **Persistent Language Preferences**: Saved in localStorage
- **Comprehensive Translation Coverage**: All user-facing text is translatable
- **Number and Date Formatting**: Locale-aware formatting
- **RTL Language Support**: Ready for right-to-left languages

## 🗣 Supported Languages

Currently supported languages:

| Language | Code | Flag | Native Name | Status |
|----------|------|------|-------------|---------|
| English  | `en` | 🇺🇸 | English     | Complete |
| Spanish  | `es` | 🇪🇸 | Español     | Complete |

### Adding New Languages

To add support for a new language:

1. **Create Translation Files**:
   ```bash
   mkdir -p frontend/src/locales/[lang_code]
   ```

2. **Add Translation Resources**:
   ```json
   // frontend/src/locales/[lang_code]/common.json
   {
     "common": { "loading": "Loading...", ... },
     "navigation": { "dashboard": "Dashboard", ... },
     "wallet": { "connect": "Connect Wallet", ... }
   }
   ```

3. **Update Language Configuration**:
   ```typescript
   // frontend/src/lib/i18n.ts
   export const supportedLanguages = [
     { code: 'en', name: 'English', flag: '🇺🇸' },
     { code: 'es', name: 'Español', flag: '🇪🇸' },
     { code: 'fr', name: 'Français', flag: '🇫🇷' }, // New language
   ];
   ```

## 📁 Project Structure

```
frontend/src/
├── locales/                    # Translation resources
│   ├── en/                    # English translations
│   │   ├── common.json        # Common terms, navigation, wallet
│   │   └── dashboard.json     # Dashboard-specific translations
│   └── es/                    # Spanish translations
│       ├── common.json        # Common terms in Spanish
│       └── dashboard.json     # Dashboard-specific in Spanish
├── lib/
│   └── i18n.ts               # i18n configuration and utilities
├── components/
│   ├── I18nProvider.tsx      # i18n provider wrapper
│   └── LanguageSwitcher.tsx  # Language switching component
└── __tests__/
    └── i18n.test.ts          # Localization tests
```

## 🔧 Configuration

### Core i18n Setup

The main configuration is in `frontend/src/lib/i18n.ts`:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

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

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'dashboard'],
    // ... other options
  });
```

### Language Detection

The system detects user language preference in this order:

1. **localStorage**: Previously saved preference
2. **sessionStorage**: Current session preference
3. **navigator**: Browser language setting
4. **htmlTag**: HTML lang attribute
5. **fallback**: English (`en`)

## 🎯 Usage in Components

### Basic Usage

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <div>
      <h1>{t('wallet.connect')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
};
```

### Multiple Namespaces

```typescript
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'common']);

  return (
    <div>
      <h1>{t('dashboard:dashboard.title')}</h1>
      <p>{t('common:wallet.connect')}</p>
    </div>
  );
};
```

### Interpolation

```typescript
const { t } = useTranslation('dashboard');

// Translation key: "subtitle": "Manage your C12USD tokens on {{network}}"
const subtitle = t('dashboard.subtitle', { network: 'BSC' });
// Result: "Manage your C12USD tokens on BSC"
```

### Pluralization

```typescript
// Translation keys:
// "item_one": "{{count}} token"
// "item_other": "{{count}} tokens"
const { t } = useTranslation('common');

const count = 5;
const message = t('item', { count }); // "5 tokens"
```

## 🔄 Language Switching

### Language Switcher Component

The `LanguageSwitcher` component provides three variants:

```typescript
// Dropdown (default)
<LanguageSwitcher />

// Button style
<LanguageSwitcher variant="button" />

// Minimal select
<LanguageSwitcher variant="minimal" />
```

### Programmatic Language Change

```typescript
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();

// Change language
const changeLanguage = async (languageCode: string) => {
  await i18n.changeLanguage(languageCode);
};

// Current language
const currentLanguage = i18n.language;
```

### Listening to Language Changes

```typescript
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();

useEffect(() => {
  const handleLanguageChange = (lng: string) => {
    console.log('Language changed to:', lng);
    // Update document language
    document.documentElement.lang = lng;
  };

  i18n.on('languageChanged', handleLanguageChange);

  return () => {
    i18n.off('languageChanged', handleLanguageChange);
  };
}, [i18n]);
```

## 🎨 Formatting Utilities

### Number Formatting

```typescript
import { formatNumber, formatCurrency } from '@/lib/i18n';

// Format numbers based on locale
formatNumber(1234.56, 'en'); // "1,234.56"
formatNumber(1234.56, 'es'); // "1.234,56"

// Format currency
formatCurrency(1234.56, 'USD', 'en'); // "$1,234.56"
formatCurrency(1234.56, 'EUR', 'es'); // "1.234,56 €"
```

### Date Formatting

```typescript
import { formatDate, formatDateTime } from '@/lib/i18n';

const date = new Date('2024-09-24T15:30:00Z');

// Format dates
formatDate(date, 'en'); // "9/24/2024"
formatDate(date, 'es'); // "24/9/2024"

// Format date-time
formatDateTime(date, 'en'); // "9/24/2024, 3:30:00 PM"
formatDateTime(date, 'es'); // "24/9/2024 15:30:00"
```

## 🗂 Translation Organization

### Namespace Structure

**common.json** - Shared across all components:
```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "settings": "Settings"
  },
  "wallet": {
    "connect": "Connect Wallet",
    "disconnect": "Disconnect"
  }
}
```

**dashboard.json** - Dashboard-specific translations:
```json
{
  "dashboard": {
    "title": "Dashboard",
    "subtitle": "Manage your C12USD tokens on {{network}}"
  },
  "tokenBalance": {
    "title": "Token Balance",
    "failedToLoad": "Failed to load balance"
  },
  "transfer": {
    "title": "Transfer C12USD",
    "recipientAddress": "Recipient Address"
  }
}
```

### Translation Key Naming

Use consistent naming conventions:

- **Hierarchical**: `dashboard.tokenBalance.title`
- **Descriptive**: `transfer.validation.insufficientBalance`
- **Action-based**: `buttons.connectWallet`, `errors.transactionFailed`

## 🧪 Testing

### Running Translation Tests

```bash
# Run all i18n tests
npm test i18n.test.ts

# Run specific test suites
npm test -- --testNamePattern="Language Detection"
npm test -- --testNamePattern="Translation Content"
```

### Test Coverage

The test suite covers:

- **Configuration**: Language initialization and resource loading
- **Path Utilities**: Language-aware URL handling
- **Formatting**: Number, currency, and date formatting
- **Language Detection**: Browser language detection
- **Translation Content**: Key validation and interpolation
- **Language Switching**: Runtime language changes
- **Error Handling**: Graceful fallbacks and missing keys

### Writing Translation Tests

```typescript
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

const renderWithI18n = (component: React.ReactNode, language = 'en') => {
  i18n.changeLanguage(language);
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

test('should display translated text', () => {
  renderWithI18n(<MyComponent />, 'es');
  expect(screen.getByText('Conectar Billetera')).toBeInTheDocument();
});
```

## 📱 Responsive Design Considerations

### Mobile Language Switcher

```typescript
// Desktop: minimal select in header
<LanguageSwitcher variant="minimal" className="hidden sm:flex" />

// Mobile: button style in connect wallet area
<div className="sm:hidden flex justify-center">
  <LanguageSwitcher variant="button" />
</div>
```

### Touch-Friendly Interactions

The language switcher components are optimized for touch devices:

- **Large Touch Targets**: Minimum 44px tap areas
- **Clear Visual Feedback**: Hover and active states
- **Accessible**: Proper ARIA labels and keyboard navigation

## 🔒 Security and Privacy

### Data Storage

- **localStorage**: Language preference only
- **No Personal Data**: No personal information in translation keys
- **Secure Defaults**: Fallback to English for unknown preferences

### Content Security

- **XSS Prevention**: All translations are properly escaped
- **Input Validation**: Translation keys are validated
- **Safe HTML**: Limited HTML support in translations

## 🚀 Performance Optimization

### Code Splitting

Translations are loaded dynamically:

```typescript
// Lazy load translation resources
const loadTranslations = async (language: string) => {
  const common = await import(`../locales/${language}/common.json`);
  const dashboard = await import(`../locales/${language}/dashboard.json`);

  return { common, dashboard };
};
```

### Bundle Size Optimization

- **Tree Shaking**: Only imported translations are bundled
- **Compression**: JSON files are minified in production
- **Caching**: Browser caches translation resources

## 🛠 Development Tools

### Translation Key Extraction

```bash
# Extract translation keys from components (if using i18next-parser)
npx i18next-parser

# Validate translation completeness
npm run i18n:validate
```

### Missing Translation Detection

Development mode logs missing translations:

```typescript
// In development, missing keys are logged
i18n.init({
  saveMissing: process.env.NODE_ENV === 'development',
  missingKeyHandler: (lng, ns, key, fallbackValue) => {
    console.warn(`Missing translation: ${lng}.${ns}.${key}`);
  },
});
```

## 🌐 Deployment Considerations

### Build Configuration

```bash
# Production build with all languages
npm run build

# Language-specific builds (if needed)
LANGUAGES=en,es npm run build
```

### CDN and Caching

- **Static Assets**: Translation files are cached with versioning
- **Cache Invalidation**: New translations trigger cache updates
- **Compression**: Gzip compression for JSON files

## 📊 Analytics and Monitoring

### Language Usage Tracking

```typescript
// Track language preferences (anonymized)
const trackLanguageChange = (newLanguage: string) => {
  analytics.track('language_changed', {
    language: newLanguage,
    timestamp: new Date().toISOString(),
  });
};
```

### Translation Coverage Metrics

- **Completion Rate**: Percentage of keys translated per language
- **Usage Statistics**: Most/least used translation keys
- **Error Tracking**: Missing translation incidents

## 🔄 Content Management

### Translation Workflow

1. **Development**: Add new translation keys in English
2. **Extraction**: Export keys for translation
3. **Translation**: Professional translators provide translations
4. **Review**: Native speakers review translations
5. **Integration**: Update translation files
6. **Testing**: Verify translations in UI
7. **Deployment**: Release with new translations

### Version Control

```bash
# Translation files are versioned with the codebase
git add frontend/src/locales/
git commit -m "feat: add Spanish translations for dashboard"

# Track translation changes
git diff --name-only HEAD~1 | grep "locales/"
```

## 🐛 Troubleshooting

### Common Issues

**Problem**: Translations not updating after language change
```typescript
// Solution: Check component re-render
const { t, i18n } = useTranslation();

useEffect(() => {
  // Force re-render on language change
  const handleLanguageChange = () => forceUpdate();
  i18n.on('languageChanged', handleLanguageChange);
  return () => i18n.off('languageChanged', handleLanguageChange);
}, [i18n]);
```

**Problem**: Interpolation not working
```typescript
// Incorrect
t('dashboard.subtitle', 'BSC');

// Correct
t('dashboard.subtitle', { network: 'BSC' });
```

**Problem**: Missing translation warnings in production
```typescript
// Only enable in development
const config = {
  saveMissing: process.env.NODE_ENV === 'development',
  debug: process.env.NODE_ENV === 'development',
};
```

### Debug Mode

Enable detailed logging:

```typescript
i18n.init({
  debug: true, // Enable detailed logging
  saveMissing: true, // Log missing keys
});
```

## 📚 Resources

### Documentation
- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [Internationalization Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Internationalization_API)

### Tools
- [i18next-parser](https://github.com/i18next/i18next-parser) - Extract translation keys
- [i18next-browser-languageDetector](https://github.com/i18next/i18next-browser-languageDetector) - Browser language detection
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/) - Advanced formatting

### Community
- [i18next Community](https://github.com/i18next/i18next/discussions)
- [React i18next Examples](https://github.com/i18next/react-i18next/tree/master/example)

---

This localization implementation provides a robust foundation for supporting C12USD users globally, with easy maintenance and extensibility for additional languages and regions.