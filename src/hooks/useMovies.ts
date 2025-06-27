import { useState, useCallback, useEffect } from 'react';
import { IndianLanguage } from '../types/book';
import { Movie } from '../types/movie';
import { searchMovies, getPopularMovies, getMoviesByGenre } from '../services/movieService';

const useMovies = (initialMovies: Movie[] = []) => {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<IndianLanguage[]>([]);

  const loadMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let results: Movie[] = [];
      
      if (searchQuery.trim()) {
        // Search movies doesn't accept language filter in the current implementation
        results = await searchMovies(searchQuery);
      } else if (selectedGenres.length > 0) {
        // Get movies by genre (first genre only as per current implementation)
        results = await getMoviesByGenre(selectedGenres[0]);
      } else if (initialMovies.length > 0 && selectedLanguages.length === 0) {
        results = initialMovies;
      } else {
        // Get popular movies (no language filter in current implementation)
        results = await getPopularMovies();
      }
      
      // Apply language filter if any languages are selected
      if (selectedLanguages.length > 0) {
        results = results.filter(movie => 
          selectedLanguages.includes(movie.original_language as IndianLanguage)
        );
      }
      
      setMovies(results);
    } catch (err) {
      setError('Failed to load movies. Please try again.');
      console.error('Error loading movies:', err);
    }
    
    setLoading(false);
  }, [searchQuery, selectedGenres, selectedLanguages, initialMovies]);

  const toggleGenre = useCallback((genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  }, []);

  const toggleLanguage = useCallback((language: IndianLanguage) => {
    setSelectedLanguages(prev => 
      prev.includes(language)
        ? prev.filter(lang => lang !== language)
        : [...prev, language]
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedGenres([]);
    setSelectedLanguages([]);
  }, []);

  // Load movies when filters change
  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  return {
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
    loadMovies,
  };
};

export default useMovies;
