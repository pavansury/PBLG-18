import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { useRecommendations } from '../context/RecommendationContext';
import BookList from '../components/books/BookList';
import SearchBar from '../components/common/SearchBar';
import Badge from '../components/common/Badge';
import { searchBooks, getPopularBooks, getBooksByCategory } from '../services/bookService';
import { Book } from '../types/book';

const BooksPage: React.FC = () => {
  const location = useLocation();
  const { popularBooks } = useRecommendations();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // List of book categories
  const categories = [
    'Fiction',
    'Fantasy',
    'Science Fiction',
    'Mystery',
    'Thriller',
    'Romance',
    'Biography',
    'History',
    'Business',
    'Self-Help',
    'Science',
    'Technology',
    'Art',
    'Philosophy',
    'Poetry',
    'Children',
    'Young Adult',
    'Cookbooks',
    'Travel',
  ];

  useEffect(() => {
    // Check if there's a search query in the URL
    const params = new URLSearchParams(location.search);
    const query = params.get('query');
    
    if (query) {
      setSearchQuery(query);
      handleSearch(query);
    } else {
      // Load popular books if no search query
      loadBooks();
    }
  }, [location.search]);

  useEffect(() => {
    // When category filters change, update results
    if (selectedCategories.length > 0) {
      handleCategoryFilter();
    } else if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      loadBooks();
    }
  }, [selectedCategories]);

  const loadBooks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let results;
      
      // Use cached popular books if available
      if (popularBooks.length > 0) {
        results = popularBooks;
      } else {
        results = await getPopularBooks();
      }
      
      setBooks(results);
    } catch (err) {
      setError('Failed to load books. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadBooks();
      return;
    }
    
    setLoading(true);
    setError(null);
    setSearchQuery(query);
    
    try {
      const results = await searchBooks(query);
      setBooks(results);
    } catch (err) {
      setError('Failed to search books. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async () => {
    if (selectedCategories.length === 0) {
      loadBooks();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // For simplicity, use the first selected category
      const category = selectedCategories[0];
      const results = await getBooksByCategory(category);
      setBooks(results);
    } catch (err) {
      setError('Failed to filter books. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
    loadBooks();
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="bg-primary-900 dark:bg-primary-950 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Books</h1>
          <div className="max-w-2xl">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="Search for books by title, author, or subject..."
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
            
            {selectedCategories.length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Active Filters:
                </h2>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map(category => (
                    <Badge 
                      key={category} 
                      variant="primary"
                      className="cursor-pointer"
                      onClick={() => toggleCategory(category)}
                    >
                      {category} ×
                    </Badge>
                  ))}
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
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge 
                  key={category} 
                  variant={selectedCategories.includes(category) ? 'primary' : 'neutral'}
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}
        
        <BookList 
          books={books} 
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default BooksPage;