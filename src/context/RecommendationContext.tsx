import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Movie } from '../types/movie';
import { Book } from '../types/book';
import { getPopularMovies, getMovieRecommendations } from '../services/movieService';
import { getPopularBooks, getBookRecommendations } from '../services/bookService';

interface RecommendationContextType {
  recentlyViewed: {
    movies: Movie[];
    books: Book[];
  };
  recommendedMovies: Movie[];
  recommendedBooks: Book[];
  popularMovies: Movie[];
  popularBooks: Book[];
  isLoading: boolean;
  addToRecentlyViewed: (item: Movie | Book, type: 'movie' | 'book') => void;
  loadRecommendations: () => void;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  getContentByLanguage: (contentType: 'movies' | 'books') => any[];
  setMovies: (movies: Movie[]) => void;
  setBooks: (books: Book[]) => void;
}

const RecommendationContext = createContext<RecommendationContextType | undefined>(undefined);

export const RecommendationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState<{
    movies: Movie[];
    books: Book[];
  }>({
    movies: [],
    books: []
  });
  
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    localStorage.getItem('preferredLanguage') || 'all'
  );

  // Load recently viewed from localStorage on initial render
  useEffect(() => {
    const storedMovies = localStorage.getItem('recentlyViewedMovies');
    const storedBooks = localStorage.getItem('recentlyViewedBooks');
    
    if (storedMovies) {
      try {
        setRecentlyViewed(prev => ({
          ...prev,
          movies: JSON.parse(storedMovies)
        }));
      } catch (error) {
        console.error('Failed to parse recently viewed movies from localStorage', error);
      }
    }
    
    if (storedBooks) {
      try {
        setRecentlyViewed(prev => ({
          ...prev,
          books: JSON.parse(storedBooks)
        }));
      } catch (error) {
        console.error('Failed to parse recently viewed books from localStorage', error);
      }
    }
  }, []);

  // Load recommendations on mount or when selectedLanguage changes
  useEffect(() => {
    loadRecommendations();
  }, [selectedLanguage]);

  // Update localStorage when recently viewed changes
  useEffect(() => {
    localStorage.setItem('recentlyViewedMovies', JSON.stringify(recentlyViewed.movies));
    localStorage.setItem('recentlyViewedBooks', JSON.stringify(recentlyViewed.books));
  }, [recentlyViewed]);

  // Save language preference to local storage
  useEffect(() => {
    localStorage.setItem('preferredLanguage', selectedLanguage);
  }, [selectedLanguage]);

  const addToRecentlyViewed = (item: Movie | Book, type: 'movie' | 'book') => {
    setRecentlyViewed(prev => {
      if (type === 'movie') {
        const movie = item as Movie;
        // Remove if exists and add to beginning
        const filtered = prev.movies.filter(m => m.id !== movie.id);
        const updatedMovies = [movie, ...filtered].slice(0, 10); // Keep only 10 most recent
        
        return {
          ...prev,
          movies: updatedMovies
        };
      } else {
        const book = item as Book;
        // Remove if exists and add to beginning
        const filtered = prev.books.filter(b => b.id !== book.id);
        const updatedBooks = [book, ...filtered].slice(0, 10); // Keep only 10 most recent
        
        return {
          ...prev,
          books: updatedBooks
        };
      }
    });
  };

  const loadRecommendations = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Load popular content with selected language
      const language = selectedLanguage === 'all' ? undefined : selectedLanguage;
      console.log('Loading recommendations with language:', language || 'all');
      
      const [moviesResponse, booksResponse] = await Promise.all([
        language ? getPopularMovies(language) : getPopularMovies(),
        language ? getPopularBooks(language) : getPopularBooks()
      ]);
      
      setPopularMovies(moviesResponse);
      setPopularBooks(booksResponse);
      
      // If user has previously viewed items, get recommendations based on them
      if (recentlyViewed.movies.length > 0) {
        const movieRecommendations = await getMovieRecommendations(
          recentlyViewed.movies[0].id
        );
        setRecommendedMovies(movieRecommendations);
      } else {
        setRecommendedMovies(moviesResponse.slice(0, 6)); // Use popular as recommendations
      }
      
      // Since the Google Books API doesn't have a direct recommendation endpoint,
      // we'll use a similar genre/author approach in the service
      if (recentlyViewed.books.length > 0 && recentlyViewed.books[0].volumeInfo) {
        const bookRecommendations = await getBookRecommendations(
          recentlyViewed.books[0].volumeInfo.categories?.[0] || '',
          recentlyViewed.books[0].volumeInfo.authors?.[0] || ''
        );
        setRecommendedBooks(bookRecommendations);
      } else {
        setRecommendedBooks(booksResponse.slice(0, 6)); // Use popular as recommendations
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLanguage, recentlyViewed]);

  // Filter content by selected language
  const getContentByLanguage = (contentType: 'movies' | 'books') => {
    const allContent = contentType === 'movies' ? popularMovies : popularBooks;
    
    if (selectedLanguage === 'all') {
      return allContent;
    }
    
    return allContent.filter(item => {
      if (contentType === 'movies') {
        // Assuming Movie has a 'original_language' property
        return (item as Movie).original_language === selectedLanguage;
      } else {
        // For Book, language is usually under volumeInfo.language
        return (item as Book).volumeInfo?.language === selectedLanguage;
      }
    });
  };

  return (
    <RecommendationContext.Provider
      value={{
        recentlyViewed,
        recommendedMovies,
        recommendedBooks,
        popularMovies,
        popularBooks,
        isLoading,
        addToRecentlyViewed,
        loadRecommendations,
        selectedLanguage,
        setSelectedLanguage,
        getContentByLanguage,
        setMovies: setPopularMovies,
        setBooks: setPopularBooks,
      }}
    >
      {children}
    </RecommendationContext.Provider>
  );
};

export const useRecommendations = () => {
  const context = useContext(RecommendationContext);
  if (context === undefined) {
    throw new Error('useRecommendations must be used within a RecommendationProvider');
  }
  return context;
};

export default RecommendationContext;