import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, BookOpen, TrendingUp, History } from 'lucide-react';
import { useRecommendations } from '../context/RecommendationContext';
import SearchBar from '../components/common/SearchBar';
import MovieList from '../components/movies/MovieList';
import BookList from '../components/books/BookList';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    recommendedMovies, 
    recommendedBooks, 
    popularMovies, 
    popularBooks, 
    recentlyViewed,
    isLoading
  } = useRecommendations();

  const handleSearch = (query: string) => {
    // Redirect to search page with query
    navigate(`/movies?query=${encodeURIComponent(query)}`);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 text-white py-16 md:py-24">
        <div className="absolute inset-0 opacity-10 bg-repeat" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Discover Your Next Favorite
            </h1>
            <p className="text-lg md:text-xl mb-8 text-primary-100">
              Personalized recommendations for movies and books based on what you love.
            </p>
            <div className="max-w-2xl mx-auto">
              <SearchBar 
                onSearch={handleSearch} 
                placeholder="Search for movies, books, authors..."
              />
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/movies?filter=true')}
                className="flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 px-6 py-3 rounded-full transition-all"
              >
                <Film size={20} />
                <span>Explore Movies</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/books?filter=true')}
                className="flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 px-6 py-3 rounded-full transition-all"
              >
                <BookOpen size={20} />
                <span>Explore Books</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <>
            {/* Recommended Section */}
            {(recommendedMovies.length > 0 || recommendedBooks.length > 0) && (
              <motion.section 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
                className="mb-12"
              >
                <div className="flex items-center mb-6">
                  <TrendingUp size={24} className="text-primary-600 dark:text-primary-400 mr-2" />
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    Recommended For You
                  </h2>
                </div>

                {recommendedMovies.length > 0 && (
                  <div className="mb-10">
                    <MovieList 
                      movies={recommendedMovies.slice(0, 6)} 
                      loading={false}
                      error={null}
                      title="Movies You Might Like"
                    />
                    <div className="mt-4 text-right">
                      <button 
                        onClick={() => navigate('/movies')}
                        className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                      >
                        View all recommendations →
                      </button>
                    </div>
                  </div>
                )}

                {recommendedBooks.length > 0 && (
                  <div>
                    <BookList 
                      books={recommendedBooks.slice(0, 6)} 
                      loading={false}
                      error={null}
                      title="Books You Might Like"
                    />
                    <div className="mt-4 text-right">
                      <button 
                        onClick={() => navigate('/books')}
                        className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                      >
                        View all recommendations →
                      </button>
                    </div>
                  </div>
                )}
              </motion.section>
            )}
            
            {/* Recently Viewed Section */}
            {(recentlyViewed.movies.length > 0 || recentlyViewed.books.length > 0) && (
              <motion.section 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
                className="mb-12"
              >
                <div className="flex items-center mb-6">
                  <History size={24} className="text-primary-600 dark:text-primary-400 mr-2" />
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    Recently Viewed
                  </h2>
                </div>

                {recentlyViewed.movies.length > 0 && (
                  <div className="mb-10">
                    <MovieList 
                      movies={recentlyViewed.movies.slice(0, 6)} 
                      loading={false}
                      error={null}
                      title="Movies"
                    />
                  </div>
                )}

                {recentlyViewed.books.length > 0 && (
                  <div>
                    <BookList 
                      books={recentlyViewed.books.slice(0, 6)} 
                      loading={false}
                      error={null}
                      title="Books"
                    />
                  </div>
                )}
              </motion.section>
            )}
            
            {/* Popular Section */}
            <motion.section 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <div className="flex items-center mb-6">
                <TrendingUp size={24} className="text-primary-600 dark:text-primary-400 mr-2" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Trending Now
                </h2>
              </div>

              <div className="mb-10">
                <MovieList 
                  movies={popularMovies.slice(0, 6)} 
                  loading={false}
                  error={null}
                  title="Popular Movies"
                />
                <div className="mt-4 text-right">
                  <button 
                    onClick={() => navigate('/movies')}
                    className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                  >
                    View all popular movies →
                  </button>
                </div>
              </div>

              <div>
                <BookList 
                  books={popularBooks.slice(0, 6)} 
                  loading={false}
                  error={null}
                  title="Popular Books"
                />
                <div className="mt-4 text-right">
                  <button 
                    onClick={() => navigate('/books')}
                    className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                  >
                    View all popular books →
                  </button>
                </div>
              </div>
            </motion.section>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;