import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { supportedLanguages, saveLanguagePreference } from '@/lib/i18n';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'button' | 'dropdown' | 'minimal';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'dropdown'
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = supportedLanguages.find(lang => lang.code === i18n.language) || supportedLanguages[0];

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      saveLanguagePreference(languageCode);
      setIsOpen(false);

      // Optional: Reload page to ensure all components update
      // This can be removed if all components properly react to language changes
      if (typeof window !== 'undefined') {
        // Update document language attribute
        document.documentElement.lang = languageCode;

        // Update page title if needed
        const title = document.title;
        if (title.includes('C12USD')) {
          // Keep the title updated if it contains translatable text
          // This would need to be implemented based on your routing solution
        }
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  if (variant === 'button') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {supportedLanguages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`
              px-2 py-1 text-xs font-medium rounded transition-all duration-200
              ${i18n.language === language.code
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }
            `}
            title={language.name}
          >
            {language.flag}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`inline-flex ${className}`}>
        <select
          value={i18n.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="bg-transparent text-sm text-gray-400 hover:text-primary-400 focus:outline-none focus:text-primary-400 cursor-pointer"
          title="Select Language"
        >
          {supportedLanguages.map((language) => (
            <option key={language.code} value={language.code} className="bg-gray-800 text-white">
              {language.flag} {language.code.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition-colors duration-200"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">
          {currentLanguage.flag} {currentLanguage.code.toUpperCase()}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-20 animate-fade-in">
            <div className="py-1">
              {supportedLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-base">{language.flag}</span>
                    <span>{language.name}</span>
                  </div>
                  {i18n.language === language.code && (
                    <Check className="w-4 h-4 text-primary-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Language Info */}
            <div className="border-t border-gray-600 px-4 py-2">
              <p className="text-xs text-gray-500">
                Language preference is saved automatically
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;