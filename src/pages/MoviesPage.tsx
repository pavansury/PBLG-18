import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { useRecommendations } from '../context/RecommendationContext';
import MovieList from '../components/movies/MovieList';
import MovieFilterPanel from '../components/movies/MovieFilterPanel';
import useMovies from '../hooks/useMovies';
import type { IndianLanguage } from '../types/movie';
import { useSearchParams } from 'react-router-dom';

const MoviesPage: React.FC = () => {
  const { popularMovies } = useRecommendations();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Read ?query= from URL and sync with search state
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const q = searchParams.get('query') || '';
    if (q && q !== searchQuery) {
      setSearchQuery(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  
  const {
    movies,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedGenres,
    selectedLanguages,
    toggleGenre,
    toggleLanguage,
    clearAllFilters,
    loadMovies
  } = useMovies(popularMovies);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Movies</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadMovies()}
                placeholder="Search movies..."
                className="w-full md:w-64 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={loadMovies}
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
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedGenres.length > 0 || selectedLanguages.length > 0) && (
          <div className="mb-6 flex flex-wrap gap-2">
            {selectedGenres.map(genre => (
              <div 
                key={genre}
                onClick={() => toggleGenre(genre)}
                className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                {genre}
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
              className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Movie List */}
        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={loadMovies}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No movies found matching your filters.</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <MovieList 
              movies={movies} 
              loading={loading}
              error={error}
              title={searchQuery ? `Results for "${searchQuery}"` : 'Popular Movies'}
            />
          )}
        </div>
      </div>

      {/* Filter Panel */}
      <MovieFilterPanel
        isOpen={isFilterOpen}
        selectedGenres={selectedGenres}
        selectedLanguages={selectedLanguages}
        onToggleGenre={toggleGenre}
        onToggleLanguage={toggleLanguage}
        onClearAll={clearAllFilters}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
};

export default MoviesPage;