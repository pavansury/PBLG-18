import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchMoviesByLanguage } from '../services/apiService';
import LanguageSelector from '../components/common/LanguageSelector';
import { useRecommendations } from '../context/RecommendationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const IndianCinemaPage: React.FC = () => {
  const { selectedLanguage, setSelectedLanguage } = useRecommendations();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        const data = await fetchMoviesByLanguage(selectedLanguage, page);
        setMovies(data.results);
        setError(null);
      } catch (err) {
        setError('Failed to load movies. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [selectedLanguage, page]);

  const handleLanguageChange = (languageId: string) => {
    setSelectedLanguage(languageId);
    setPage(1); // Reset to first page when language changes
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Indian Cinema
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Explore movies from different Indian languages
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage error={error} />
        ) : (
          <MovieGrid movies={movies} page={page} setPage={setPage} />
        )}
      </motion.div>
    </div>
  );
};

export default IndianCinemaPage;


const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
    {error}
  </div>
);

const MovieGrid: React.FC<{ movies: any[], page: number, setPage: (page: number) => void }> = ({ movies, page, setPage }) => (
  <>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {movies.map((movie) => (
        <div key={movie.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold">{movie.title || 'Untitled Movie'}</h2>
        </div>
      ))}
    </div>
    <Pagination page={page} setPage={setPage} />
  </>
);

const Pagination: React.FC<{ page: number, setPage: (page: number) => void }> = ({ page, setPage }) => (
  <div className="flex justify-center mt-8 gap-2">
    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 rounded-md bg-indigo-50 text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-900/30 dark:text-indigo-300">
      Previous
    </button>
    <span className="px-4 py-2 text-gray-700 dark:text-gray-300">Page {page}</span>
    <button onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
      Next
    </button>
  </div>
);
