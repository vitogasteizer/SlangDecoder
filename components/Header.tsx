
import React, { useState, useEffect, useRef } from 'react';
import { View } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, lang, setLanguage } = useLanguage();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSetLanguage = (newLang: 'en' | 'es' | 'ka') => {
    setLanguage(newLang);
    setMenuOpen(false);
  };
  
  const handleSetView = (newView: View) => {
    setView(newView);
    setMenuOpen(false);
  }

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="font-bold text-xl text-indigo-600">Decoder</span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button onClick={() => setView('search')} className={`${currentView === 'search' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'} px-3 py-2 rounded-md text-sm font-medium`}>{t('search')}</button>
              <button onClick={() => setView('library')} className={`${currentView === 'library' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'} px-3 py-2 rounded-md text-sm font-medium`}>{t('library')}</button>
               <div className="relative group">
                <button className="text-gray-600 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  <span>{lang.toUpperCase()}</span>
                  <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                 <div className="absolute right-0 mt-2 w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                  <div className="py-1">
                    <button onClick={() => handleSetLanguage('en')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">English</button>
                    <button onClick={() => handleSetLanguage('es')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Español</button>
                    <button onClick={() => handleSetLanguage('ka')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">ქართული</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} type="button" className="bg-gray-200 inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
              <span className="sr-only">Open main menu</span>
              <svg className={`${menuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg className={`${menuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden" id="mobile-menu" ref={menuRef}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button onClick={() => handleSetView('search')} className={`${currentView === 'search' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'} block px-3 py-2 rounded-md text-base font-medium w-full text-left`}>{t('search')}</button>
            <button onClick={() => handleSetView('library')} className={`${currentView === 'library' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'} block px-3 py-2 rounded-md text-base font-medium w-full text-left`}>{t('library')}</button>
             <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="px-2 space-y-1">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('selectLanguage')}</h3>
                    <button onClick={() => handleSetLanguage('en')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-200">English</button>
                    <button onClick={() => handleSetLanguage('es')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-200">Español</button>
                    <button onClick={() => handleSetLanguage('ka')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-200">ქართული</button>
                </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;