import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Code, CodeCategory } from '../types';
import getExplanation from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

const categoryStyles: { [key in CodeCategory]: { bg: string; text: string; border: string } } = {
  [CodeCategory.DANGEROUS]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500' },
  [CodeCategory.PREDATOR]: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-500' },
  [CodeCategory.HARMLESS]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500' },
};

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

interface ResultCardProps {
  code: Code;
  onSelect: (code: Code) => void;
  isActive: boolean;
  explanation: string | null;
  isLoading: boolean;
  categoryText: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ code, onSelect, isActive, explanation, isLoading, categoryText }) => {
  const styles = categoryStyles[code.category];

  return (
    <div
      className={`border-l-4 ${styles.border} ${styles.bg} p-4 rounded-r-lg shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md hover:bg-opacity-80`}
      onClick={() => onSelect(code)}
      role="button"
      aria-expanded={isActive}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{code.code}</h3>
          <p className="text-gray-600">{code.meaning}</p>
        </div>
        <div className="flex items-center space-x-2">
          {code.lang && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700 border border-gray-400">{code.lang.toUpperCase()}</span>}
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles.bg} ${styles.text} border ${styles.border}`}>{categoryText}</span>
        </div>
      </div>
      {isActive && (
        <div className="mt-4 pt-4 border-t border-gray-300">
          {isLoading ? (
            <Spinner />
          ) : (
            <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: explanation ? explanation.replace(/\n/g, '<br />') : '' }} />
          )}
        </div>
      )}
    </div>
  );
};

const Search: React.FC = () => {
  const { t, lang, allCodes } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCode, setActiveCode] = useState<Code | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [geminiResponses, setGeminiResponses] = useState<Record<string, string>>({});

  const geminiCache = useRef<Map<string, string>>(new Map());

  // Load cache from localStorage on initial render
  useState(() => {
    try {
      const cachedData = localStorage.getItem('geminiCache');
      if (cachedData) {
        geminiCache.current = new Map(JSON.parse(cachedData));
      }
    } catch (error) {
      console.error("Failed to parse Gemini cache from localStorage", error);
    }
  });

  const filteredCodes = useMemo(() => {
    if (searchTerm.trim() === '') {
      return [];
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allCodes.filter(
      code =>
        code.code.toLowerCase().includes(lowerCaseSearchTerm) ||
        code.meaning.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm, allCodes]);

  const handleSelectCode = useCallback(async (code: Code) => {
    if (activeCode?.code === code.code && activeCode?.lang === code.lang) {
      setActiveCode(null);
      return;
    }

    setActiveCode(code);
    
    const cacheKey = `${lang}:${code.code}`;
    const responseKey = `${code.code}-${code.lang}`;

    if (geminiCache.current.has(cacheKey)) {
      setGeminiResponses(prev => ({ ...prev, [responseKey]: geminiCache.current.get(cacheKey)! }));
      return;
    }

    setLoadingStates(prev => ({ ...prev, [responseKey]: true }));
    try {
      const explanation = await getExplanation(code, lang);
      geminiCache.current.set(cacheKey, explanation);
      localStorage.setItem('geminiCache', JSON.stringify(Array.from(geminiCache.current.entries())));
      setGeminiResponses(prev => ({ ...prev, [responseKey]: explanation }));
    } catch (error) {
      console.error(error);
      setGeminiResponses(prev => ({ ...prev, [responseKey]: t('explanationError') }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [responseKey]: false }));
    }
  }, [activeCode, lang, t]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    if(newSearchTerm.trim() === '') {
        setActiveCode(null);
    }
  }

  return (
    <>
      <header className="text-center mb-8">
        <div className="inline-block bg-indigo-600 text-white p-3 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.789-2.75 9.565M12 11c0-3.517.99-6.789 2.75-9.565M12 11H3.344a1 1 0 00-1 1v1a1 1 0 001 1h.172M12 11h8.656a1 1 0 011 1v1a1 1 0 01-1 1h-.172M7.25 21.435a8.96 8.96 0 01-4.124-3.138 1 1 0 01.328-1.393l.002-.001.002-.001a1 1 0 011.393.328 6.96 6.96 0 003.202 2.457 1 1 0 01-.803 1.747zM16.75 2.565a8.96 8.96 0 014.124 3.138 1 1 0 01-.328 1.393l-.002.001-.002.001a1 1 0 01-1.393-.328 6.96 6.96 0 00-3.202-2.457 1 1 0 01.803-1.747z" /></svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">{t('appTitle')}</h1>
        <p className="mt-4 text-lg text-gray-600">{t('appSubtitle')}</p>
      </header>

      <div className="relative mb-8">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={t('searchPlaceholder')}
          className="w-full p-4 pl-12 text-lg border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 shadow-sm"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="space-y-4">
        {searchTerm.trim() !== '' && filteredCodes.length > 0 && filteredCodes.map(code => (
          <ResultCard
            key={`${code.code}-${code.lang}`}
            code={code}
            onSelect={handleSelectCode}
            isActive={activeCode?.code === code.code && activeCode?.lang === code.lang}
            explanation={geminiResponses[`${code.code}-${code.lang}`] || null}
            isLoading={loadingStates[`${code.code}-${code.lang}`] || false}
            categoryText={t(code.category)}
          />
        ))}
        {searchTerm.trim() !== '' && filteredCodes.length === 0 && (
          <div className="text-center p-8 bg-white rounded-lg shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="mt-4 text-gray-600 font-semibold">{t('noResults')} "{searchTerm}".</p>
            <p className="text-sm text-gray-500">{t('tryAnotherSearch')}</p>
          </div>
        )}
        {searchTerm.trim() === '' && (
          <div className="text-center p-8 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16l-4-4m0 0l4-4m-4 4h18" /></svg>
            <p className="mt-4 text-gray-600 font-semibold">{t('startTyping')}</p>
            <p className="text-sm text-gray-500">{t('resultsAppearHere')}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Search;