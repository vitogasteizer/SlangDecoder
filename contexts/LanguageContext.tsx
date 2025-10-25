
import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import { Code } from '../types';
import { CODES_ES } from '../data/codes.es';
import { CODES_EN } from '../data/codes.en';
import { CODES_KA } from '../data/codes.ka';


type Language = 'es' | 'en' | 'ka';

interface LanguageContextType {
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  codes: Code[];
  allCodes: Code[];
}

const codeData: Record<Language, Code[]> = {
  es: CODES_ES,
  en: CODES_EN,
  ka: CODES_KA,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('es');
  const [translations, setTranslations] = useState<Record<string, Record<string, string>> | null>(null);

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'en' || browserLang === 'es' || browserLang === 'ka') {
      setLang(browserLang);
    }

    const fetchTranslations = async () => {
      try {
        const [esRes, enRes, kaRes] = await Promise.all([
          fetch('locales/es.json'),
          fetch('locales/en.json'),
          fetch('locales/ka.json'),
        ]);
        if (!esRes.ok || !enRes.ok || !kaRes.ok) {
          throw new Error('Failed to fetch translation files');
        }
        const esData = await esRes.json();
        const enData = await enRes.json();
        const kaData = await kaRes.json();
        setTranslations({ es: esData, en: enData, ka: kaData });
      } catch (error) {
        console.error("Failed to load translation files", error);
        // Fallback to empty objects to prevent app crash
        setTranslations({ es: {}, en: {}, ka: {} });
      }
    };
    fetchTranslations();
  }, []);

  const allCodes = useMemo(() => {
    const esCodesWithLang = CODES_ES.map(code => ({ ...code, lang: 'es' as const }));
    const enCodesWithLang = CODES_EN.map(code => ({ ...code, lang: 'en' as const }));
    const kaCodesWithLang = CODES_KA.map(code => ({ ...code, lang: 'ka' as const }));
    return [...esCodesWithLang, ...enCodesWithLang, ...kaCodesWithLang];
  }, []);

  const t = (key: string): string => {
    if (!translations) return ''; // Return empty string or key if not loaded
    return translations[lang]?.[key] || key;
  };

  if (!translations) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const value = {
    lang,
    setLanguage: setLang,
    t,
    codes: codeData[lang],
    allCodes: allCodes,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};