import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Menu, X, Film, BookOpen, Sun, Moon, Home, Globe, User } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import { useRecommendations } from '../../context/RecommendationContext';

// Language options for filter with language codes
const LANGUAGES = [
  { value: 'all', label: 'All Languages', code: '' },
  { value: 'hindi', label: 'हिंदी (Hindi)', code: 'hi' },
  { value: 'tamil', label: 'தமிழ் (Tamil)', code: 'ta' },
  { value: 'telugu', label: 'తెలుగు (Telugu)', code: 'te' },
  { value: 'kannada', label: 'ಕನ್ನಡ (Kannada)', code: 'kn' },
  { value: 'malayalam', label: 'മലയാളം (Malayalam)', code: 'ml' },
  { value: 'bengali', label: 'বাংলা (Bengali)', code: 'bn' },
  { value: 'marathi', label: 'मराठी (Marathi)', code: 'mr' },
  { value: 'gujarati', label: 'ગુજરાતી (Gujarati)', code: 'gu' },
  { value: 'punjabi', label: 'ਪੰਜਾਬੀ (Punjabi)', code: 'pa' },
  { value: 'english', label: 'English', code: 'en' },
];



interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  className?: string;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, isActive = false, className = '', onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    } ${className}`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);


const MobileNavLink: React.FC<NavLinkProps> = (props) => (
  <NavLink
    {...props}
    className="text-base px-4 py-3"
  />
);

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [filters, setFilters] = useState({
    language: 'all',
    type: 'all'
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { setSelectedLanguage } = useRecommendations();

  // Initialize filters from URL or localStorage
  useEffect(() => {
    const urlLang = searchParams.get('language');
    const storedLang = localStorage.getItem('preferredLanguage');
    const defaultLang = 'all';
    
    // Priority: URL param > localStorage > default
    const lang = urlLang || (storedLang ? 
      LANGUAGES.find(l => l.code === storedLang)?.value || defaultLang : 
      defaultLang);
      
    const type = searchParams.get('type') || 'all';
    
    console.log('Initializing filters:', { lang, type });
    setFilters({ language: lang, type });
    
    // If we had to use stored language, update URL
    if (!urlLang && storedLang) {
      const params = new URLSearchParams(searchParams);
      params.set('language', lang);
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Update selected language in context when filter changes
  useEffect(() => {
    const language = filters.language === 'all' ? 'all' : LANGUAGES.find(lang => lang.value === filters.language)?.code || '';
    console.log('Setting language to:', language);
    setSelectedLanguage(language);
    // Store selected language in localStorage
    if (language === 'all') {
      localStorage.removeItem('preferredLanguage');
    } else {
      localStorage.setItem('preferredLanguage', language);
    }
  }, [filters.language, setSelectedLanguage]);

  // Update URL and filters
  const updateFilters = useCallback((newFilters: { language?: string; type?: string }) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    const params = new URLSearchParams(searchParams);
    
    // Handle language filter
    if (updatedFilters.language !== 'all') {
      params.set('language', updatedFilters.language);
    } else {
      params.delete('language');
    }
    
    // Handle type filter
    if (updatedFilters.type !== 'all') {
      params.set('type', updatedFilters.type);
      
      // Navigate to the selected type if on home page
      if (location.pathname === '/') {
        navigate(`/${updatedFilters.type}`);
      }
    } else {
      params.delete('type');
    }
    
    setSearchParams(params, { replace: true });
  }, [filters, searchParams, setSearchParams, navigate, location.pathname]);
  
  // Get current language name for display
  const getCurrentLanguageName = () => {
    const lang = LANGUAGES.find(l => l.value === filters.language);
    return lang ? lang.label : 'All Languages';
  };

  // Initialize dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const isActive = (path: string) => location.pathname === path;
  const isMoviePage = location.pathname.startsWith('/movies');
  const isBookPage = location.pathname.startsWith('/books');
  const storedUser = localStorage.getItem('authCurrent');
  const isLoggedIn = Boolean(storedUser);
  const isLoginPage = location.pathname.startsWith('/login');
  const showContentFilters = isMoviePage || isBookPage || location.pathname === '/';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-sm py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center space-x-1 text-xl font-bold text-primary-700 dark:text-primary-300"
              onClick={closeMenu}
            >
              <span className="text-accent-600 dark:text-accent-400">Rec</span>
              <span>X</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-4">
              <nav className="flex items-center space-x-1">
                <NavLink to="/" icon={<Home size={18} />} label="Home" isActive={isActive('/')} />
                <NavLink to="/movies" icon={<Film size={18} />} label="Movies" isActive={isMoviePage} />
                <NavLink to="/books" icon={<BookOpen size={18} />} label="Books" isActive={isBookPage} />
                {isLoggedIn ? (
                  <NavLink to="/profile" icon={<User size={18} />} label="Profile" isActive={location.pathname.startsWith('/profile')} />
                ) : (
                  <NavLink to="/login" icon={<User size={18} />} label="Login" isActive={isLoginPage} />
                )}
                
              </nav>
              
              <div className="hidden lg:block w-64 ml-4">
                <SearchBar onSearch={(q) => navigate(`/movies?query=${encodeURIComponent(q)}`)} />
              </div>
              
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none"
                aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
            
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Language Filter Only */}
          {showContentFilters && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end">
                <div className="relative group">
                  <button 
                    className="flex items-center space-x-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                    onClick={() => document.getElementById('language-dropdown')?.classList.toggle('hidden')}
                  >
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span>{getCurrentLanguageName()}</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div id="language-dropdown" className="hidden absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
                    <div className="py-1">
                      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                        Select Language
                      </div>
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.value}
                          className={`w-full text-left px-4 py-2 text-sm ${filters.language === lang.value 
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          onClick={() => {
                            updateFilters({ language: lang.value });
                            document.getElementById('language-dropdown')?.classList.add('hidden');
                          }}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 bg-white dark:bg-gray-800 z-50 transform ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div className="flex flex-col h-full p-4 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
            <Link 
              to="/" 
              className="text-xl font-bold text-primary-700 dark:text-primary-300"
              onClick={closeMenu}
            >
              <span className="text-accent-600 dark:text-accent-400">Rec</span>X
            </Link>
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 flex flex-col space-y-2 overflow-y-auto">
            <MobileNavLink to="/" icon={<Home size={20} />} label="Home" isActive={isActive('/')} onClick={closeMenu} />
            <MobileNavLink to="/movies" icon={<Film size={20} />} label="Movies" isActive={isMoviePage} onClick={closeMenu} />
            <MobileNavLink to="/books" icon={<BookOpen size={20} />} label="Books" isActive={isBookPage} onClick={closeMenu} />
            {isLoggedIn ? (
            <MobileNavLink to="/profile" icon={<User size={20} />} label="Profile" isActive={location.pathname.startsWith('/profile')} onClick={closeMenu} />
          ) : (
            <MobileNavLink to="/login" icon={<User size={20} />} label="Login" isActive={isLoginPage} onClick={closeMenu} />
          )}
            
          </nav>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
