import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { useRecommendations } from '../context/RecommendationContext';
import MovieList from '../components/movies/MovieList';
import SearchBar from '../components/common/SearchBar';
import Badge from '../components/common/Badge';
import { searchMovies, getPopularMovies, getMoviesByGenre } from '../services/movieService';
import { Movie } from '../types/movie';

const MoviesPage: React.FC = () => {
  const location = useLocation();
  const { popularMovies } = useRecommendations();
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // List of movie genres
  const genres = [
    { id: '28', name: 'Action' },
    { id: '12', name: 'Adventure' },
    { id: '16', name: 'Animation' },
    { id: '35', name: 'Comedy' },
    { id: '80', name: 'Crime' },
    { id: '99', name: 'Documentary' },
    { id: '18', name: 'Drama' },
    { id: '10751', name: 'Family' },
    { id: '14', name: 'Fantasy' },
    { id: '36', name: 'History' },
    { id: '27', name: 'Horror' },
    { id: '10402', name: 'Music' },
    { id: '9648', name: 'Mystery' },
    { id: '10749', name: 'Romance' },
    { id: '878', name: 'Science Fiction' },
    { id: '10770', name: 'TV Movie' },
    { id: '53', name: 'Thriller' },
    { id: '10752', name: 'War' },
    { id: '37', name: 'Western' },
  ];

  useEffect(() => {
    // Check if there's a search query or filter parameter in the URL
    const params = new URLSearchParams(location.search);
    const query = params.get('query');
    const filter = params.get('filter');
    
    // If filter=true is in the URL, open the filter panel
    if (filter === 'true') {
      setIsFilterOpen(true);
    }
    
    if (query) {
      setSearchQuery(query);
      handleSearch(query);
    } else {
      // Load popular movies if no search query
      loadMovies();
    }
  }, [location.search]);

  useEffect(() => {
    // When genre filters change, update results
    if (selectedGenres.length > 0) {
      handleGenreFilter();
    } else if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      loadMovies();
    }
  }, [selectedGenres]);

  const loadMovies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let results;
      
      // Use cached popular movies if available
      if (popularMovies.length > 0) {
        results = popularMovies;
      } else {
        results = await getPopularMovies();
      }
      
      setMovies(results);
    } catch (err) {
      setError('Failed to load movies. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadMovies();
      return;
    }
    
    setLoading(true);
    setError(null);
    setSearchQuery(query);
    
    try {
      const results = await searchMovies(query);
      setMovies(results);
    } catch (err) {
      setError('Failed to search movies. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreFilter = async () => {
    if (selectedGenres.length === 0) {
      loadMovies();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await getMoviesByGenre(selectedGenres.join(','));
      setMovies(results);
    } catch (err) {
      setError('Failed to filter movies. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev => 
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSearchQuery('');
    loadMovies();
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-primary-900 dark:bg-primary-950 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Movies</h1>
          <div className="max-w-2xl">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="Search for movies by title, actor, or director..."
            />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            {searchQuery && (
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {loading ? 'Searching...' : `Results for "${searchQuery}"`}
              </h2>
            )}
            
            {selectedGenres.length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Active Filters:
                </h2>
                <div className="flex flex-wrap gap-2">
                  {selectedGenres.map(genreId => {
                    const genre = genres.find(g => g.id === genreId);
                    return (
                      <Badge 
                        key={genreId} 
                        variant="primary"
                        className="cursor-pointer"
                        onClick={() => toggleGenre(genreId)}
                      >
                        {genre?.name} ×
                      </Badge>
                    );
                  })}
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <Filter size={18} />
            <span>Filter</span> 
            <SlidersHorizontal size={16} />
          </button>
        </div>
        
        {isFilterOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6"
          >
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => (
                <Badge 
                  key={genre.id} 
                  variant={selectedGenres.includes(genre.id) ? 'primary' : 'neutral'}
                  className="cursor-pointer"
                  onClick={() => toggleGenre(genre.id)}
                >
                  {genre.name}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}
        
        <MovieList 
          movies={movies} 
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default MoviesPage;