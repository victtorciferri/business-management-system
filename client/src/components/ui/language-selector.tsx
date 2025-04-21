
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <Select value={language} onValueChange={(value: 'en' | 'es') => setLanguage(value)}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder={t('common.language')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{t('common.english')}</SelectItem>
        <SelectItem value="es">{t('common.spanish')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
