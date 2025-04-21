
import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en';
import es from '../i18n/es';

// Define the translations type structure based on our translation files
type TranslationObject = typeof en;
type TranslationsType = {
  en: TranslationObject;
  es: TranslationObject;
};

const translations: TranslationsType = { en, es };
export type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

/**
 * Detect the browser's preferred language
 * Defaults to English if Spanish is not detected
 */
const detectBrowserLanguage = (): Language => {
  if (typeof navigator === 'undefined') return 'en';
  
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  return browserLang === 'es' ? 'es' : 'en';
};

/**
 * Get the saved language from localStorage or detect from browser
 */
const getSavedLanguage = (): Language => {
  try {
    const saved = localStorage.getItem('preferredLanguage');
    if (saved === 'en' || saved === 'es') return saved as Language;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
  }
  
  return detectBrowserLanguage();
};

/**
 * Helper function to get a nested value from an object using a dot-notation path
 */
const getNestedValue = (obj: any, path: string[]): string | undefined => {
  let current = obj;
  
  for (const key of path) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }
  
  return typeof current === 'string' ? current : undefined;
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(getSavedLanguage());

  /**
   * Enhanced translation function with fallback to English
   */
  const t = (key: string): string => {
    if (!key) return '';
    
    const keys = key.split('.');
    
    // Try in selected language
    const value = getNestedValue(translations[language], keys);
    
    if (value !== undefined) {
      return value;
    }
    
    // Fallback to English if key doesn't exist in selected language
    const fallbackValue = getNestedValue(translations.en, keys);
    
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    
    // Key missing in both languages
    return key;
  };

  /**
   * Format date according to current language locale
   */
  const formatDate = (date: Date | string, options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }): string => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = language === 'en' ? 'en-US' : 'es-ES';
    
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  };

  /**
   * Save language preference to localStorage and update html lang attribute
   */
  useEffect(() => {
    try {
      localStorage.setItem('preferredLanguage', language);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
    
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatDate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
