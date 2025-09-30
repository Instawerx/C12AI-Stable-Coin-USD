import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { detectBrowserLanguage, getLanguagePreference } from '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeI18n = async () => {
      try {
        // Check for saved language preference
        const savedLanguage = getLanguagePreference();

        // If no saved preference, detect from browser
        const initialLanguage = savedLanguage || detectBrowserLanguage();

        // Set initial language if different from current
        if (i18n.language !== initialLanguage) {
          await i18n.changeLanguage(initialLanguage);
        }

        // Update document language attribute
        document.documentElement.lang = i18n.language;

        // Mark as initialized
        setIsInitialized(true);

        // Listen for language changes
        const handleLanguageChange = (lng: string) => {
          document.documentElement.lang = lng;

          // Update page direction for RTL languages
          document.documentElement.dir = lng === 'ar' || lng === 'he' ? 'rtl' : 'ltr';

          // Optional: Update page title based on language
          // This would depend on your routing solution
          console.log(`Language changed to: ${lng}`);
        };

        i18n.on('languageChanged', handleLanguageChange);

        // Cleanup listener on unmount
        return () => {
          i18n.off('languageChanged', handleLanguageChange);
        };

      } catch (error) {
        console.error('Failed to initialize i18n:', error);
        setIsInitialized(true); // Initialize anyway to prevent blocking
      }
    };

    initializeI18n();
  }, []);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading language preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};

export default I18nProvider;