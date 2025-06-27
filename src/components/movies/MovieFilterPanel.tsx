import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { IndianLanguage } from '../../types/book';
import LanguageFilter from '../common/LanguageFilter';

interface MovieFilterPanelProps {
  isOpen: boolean;
  selectedGenres: string[];
  selectedLanguages: IndianLanguage[];
  onToggleGenre: (genre: string) => void;
  onToggleLanguage: (language: IndianLanguage) => void;
  onClearAll: () => void;
  onClose: () => void;
}

const MOVIE_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
];

const MovieFilterPanel: React.FC<MovieFilterPanelProps> = ({
  isOpen,
  selectedGenres,
  selectedLanguages,
  onToggleGenre,
  onToggleLanguage,
  onClearAll,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 w-full md:w-96 h-screen bg-white dark:bg-gray-900 shadow-lg overflow-y-auto z-50 p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Movie Filters</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close filters"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Genres Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Genres</h3>
          <div className="flex flex-wrap gap-2">
            {MOVIE_GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => onToggleGenre(genre)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedGenres.includes(genre)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Languages Section */}
        <LanguageFilter
          selectedLanguages={selectedLanguages}
          onToggleLanguage={onToggleLanguage}
        />
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onClearAll}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          Clear All
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </motion.div>
  );
};

export default MovieFilterPanel;
