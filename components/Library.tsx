
import React, { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Code, CodeCategory } from '../types';

const categoryOrder = [CodeCategory.DANGEROUS, CodeCategory.PREDATOR, CodeCategory.HARMLESS];

const categoryStyles: { [key in CodeCategory]: { border: string; bg: string; text: string } } = {
  [CodeCategory.DANGEROUS]: { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-800' },
  [CodeCategory.PREDATOR]: { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-800' },
  [CodeCategory.HARMLESS]: { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-800' },
};

const Library: React.FC = () => {
  const { t, codes } = useLanguage();

  const groupedCodes = useMemo(() => {
    const groups: { [key in CodeCategory]?: Code[] } = {};
    for (const code of codes) {
      if (!groups[code.category]) {
        groups[code.category] = [];
      }
      groups[code.category]?.push(code);
    }
    // Sort codes within each category alphabetically
    for (const category in groups) {
      groups[category as CodeCategory]?.sort((a, b) => a.code.localeCompare(b.code));
    }
    return groups;
  }, [codes]);

  const handleScrollToCategory = (categoryKey: CodeCategory) => {
    const element = document.getElementById(categoryKey);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">{t('libraryTitle')}</h1>
        <p className="mt-4 text-lg text-gray-600">{t('libraryDescription')}</p>
      </header>

      <nav className="sticky top-20 bg-white/90 backdrop-blur-sm z-10 shadow-sm rounded-full mb-8 py-2 px-2 border">
        <div className="flex justify-center items-center flex-wrap gap-2">
          {categoryOrder.map(categoryKey => (
            <button
              key={categoryKey}
              onClick={() => handleScrollToCategory(categoryKey)}
              className="px-3 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
            >
              {t(categoryKey)}
            </button>
          ))}
        </div>
      </nav>


      <div className="space-y-8">
        {categoryOrder.map(categoryKey => {
          const codesForCategory = groupedCodes[categoryKey];
          if (!codesForCategory || codesForCategory.length === 0) return null;
          
          const styles = categoryStyles[categoryKey];

          return (
            <section key={categoryKey} id={categoryKey} className={`rounded-lg shadow-md border-t-4 ${styles.border} ${styles.bg} scroll-mt-32`}>
              <h2 className={`text-2xl font-bold p-4 ${styles.text} rounded-t-lg`}>
                {t(categoryKey)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
                {codesForCategory.map(code => (
                   <div key={code.id} className="p-4 bg-white flex justify-between items-start">
                     <div>
                       <p className="font-bold text-gray-800 text-lg">{code.code}</p>
                       <p className="text-gray-600">{code.meaning}</p>
                     </div>
                   </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Library;
