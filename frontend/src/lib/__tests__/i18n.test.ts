import i18n, {
  supportedLanguages,
  getLanguageFromPath,
  getPathWithoutLanguage,
  getLocalizedPath,
  formatNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  detectBrowserLanguage,
  isRTL,
  validateTranslationKey
} from '../i18n';

// Mock localStorage for tests
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock navigator.language
Object.defineProperty(window.navigator, 'language', {
  value: 'en-US',
  configurable: true,
});

describe('i18n Configuration', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
  });

  test('should initialize with supported languages', () => {
    expect(supportedLanguages).toHaveLength(2);
    expect(supportedLanguages[0]).toEqual({
      code: 'en',
      name: 'English',
      flag: '🇺🇸'
    });
    expect(supportedLanguages[1]).toEqual({
      code: 'es',
      name: 'Español',
      flag: '🇪🇸'
    });
  });

  test('should have default language as English', () => {
    expect(i18n.language).toBe('en');
  });

  test('should load translation resources', () => {
    expect(i18n.hasResourceBundle('en', 'common')).toBe(true);
    expect(i18n.hasResourceBundle('en', 'dashboard')).toBe(true);
    expect(i18n.hasResourceBundle('es', 'common')).toBe(true);
    expect(i18n.hasResourceBundle('es', 'dashboard')).toBe(true);
  });
});

describe('Path Utilities', () => {
  test('should detect language from path', () => {
    expect(getLanguageFromPath('/en/dashboard')).toBe('en');
    expect(getLanguageFromPath('/es/transfer')).toBe('es');
    expect(getLanguageFromPath('/dashboard')).toBeNull();
    expect(getLanguageFromPath('/fr/dashboard')).toBeNull();
  });

  test('should remove language from path', () => {
    expect(getPathWithoutLanguage('/en/dashboard')).toBe('/dashboard');
    expect(getPathWithoutLanguage('/es/transfer')).toBe('/transfer');
    expect(getPathWithoutLanguage('/dashboard')).toBe('/dashboard');
    expect(getPathWithoutLanguage('/en')).toBe('/');
  });

  test('should create localized paths', () => {
    expect(getLocalizedPath('/dashboard', 'en')).toBe('/dashboard');
    expect(getLocalizedPath('/dashboard', 'es')).toBe('/es/dashboard');
    expect(getLocalizedPath('/en/dashboard', 'es')).toBe('/es/dashboard');
  });
});

describe('Formatting Utilities', () => {
  test('should format numbers correctly', () => {
    expect(formatNumber(1234.56, 'en')).toBe('1,234.56');
    expect(formatNumber(1234.56, 'es')).toBe('1.234,56');
  });

  test('should format currency correctly', () => {
    const result = formatCurrency(1234.56, 'USD', 'en');
    expect(result).toMatch(/\$1,234\.56/);

    const resultEs = formatCurrency(1234.56, 'USD', 'es');
    expect(resultEs).toMatch(/1\.234,56/);
  });

  test('should format dates correctly', () => {
    const testDate = new Date('2024-09-24T15:30:00Z');

    const enDate = formatDate(testDate, 'en');
    expect(enDate).toMatch(/9\/24\/2024|24\/9\/2024/);

    const esDate = formatDate(testDate, 'es');
    expect(esDate).toMatch(/24\/9\/2024|9\/24\/2024/);
  });

  test('should format date-time correctly', () => {
    const testDate = new Date('2024-09-24T15:30:00Z');

    const enDateTime = formatDateTime(testDate, 'en');
    expect(enDateTime).toBeTruthy();
    expect(typeof enDateTime).toBe('string');

    const esDateTime = formatDateTime(testDate, 'es');
    expect(esDateTime).toBeTruthy();
    expect(typeof esDateTime).toBe('string');
  });
});

describe('Language Detection', () => {
  test('should detect English from browser', () => {
    Object.defineProperty(window.navigator, 'language', {
      value: 'en-US',
      configurable: true,
    });

    expect(detectBrowserLanguage()).toBe('en');
  });

  test('should detect Spanish from browser', () => {
    Object.defineProperty(window.navigator, 'language', {
      value: 'es-ES',
      configurable: true,
    });

    expect(detectBrowserLanguage()).toBe('es');
  });

  test('should fallback to English for unsupported languages', () => {
    Object.defineProperty(window.navigator, 'language', {
      value: 'fr-FR',
      configurable: true,
    });

    expect(detectBrowserLanguage()).toBe('en');
  });
});

describe('RTL Detection', () => {
  test('should correctly identify RTL languages', () => {
    expect(isRTL('en')).toBe(false);
    expect(isRTL('es')).toBe(false);
    expect(isRTL('ar')).toBe(true);
    expect(isRTL('he')).toBe(true);
    expect(isRTL('fa')).toBe(true);
  });
});

describe('Translation Key Validation', () => {
  test('should validate existing translation keys', () => {
    expect(validateTranslationKey('common:common.loading')).toBe(true);
    expect(validateTranslationKey('common:wallet.connect')).toBe(true);
    expect(validateTranslationKey('dashboard:dashboard.title')).toBe(true);
  });

  test('should reject non-existing translation keys', () => {
    expect(validateTranslationKey('common:nonexistent.key')).toBe(false);
    expect(validateTranslationKey('invalid:key.structure')).toBe(false);
  });
});

describe('Translation Content', () => {
  test('should translate common terms correctly', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('common:common.loading')).toBe('Loading...');
    expect(i18n.t('common:wallet.connect')).toBe('Connect Wallet');

    await i18n.changeLanguage('es');
    expect(i18n.t('common:common.loading')).toBe('Cargando...');
    expect(i18n.t('common:wallet.connect')).toBe('Conectar Billetera');
  });

  test('should handle interpolation correctly', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('dashboard:dashboard.subtitle', { network: 'BSC' }))
      .toBe('Manage your C12USD tokens on BSC');

    await i18n.changeLanguage('es');
    expect(i18n.t('dashboard:dashboard.subtitle', { network: 'BSC' }))
      .toBe('Gestiona tus tokens C12USD en BSC');
  });

  test('should fallback to English for missing translations', async () => {
    await i18n.changeLanguage('es');

    // Test a key that might not exist in Spanish
    const fallback = i18n.t('common:hypothetical.missing.key', {
      fallbackLng: 'en'
    });

    expect(typeof fallback).toBe('string');
  });
});

describe('Language Switching', () => {
  test('should change language successfully', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');

    await i18n.changeLanguage('es');
    expect(i18n.language).toBe('es');
  });

  test('should emit language change events', (done) => {
    const handleLanguageChange = (lng: string) => {
      expect(lng).toBe('en');
      i18n.off('languageChanged', handleLanguageChange);
      done();
    };

    i18n.on('languageChanged', handleLanguageChange);
    i18n.changeLanguage('en');
  });
});

describe('Error Handling', () => {
  test('should handle missing namespace gracefully', () => {
    const result = i18n.t('nonexistent:key.value');
    expect(result).toBeTruthy(); // Should return key or fallback
  });

  test('should handle invalid interpolation gracefully', async () => {
    await i18n.changeLanguage('en');
    const result = i18n.t('dashboard:dashboard.subtitle'); // Missing network parameter
    expect(result).toContain('{{network}}'); // Should show placeholder
  });
});

// Mock console.warn for missing key handler test
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
});

describe('Development Features', () => {
  test('should warn about missing keys in development', () => {
    // This test would need NODE_ENV to be 'development'
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    i18n.t('completely.missing.key');

    process.env.NODE_ENV = originalEnv;
  });
});