
import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import { Code } from '../types';
import { CODES_MASTER } from '../data/codes';


type Language = 'es' | 'en' | 'ka';

interface LanguageContextType {
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  codes: Code[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, Record<string, string>> | null>(null);

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'en' || browserLang === 'es' || browserLang === 'ka') {
      setLang(browserLang);
    }

    const fetchTranslations = async () => {
      try {
        const [esRes, enRes, kaRes] = await Promise.all([
          fetch('/SlangDecoder/locales/es.json'),
          fetch('/SlangDecoder/locales/en.json'),
          fetch('/SlangDecoder/locales/ka.json'),
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
  
  const t = (key: string): string => {
    if (!translations) return key; // Return key if not loaded
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const codes: Code[] = useMemo(() => {
    if (!translations) return [];
    return CODES_MASTER.map(masterCode => ({
      ...masterCode,
      meaning: t(masterCode.meaningKey)
    }));
  }, [lang, translations]);


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
    codes,
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