import { Book, IndianLanguage } from '../types/book';
import { searchBooks, getPopularBooks, getBooksByCategory } from '../services/bookService';

export const filterBooks = (
  books: Book[], 
  searchQuery: string, 
  selectedCategories: string[], 
  selectedLanguages: IndianLanguage[]
): Book[] => {
  return books.filter(book => {
    // Search filter
    const matchesSearch = !searchQuery || 
      book.volumeInfo?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.volumeInfo?.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.volumeInfo?.authors?.some(author => 
        author.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Category filter
    const matchesCategories = selectedCategories.length === 0 ||
      book.volumeInfo?.categories?.some(cat => 
        selectedCategories.includes(cat.toLowerCase())
      );

    // Language filter
    const matchesLanguage = selectedLanguages.length === 0 ||
      selectedLanguages.some(selectedLang => {
        const bookLanguage = book.volumeInfo?.language?.toLowerCase();
        if (!bookLanguage) return false;
        
        // Direct match
        if (bookLanguage === selectedLang.toLowerCase()) {
          return true;
        }
        
        // Match by language code
        const bookLangCode = bookLanguage.toLowerCase();
        const selectedLangCode = selectedLang.toLowerCase();
        
        return bookLangCode === selectedLangCode;
      });

    return matchesSearch && matchesCategories && matchesLanguage;
  });
};

export const loadBooks = async (
  searchQuery: string,
  selectedCategories: string[],
  selectedLanguages: IndianLanguage[],
  popularBooks: Book[]
): Promise<{ data: Book[] | null; error: string | null }> => {
  try {
    let results: Book[] = [];
    const languageFilter = selectedLanguages[0];
    
    if (searchQuery.trim()) {
      results = await searchBooks(searchQuery, languageFilter);
    } else if (selectedCategories.length > 0) {
      const categoryResults = await Promise.all(
        selectedCategories.map(cat => getBooksByCategory(cat, languageFilter))
      );
      results = Array.from(new Map(categoryResults.flat().map(book => [book.id, book])).values());
    } else if (popularBooks.length > 0 && selectedLanguages.length === 0) {
      results = popularBooks;
    } else {
      results = await getPopularBooks(languageFilter);
    }
    
    return { data: results, error: null };
  } catch (error) {
    console.error('Error loading books:', error);
    return { data: null, error: 'Failed to load books. Please try again.' };
  }
};
