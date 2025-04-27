import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch,
  placeholder = "Search for movies, books..."
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const clearSearch = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className={`relative flex items-center transition-all duration-200 ${
        isFocused ? 'ring-2 ring-primary-400 dark:ring-primary-500' : 'ring-1 ring-gray-300 dark:ring-gray-600'
      } bg-white dark:bg-gray-700 rounded-full`}
    >
      <div className="pl-3 flex-shrink-0 text-gray-400 dark:text-gray-500">
        <Search size={18} />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full py-2 px-3 text-sm text-gray-700 dark:text-gray-200 bg-transparent outline-none"
      />
      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="flex-shrink-0 p-1 mr-1 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
      <button
        type="submit"
        className="ml-1 flex-shrink-0 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-full text-sm font-medium transition-colors"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;