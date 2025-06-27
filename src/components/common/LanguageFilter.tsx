import React from 'react';
import { IndianLanguage, INDIAN_LANGUAGES } from '../../types/book';

interface LanguageFilterProps {
  selectedLanguages: IndianLanguage[];
  onToggleLanguage: (language: IndianLanguage) => void;
  className?: string;
}

const LanguageFilter: React.FC<LanguageFilterProps> = ({
  selectedLanguages,
  onToggleLanguage,
  className = ''
}) => {
  return (
    <div className={className}>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Languages</h3>
      <div className="flex flex-wrap gap-2">
        {INDIAN_LANGUAGES.map((language) => (
          <button
            key={language.code}
            onClick={() => onToggleLanguage(language.code as IndianLanguage)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedLanguages.includes(language.code as IndianLanguage)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {language.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageFilter;
