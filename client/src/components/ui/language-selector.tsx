
import React from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Globe } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

/**
 * Language selector component with improved UX
 * - Displays current language with flag/globe icon
 * - Shows tooltip explaining the feature
 * - Uses mobile-friendly select dropdown
 */
export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  // Get native language names
  const getLanguageName = (lang: Language): string => {
    // Display language names in their native form
    return lang === 'en' ? 'English' : 'Español';
  };

  // Handler for language change
  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[130px] flex items-center gap-2 px-3">
                <Globe className="h-4 w-4" />
                <SelectValue>
                  {getLanguageName(language)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en" className="cursor-pointer">
                  {getLanguageName('en')}
                </SelectItem>
                <SelectItem value="es" className="cursor-pointer">
                  {getLanguageName('es')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('common.language')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
