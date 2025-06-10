import React from 'react';
import { ChevronDown } from 'lucide-react';

const indianLanguages = [
  { id: 'all', name: 'All Languages' },
  { id: 'hindi', name: 'Hindi' },
  { id: 'tamil', name: 'Tamil' },
  { id: 'telugu', name: 'Telugu' },
  { id: 'malayalam', name: 'Malayalam' },
  { id: 'kannada', name: 'Kannada' },
  { id: 'bengali', name: 'Bengali' },
  { id: 'marathi', name: 'Marathi' },
  { id: 'punjabi', name: 'Punjabi' },
  { id: 'gujarati', name: 'Gujarati' },
  { id: 'odia', name: 'Odia' },
  { id: 'assamese', name: 'Assamese' },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (languageId: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  selectedLanguage, 
  onLanguageChange 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const selectedLanguageObj = indianLanguages.find(lang => lang.id === selectedLanguage) || indianLanguages[0];
  
  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedLanguageObj.name}
        <ChevronDown className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-56 mt-1 bg-white rounded-md shadow-lg dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
          <div className="py-1 max-h-60 overflow-auto" role="menu" aria-orientation="vertical">
            {indianLanguages.map((language) => (
              <button
                key={language.id}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  selectedLanguage === language.id 
                    ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' 
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => {
                  onLanguageChange(language.id);
                  setIsOpen(false);
                }}
                role="menuitem"
              >
                {language.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;