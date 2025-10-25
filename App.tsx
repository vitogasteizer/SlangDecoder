import React, { useState } from 'react';
import Header from './components/Header';
import Search from './components/Search';
import Library from './components/Library';
import { useLanguage } from './contexts/LanguageContext';

export type View = 'search' | 'library';

const App: React.FC = () => {
  const [view, setView] = useState<View>('search');
  const { t } = useLanguage();

  const renderView = () => {
    switch (view) {
      case 'search':
        return <Search />;
      case 'library':
        return <Library />;
      default:
        return <Search />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header currentView={view} setView={setView} />
      <main className="container mx-auto p-4 md:p-8 max-w-3xl">
        {renderView()}
      </main>
      <footer className="text-center mt-12 mb-8 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} {t('footerText')}</p>
      </footer>
    </div>
  );
};

export default App;
