import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { useRecommendations } from '../context/RecommendationContext';
import { IndianLanguage } from '../types/book';
import BookList from '../components/books/BookList';
import BookFilterPanel from '../components/books/BookFilterPanel';
import useBooks from '../hooks/useBooks';
import { useSearchParams } from 'react-router-dom';

const BooksPage: React.FC = () => {
  const { recommendedBooks } = useRecommendations();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Sync search with URL query parameter
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const q = searchParams.get('query') || '';
    if (q && q !== searchQuery) {
      setSearchQuery(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  
  // Get popular books from context or fetch if not available
  const popularBooks = useMemo(() => {
    return recommendedBooks.length > 0 ? recommendedBooks : [];
  }, [recommendedBooks]);
  
  // Use the books hook to manage state and actions
  const {
    books,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategories,
    selectedLanguages,
    toggleCategory,
    toggleLanguage,
    clearAllFilters,
    loadBooks
  } = useBooks(popularBooks);
  
  // Toggle filter panel
  const toggleFilter = useCallback(() => {
    setIsFilterOpen(prev => !prev);
  }, []);
  
  // Close filter panel when filters change
  useEffect(() => {
    if (selectedCategories.length > 0 || selectedLanguages.length > 0) {
      loadBooks();
    }
  }, [selectedCategories, selectedLanguages, loadBooks]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Books</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadBooks()}
              placeholder="Search books..."
              className="w-full md:w-64 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={loadBooks}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          <button
            onClick={toggleFilter}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            aria-label="Open filters"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {(selectedCategories.length > 0 || selectedLanguages.length > 0) && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {selectedCategories.length + selectedLanguages.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <BookFilterPanel
        isOpen={isFilterOpen}
        selectedCategories={selectedCategories}
        selectedLanguages={selectedLanguages}
        onToggleCategory={toggleCategory}
        onToggleLanguage={toggleLanguage}
        onClearAll={clearAllFilters}
        onClose={() => setIsFilterOpen(false)}
      />

      {/* Active Filters */}
      {(selectedCategories.length > 0 || selectedLanguages.length > 0) && (
        <div className="mb-6 flex flex-wrap gap-2">
          {selectedCategories.map(category => (
            <div 
              key={category}
              onClick={() => toggleCategory(category)}
              className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              {category}
            </div>
          ))}
          {selectedLanguages.map(language => {
            const langName = language.charAt(0).toUpperCase() + language.slice(1);
            return (
              <div
                key={language}
                onClick={() => toggleLanguage(language as IndianLanguage)}
                className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium cursor-pointer hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
              >
                {langName}
              </div>
            );
          })}
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Content */}
      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={loadBooks}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No books found matching your filters.</p>
          </div>
        ) : (
          <BookList books={books} loading={loading} error={error} />
        )}
      </div>
    </div>
  );
};

export default BooksPage;