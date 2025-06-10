import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchBooksByLanguage } from '../services/apiService';
import BookCard from '../components/BookCard';
import LanguageSelector from '../components/LanguageSelector';
import { useRecommendations } from '../context/RecommendationContext';

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center">
    <svg
      className="animate-spin h-8 w-8 text-indigo-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
    <span className="sr-only">Loading...</span>
  </div>
);

interface Book {
  id: string;
  title: string;
  author?: string;
  coverImage?: string;
  [key: string]: any;
}

const IndianLiteraturePage: React.FC = () => {
  const { selectedLanguage, setSelectedLanguage } = useRecommendations();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchBooksByLanguage(selectedLanguage, page);
        setBooks(data?.items ?? []);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, [selectedLanguage, page]);

  const handleLanguageChange = (languageId: string) => {
    if (languageId !== selectedLanguage) {
      setSelectedLanguage(languageId);
      setPage(1);
    }
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
              Indian Literature
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover books from various Indian languages
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
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
            {error}
          </div>
        ) : (
          <>
            {books.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  No books found for this language. Try selecting a different language.
                </p>
              </div>
            )}

            <div className="flex justify-center mt-8 gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-md bg-indigo-50 text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-900/30 dark:text-indigo-300"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                Page {page}
              </span>
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="px-4 py-2 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
              >
                Next
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default IndianLiteraturePage;
