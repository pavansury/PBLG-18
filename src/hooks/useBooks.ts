import { useState, useCallback, useEffect } from 'react';
import { Book, IndianLanguage } from '../types/book';
import { loadBooks as fetchBooks } from '../utils/bookUtils';

const useBooks = (initialBooks: Book[] = []) => {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<IndianLanguage[]>([]);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await fetchBooks(
      searchQuery,
      selectedCategories,
      selectedLanguages,
      initialBooks
    );
    
    if (data) {
      setBooks(data);
    }
    
    if (error) {
      setError(error);
    }
    
    setLoading(false);
  }, [searchQuery, selectedCategories, selectedLanguages, initialBooks]);

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
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
    setSelectedCategories([]);
    setSelectedLanguages([]);
  }, []);

  // Load books when filters change
  useEffect(() => {
    loadBooks();
  }, [searchQuery, selectedCategories, selectedLanguages, loadBooks]);

  return {
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
    loadBooks,
  };
};

export default useBooks;
